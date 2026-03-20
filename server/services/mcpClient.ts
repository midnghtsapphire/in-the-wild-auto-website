/**
 * MCP Microservice Client
 * HTTP client layer for calling InTheWild platform MCP modules.
 * Each MCP service exposes REST endpoints at its container URL.
 *
 * Services (from github.com/MIDNGHTSAPPHIRE):
 *   MCP-WEBSITE-GENERATOR  — website & app code generation
 *   MCP-ANALYTICS          — analytics events and reports
 *   MCP-PAYMENT            — Stripe payment processing
 *   MCP-SEO-ACCESSIBILITY  — SEO optimization and accessibility checks
 *   MCP-CODE-REVIEW        — AI-powered code review
 *   MCP-AI-CHAT            — conversational AI chat
 */

const MCP_URLS = {
  websiteGenerator: process.env.MCP_WEBSITE_GENERATOR_URL || "http://mcp-website-generator:3000",
  analytics: process.env.MCP_ANALYTICS_URL || "http://mcp-analytics:3000",
  payment: process.env.MCP_PAYMENT_URL || "http://mcp-payment:3000",
  seo: process.env.MCP_SEO_URL || "http://mcp-seo-accessibility:3000",
  codeReview: process.env.MCP_CODE_REVIEW_URL || "http://mcp-code-review:3000",
  aiChat: process.env.MCP_AI_CHAT_URL || "http://mcp-ai-chat:3000",
} as const;

type McpService = keyof typeof MCP_URLS;

async function mcpPost<T = unknown>(
  service: McpService,
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const url = `${MCP_URLS[service]}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err: any) {
    throw new Error(`MCP ${service} ${path} unreachable: ${err.message}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`MCP ${service} ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

async function mcpGet<T = unknown>(service: McpService, path: string): Promise<T> {
  const url = `${MCP_URLS[service]}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err: any) {
    throw new Error(`MCP ${service} GET ${path} unreachable: ${err.message}`);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`MCP ${service} GET ${path} failed (${res.status}): ${text}`);
  }
  return res.json() as Promise<T>;
}

// ─── Website Generator ────────────────────────────────────────────────────────

export interface McpGenerateWebsiteResult {
  websiteUrl?: string;
  html?: string;
  css?: string;
  js?: string;
}

export async function mcpGenerateWebsite(content: string): Promise<McpGenerateWebsiteResult> {
  return mcpPost<McpGenerateWebsiteResult>("websiteGenerator", "/websites", { content });
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface McpAnalyticsEvent {
  projectId: number | string;
  event: string;
  properties?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function mcpTrackEvent(event: McpAnalyticsEvent): Promise<void> {
  await mcpPost("analytics", "/events", event).catch(err =>
    console.warn("[MCP Analytics] Failed to track event:", err.message)
  );
}

export interface McpAnalyticsReport {
  pageViews: number;
  uniqueVisitors: number;
  sessions: number;
  bounceRate: number;
  topPages: { path: string; views: number }[];
}

export async function mcpGetAnalytics(projectId: number | string): Promise<McpAnalyticsReport | null> {
  return mcpGet<McpAnalyticsReport>("analytics", `/reports/${projectId}`).catch(err => {
    console.warn("[MCP Analytics] Failed to get report:", err.message);
    return null;
  });
}

// ─── Payment ──────────────────────────────────────────────────────────────────

export interface McpCheckoutResult {
  sessionId: string;
  checkoutUrl: string;
}

export async function mcpCreateCheckout(
  userId: number,
  planId: string,
  email: string
): Promise<McpCheckoutResult> {
  return mcpPost<McpCheckoutResult>("payment", "/checkout", { userId, planId, email });
}

export async function mcpGetSubscription(userId: number) {
  return mcpGet("payment", `/subscriptions/${userId}`).catch(() => null);
}

// ─── SEO & Accessibility ──────────────────────────────────────────────────────

export interface McpSeoResult {
  title: string;
  description: string;
  keywords: string[];
  ogTags: Record<string, string>;
  structuredData: string;
  accessibilityScore: number;
  accessibilityIssues: string[];
}

export async function mcpOptimizeSeo(
  html: string,
  siteName: string,
  keywords: string[]
): Promise<McpSeoResult | null> {
  return mcpPost<McpSeoResult>("seo", "/optimize", { html, siteName, keywords }).catch(err => {
    console.warn("[MCP SEO] Failed to optimize:", err.message);
    return null;
  });
}

// ─── Code Review ─────────────────────────────────────────────────────────────

export interface McpCodeReviewResult {
  score: number;
  issues: { severity: "error" | "warning" | "info"; message: string; line?: number }[];
  suggestions: string[];
  securityIssues: string[];
}

export async function mcpReviewCode(
  code: string,
  language: string
): Promise<McpCodeReviewResult | null> {
  return mcpPost<McpCodeReviewResult>("codeReview", "/review", { code, language }).catch(err => {
    console.warn("[MCP Code Review] Failed to review code:", err.message);
    return null;
  });
}

// ─── AI Chat ─────────────────────────────────────────────────────────────────

export interface McpChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface McpChatResult {
  message: string;
  tokens: number;
}

export async function mcpChat(
  messages: McpChatMessage[],
  systemPrompt?: string
): Promise<McpChatResult | null> {
  return mcpPost<McpChatResult>("aiChat", "/chat", { messages, systemPrompt }).catch(err => {
    console.warn("[MCP AI Chat] Failed:", err.message);
    return null;
  });
}
