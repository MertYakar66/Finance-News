import { db } from "@/db";
import { stories, storySources, storyEntities } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

// Jaccard similarity on word tokens
function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = new Set([...a].filter((x) => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

const SIMILARITY_THRESHOLD = 0.35;
const TIME_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours

export async function clusterStories(): Promise<number> {
  // Get all stories that are standalone (source_count = 1) from the last 24h
  const cutoff = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  ).toISOString();

  const recentStories = await db.query.stories.findMany({
    where: sql`${stories.createdAt} > ${cutoff}`,
    orderBy: [desc(stories.createdAt)],
  });

  let mergeCount = 0;

  // Compare each pair
  for (let i = 0; i < recentStories.length; i++) {
    const storyA = recentStories[i];
    if (!storyA.canonicalTitle) continue;

    const tokensA = tokenize(storyA.canonicalTitle);
    const timeA = new Date(storyA.createdAt).getTime();

    for (let j = i + 1; j < recentStories.length; j++) {
      const storyB = recentStories[j];
      if (!storyB.canonicalTitle) continue;

      const timeB = new Date(storyB.createdAt).getTime();
      if (Math.abs(timeA - timeB) > TIME_WINDOW_MS) continue;

      const tokensB = tokenize(storyB.canonicalTitle);
      const sim = jaccardSimilarity(tokensA, tokensB);

      if (sim >= SIMILARITY_THRESHOLD) {
        // Merge B into A
        await db
          .update(storySources)
          .set({ storyId: storyA.storyId })
          .where(eq(storySources.storyId, storyB.storyId));

        await db
          .update(storyEntities)
          .set({ storyId: storyA.storyId })
          .where(eq(storyEntities.storyId, storyB.storyId));

        // Update source count
        const sources = await db.query.storySources.findMany({
          where: eq(storySources.storyId, storyA.storyId),
        });

        await db
          .update(stories)
          .set({
            sourceCount: sources.length,
            impactScore: sources.length * (1 / (1 + (Date.now() - timeA) / 3600000)),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(stories.storyId, storyA.storyId));

        // Delete merged story
        await db
          .delete(stories)
          .where(eq(stories.storyId, storyB.storyId));

        mergeCount++;
      }
    }
  }

  return mergeCount;
}
