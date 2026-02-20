"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  RefreshCw,
  ExternalLink,
  Clock,
  Layers,
  Filter,
} from "lucide-react";
import type { StoryCard } from "@/types";

const SECTORS = [
  "All",
  "Technology",
  "Financials",
  "Energy",
  "Healthcare",
  "Consumer",
  "Macro",
  "General",
];

export default function FeedPage() {
  const [stories, setStories] = useState<StoryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState(false);
  const [selectedSector, setSelectedSector] = useState("All");

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (selectedSector !== "All") {
        params.set("sector", selectedSector);
      }
      const res = await fetch(`/api/stories?${params}`);
      const data = await res.json();
      setStories(data);
    } catch (err) {
      console.error("Failed to fetch stories:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSector]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleIngest = async () => {
    setIngesting(true);
    try {
      const res = await fetch("/api/ingest", { method: "POST" });
      const data = await res.json();
      console.log("Ingestion result:", data);
      await fetchStories();
    } catch (err) {
      console.error("Ingestion failed:", err);
    } finally {
      setIngesting(false);
    }
  };

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            News Feed
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {stories.length} stories from financial news sources
          </p>
        </div>
        <Button
          onClick={handleIngest}
          disabled={ingesting}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${ingesting ? "animate-spin" : ""}`}
          />
          {ingesting ? "Ingesting..." : "Refresh Feeds"}
        </Button>
      </div>

      {/* Sector Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-zinc-400" />
        {SECTORS.map((sector) => (
          <Button
            key={sector}
            variant={selectedSector === sector ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedSector(sector)}
            className="whitespace-nowrap"
          >
            {sector}
          </Button>
        ))}
      </div>

      {/* Story Cards */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-zinc-500 dark:text-zinc-400">
              No stories yet. Click &quot;Refresh Feeds&quot; to ingest news from
              RSS sources.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <Card
              key={story.storyId}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base leading-snug">
                    {story.canonicalTitle}
                  </CardTitle>
                  <div className="flex shrink-0 items-center gap-1 text-xs text-zinc-400">
                    <Clock className="h-3 w-3" />
                    {timeAgo(story.createdAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {story.summary && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {story.summary}
                  </p>
                )}

                {/* Entity tags */}
                <div className="flex flex-wrap gap-1.5">
                  {story.entities
                    .filter((e) => e.entityType === "ticker")
                    .map((e) => (
                      <Link
                        key={e.entityValue}
                        href={`/ticker/${e.entityValue}`}
                      >
                        <Badge variant="ticker" className="cursor-pointer">
                          ${e.entityValue}
                        </Badge>
                      </Link>
                    ))}
                  {story.sector && (
                    <Badge variant="secondary">{story.sector}</Badge>
                  )}
                  {story.sourceCount > 1 && (
                    <Badge variant="outline">
                      <Layers className="mr-1 h-3 w-3" />
                      {story.sourceCount} sources
                    </Badge>
                  )}
                </div>

                {/* Sources */}
                {story.sources.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {story.sources.slice(0, 3).map((source, idx) => (
                      <a
                        key={idx}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {source.publisher}
                      </a>
                    ))}
                  </div>
                )}

                {/* Research button */}
                <div className="pt-1">
                  <Link
                    href={`/research?story=${story.storyId}&title=${encodeURIComponent(story.canonicalTitle)}`}
                  >
                    <Button variant="ghost" size="sm" className="text-xs">
                      Research this story
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
