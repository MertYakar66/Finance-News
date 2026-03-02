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

// ─── Terminal Types ───────────────────────────────────────────────────

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
  change: number;
}

// ─── Options Engine Types (smart-wheel-engine) ────────────────────────

export interface WheelTrade {
  ticker: string;
  strategy: "short_put" | "covered_call";
  strike: number;
  expiration: string;
  premium: number;
  probability: number;
  expectedPnL: number;
  maxLoss: number;
  iv: number;
  delta: number;
  score: number;
}

export interface MarketRegime {
  regime: "BULL" | "BEAR" | "NEUTRAL" | "HIGH_VOL";
  vix: number;
  trendScore: number;
  confidence: number;
}

export interface OptionsPortfolio {
  openPositions: number;
  totalPremiumCollected: number;
  winRate: number;
  avgDaysHeld: number;
}

// ─── Local Agent Types ────────────────────────────────────────────────

export interface AgentTask {
  id: string;
  description: string;
  status: "queued" | "running" | "completed" | "failed";
  startedAt?: string;
  completedAt?: string;
}

export interface AgentStatus {
  online: boolean;
  model: string;
  vramUsage: number;
  vramTotal: number;
  ramUsage: number;
  activeTabs: number;
  tasksCompleted: number;
  uptime: string;
}

// ─── Terminal Command Types ───────────────────────────────────────────

export interface TerminalCommand {
  command: string;
  description: string;
  action: string;
}
