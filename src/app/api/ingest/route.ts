import { NextResponse } from "next/server";
import { ingestAllFeeds } from "@/services/rss-ingestion";
import { clusterStories } from "@/services/story-clustering";
import { extractEntitiesForNewStories } from "@/services/entity-extraction";
import { analyzeImpactForNewStories } from "@/services/impact-analysis";

export async function POST() {
  try {
    // Step 1: Ingest RSS feeds
    const headlines = await ingestAllFeeds();

    // Step 2: Extract entities (tickers, people, orgs, topics)
    const entitiesProcessed = await extractEntitiesForNewStories();

    // Step 3: Analyze impact factors, exposure mechanisms, and narratives
    const impactAnalyzed = await analyzeImpactForNewStories();

    // Step 4: Cluster similar stories (with contradiction detection)
    const mergeCount = await clusterStories();

    return NextResponse.json({
      success: true,
      headlinesIngested: headlines.length,
      entitiesProcessed,
      impactAnalyzed,
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
