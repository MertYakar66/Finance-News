import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ─── Stories ───────────────────────────────────────────────────────────
export const stories = sqliteTable("stories", {
  storyId: text("story_id").primaryKey(),
  canonicalTitle: text("canonical_title").notNull(),
  summary: text("summary"),
  impactScore: real("impact_score").default(0),
  sector: text("sector"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  sourceCount: integer("source_count").default(1),
  // ─── Story Graph Intelligence fields ──────────────────────────────
  impactTags: text("impact_tags"),           // JSON: ["rates","oil","fx","regulation","earnings"]
  exposureMechanisms: text("exposure_mechanisms"), // JSON: [{"factor":"rates","direction":"negative","confidence":0.8}]
  impactHorizon: text("impact_horizon"),     // "intraday" | "days" | "weeks" | "quarters"
  storyStatus: text("story_status").default("developing"), // "developing" | "evolving" | "resolved"
  contradictionFlag: integer("contradiction_flag").default(0),
  firstSeenAt: text("first_seen_at"),
  whyItMatters: text("why_it_matters"),      // AI-generated narrative
  corroborationScore: real("corroboration_score").default(0), // 0-1 multi-source agreement
});

// ─── Story Sources ─────────────────────────────────────────────────────
export const storySources = sqliteTable("story_sources", {
  sourceId: text("source_id").primaryKey(),
  storyId: text("story_id").references(() => stories.storyId),
  url: text("url").notNull(),
  publisher: text("publisher"),
  headline: text("headline").notNull(),
  publishedAt: text("published_at"),
  snippet: text("snippet"),
  retrievalProvider: text("retrieval_provider").default("rss"), // "rss" | "valyu" | "manual"
  rightsRestricted: integer("rights_restricted").default(0),
  sentiment: text("sentiment"),              // "positive" | "negative" | "neutral" | "mixed"
  geography: text("geography"),              // country/region code
});

// ─── Story Entities ────────────────────────────────────────────────────
export const storyEntities = sqliteTable("story_entities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  storyId: text("story_id").references(() => stories.storyId),
  entityType: text("entity_type").notNull(), // ticker | person | org | topic | factor
  entityValue: text("entity_value").notNull(),
});

// ─── Story Timeline ───────────────────────────────────────────────────
export const storyTimeline = sqliteTable("story_timeline", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  storyId: text("story_id").references(() => stories.storyId),
  eventType: text("event_type").notNull(),   // "created" | "source_added" | "merged" | "status_change" | "contradiction_detected"
  description: text("description").notNull(),
  metadata: text("metadata"),                // JSON: additional data
  occurredAt: text("occurred_at").notNull(),
});

// ─── User Exposures (for exposure-first ranking) ──────────────────────
export const userExposures = sqliteTable("user_exposures", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  exposureType: text("exposure_type").notNull(), // "ticker" | "sector" | "factor" | "country" | "theme"
  exposureValue: text("exposure_value").notNull(),
  weight: real("weight").default(1),             // importance weight for ranking
  addedAt: text("added_at").notNull(),
});

// ─── Market Snapshots ──────────────────────────────────────────────────
export const marketSnapshots = sqliteTable("market_snapshots", {
  snapshotId: text("snapshot_id").primaryKey(),
  ticker: text("ticker").notNull(),
  price: real("price"),
  changePct: real("change_pct"),
  volume: integer("volume"),
  capturedAt: text("captured_at").notNull(),
});

// ─── Watchlists ────────────────────────────────────────────────────────
export const watchlists = sqliteTable("watchlists", {
  ticker: text("ticker").primaryKey(),
  addedAt: text("added_at").notNull(),
  alertThresholdPct: real("alert_threshold_pct").default(5),
});

// ─── Events ────────────────────────────────────────────────────────────
export const events = sqliteTable("events", {
  eventId: text("event_id").primaryKey(),
  eventType: text("event_type").notNull(), // earnings | fomc | cpi | jobs | gdp
  ticker: text("ticker"),
  eventDate: text("event_date").notNull(),
  description: text("description"),
});

// ─── Alerts ────────────────────────────────────────────────────────────
export const alerts = sqliteTable("alerts", {
  alertId: text("alert_id").primaryKey(),
  storyId: text("story_id").references(() => stories.storyId),
  ticker: text("ticker"),
  triggerType: text("trigger_type").notNull(), // news | price_move
  triggeredAt: text("triggered_at").notNull(),
  dismissed: integer("dismissed").default(0),
});

// ─── Chat Sessions ─────────────────────────────────────────────────────
export const chatSessions = sqliteTable("chat_sessions", {
  sessionId: text("session_id").primaryKey(),
  title: text("title"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ─── Messages ──────────────────────────────────────────────────────────
export const messages = sqliteTable("messages", {
  messageId: text("message_id").primaryKey(),
  sessionId: text("session_id").references(() => chatSessions.sessionId),
  role: text("role").notNull(), // user | assistant | system
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});
