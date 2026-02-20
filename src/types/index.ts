// ─── Data Provider Types ───────────────────────────────────────────────

export interface Headline {
  sourceId: string;
  url: string;
  publisher: string;
  headline: string;
  publishedAt: string;
  snippet: string;
}

export interface Quote {
  ticker: string;
  price: number;
  changePct: number;
  volume: number;
  capturedAt: string;
}

export interface FilingSummary {
  ticker: string;
  filingType: string;
  filingDate: string;
  url: string;
  title: string;
  summary: string;
}

export interface MacroDataPoint {
  date: string;
  value: number;
}

export interface MacroData {
  series: string;
  description: string;
  data: MacroDataPoint[];
}

// ─── Story Types ───────────────────────────────────────────────────────

export interface StoryCard {
  storyId: string;
  canonicalTitle: string;
  summary: string | null;
  impactScore: number;
  sector: string | null;
  sourceCount: number;
  createdAt: string;
  entities: EntityTag[];
  sources: SourceRef[];
}

export interface EntityTag {
  entityType: "ticker" | "person" | "org" | "topic";
  entityValue: string;
}

export interface SourceRef {
  publisher: string;
  url: string;
  headline: string;
}

// ─── Event Types ───────────────────────────────────────────────────────

export interface CalendarEvent {
  eventId: string;
  eventType: "earnings" | "fomc" | "cpi" | "jobs" | "gdp";
  ticker: string | null;
  eventDate: string;
  description: string | null;
}

// ─── Alert Types ───────────────────────────────────────────────────────

export interface AlertItem {
  alertId: string;
  storyId: string | null;
  ticker: string | null;
  triggerType: "news" | "price_move";
  triggeredAt: string;
  dismissed: boolean;
  storyTitle?: string;
}

// ─── Chat Types ────────────────────────────────────────────────────────

export interface ChatMessage {
  messageId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface ChatSession {
  sessionId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Data Provider Interface ───────────────────────────────────────────

export interface DataProvider {
  fetchHeadlines(): Promise<Headline[]>;
  fetchQuote(ticker: string): Promise<Quote | null>;
  fetchFilingSummary(
    ticker: string,
    filingType: string
  ): Promise<FilingSummary | null>;
  fetchMacroData(series: string): Promise<MacroData | null>;
}

// ─── RSS Feed Config ───────────────────────────────────────────────────

export interface RSSFeedConfig {
  name: string;
  url: string;
  publisher: string;
}
