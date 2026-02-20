import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

let _db: BetterSQLite3Database<typeof schema> | null = null;

function initDb(): BetterSQLite3Database<typeof schema> {
  if (_db) return _db;

  const DATA_DIR = path.join(process.cwd(), "data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const DB_PATH = path.join(DATA_DIR, "finance-news.db");
  const sqlite = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("busy_timeout = 5000");

  // Initialize tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS stories (
      story_id TEXT PRIMARY KEY,
      canonical_title TEXT NOT NULL,
      summary TEXT,
      impact_score REAL DEFAULT 0,
      sector TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      source_count INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS story_sources (
      source_id TEXT PRIMARY KEY,
      story_id TEXT REFERENCES stories(story_id),
      url TEXT NOT NULL,
      publisher TEXT,
      headline TEXT NOT NULL,
      published_at TEXT,
      snippet TEXT
    );

    CREATE TABLE IF NOT EXISTS story_entities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_id TEXT REFERENCES stories(story_id),
      entity_type TEXT NOT NULL,
      entity_value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS market_snapshots (
      snapshot_id TEXT PRIMARY KEY,
      ticker TEXT NOT NULL,
      price REAL,
      change_pct REAL,
      volume INTEGER,
      captured_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS watchlists (
      ticker TEXT PRIMARY KEY,
      added_at TEXT NOT NULL,
      alert_threshold_pct REAL DEFAULT 5
    );

    CREATE TABLE IF NOT EXISTS events (
      event_id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      ticker TEXT,
      event_date TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      alert_id TEXT PRIMARY KEY,
      story_id TEXT REFERENCES stories(story_id),
      ticker TEXT,
      trigger_type TEXT NOT NULL,
      triggered_at TEXT NOT NULL,
      dismissed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      session_id TEXT PRIMARY KEY,
      title TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      message_id TEXT PRIMARY KEY,
      session_id TEXT REFERENCES chat_sessions(session_id),
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_story_sources_story ON story_sources(story_id);
    CREATE INDEX IF NOT EXISTS idx_story_entities_story ON story_entities(story_id);
    CREATE INDEX IF NOT EXISTS idx_story_entities_value ON story_entities(entity_value);
    CREATE INDEX IF NOT EXISTS idx_market_snapshots_ticker ON market_snapshots(ticker);
    CREATE INDEX IF NOT EXISTS idx_alerts_ticker ON alerts(ticker);
    CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
  `);

  _db = drizzle(sqlite, { schema });
  return _db;
}

// Lazy getter — DB is only initialized on first access
export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop, receiver) {
    const realDb = initDb();
    return Reflect.get(realDb, prop, receiver);
  },
});
