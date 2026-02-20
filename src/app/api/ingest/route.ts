import { NextResponse } from "next/server";
import { ingestAllFeeds } from "@/services/rss-ingestion";
import { clusterStories } from "@/services/story-clustering";
import { extractEntitiesForNewStories } from "@/services/entity-extraction";

export async function POST() {
  try {
    // Step 1: Ingest RSS feeds
    const headlines = await ingestAllFeeds();

    // Step 2: Extract entities
    const entitiesProcessed = await extractEntitiesForNewStories();

    // Step 3: Cluster similar stories
    const mergeCount = await clusterStories();

    return NextResponse.json({
      success: true,
      headlinesIngested: headlines.length,
      entitiesProcessed,
      storiesMerged: mergeCount,
    });
  } catch (error) {
    console.error("Ingestion failed:", error);
    return NextResponse.json(
      { success: false, error: "Ingestion failed" },
      { status: 500 }
    );
  }
}
