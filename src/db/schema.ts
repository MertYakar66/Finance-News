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
});

// ─── Story Entities ────────────────────────────────────────────────────
export const storyEntities = sqliteTable("story_entities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  storyId: text("story_id").references(() => stories.storyId),
  entityType: text("entity_type").notNull(), // ticker | person | org | topic
  entityValue: text("entity_value").notNull(),
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
