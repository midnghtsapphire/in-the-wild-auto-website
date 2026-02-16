import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint, json, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  plan: mysqlEnum("plan", ["free", "pro", "business"]).default("free").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  tokensUsed: int("tokensUsed").default(0).notNull(),
  tokensQuota: int("tokensQuota").default(50000).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects — each generated website/micro-app
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  prompt: text("prompt").notNull(),
  status: mysqlEnum("status", ["generating", "verifying", "ready", "deployed", "failed"]).default("generating").notNull(),
  generatedHtml: text("generatedHtml"),
  generatedCss: text("generatedCss"),
  generatedJs: text("generatedJs"),
  framework: varchar("framework", { length: 64 }).default("html"),
  deployUrl: varchar("deployUrl", { length: 512 }),
  deploySlug: varchar("deploySlug", { length: 128 }),
  customDomain: varchar("customDomain", { length: 255 }),
  verificationScore: int("verificationScore"),
  verificationNotes: text("verificationNotes"),
  totalTokens: int("totalTokens").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Generations — individual LLM calls for a project (parallel model results)
 */
export const generations = mysqlTable("generations", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  prompt: text("prompt").notNull(),
  response: text("response"),
  tokensInput: int("tokensInput").default(0),
  tokensOutput: int("tokensOutput").default(0),
  totalTokens: int("totalTokens").default(0),
  latencyMs: int("latencyMs"),
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  error: text("error"),
  chosenAsWinner: int("chosenAsWinner").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = typeof generations.$inferInsert;

/**
 * Token usage tracking per period
 */
export const tokenUsage = mysqlTable("tokenUsage", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tokensUsed: int("tokensUsed").default(0).notNull(),
  model: varchar("model", { length: 128 }),
  action: varchar("action", { length: 64 }),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TokenUsage = typeof tokenUsage.$inferSelect;

/**
 * Template marketplace
 */
export const templates = mysqlTable("templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 64 }).default("general"),
  tags: text("tags"),
  prompt: text("prompt"),
  generatedHtml: text("generatedHtml"),
  generatedCss: text("generatedCss"),
  generatedJs: text("generatedJs"),
  thumbnailUrl: varchar("thumbnailUrl", { length: 512 }),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  isFree: int("isFree").default(1),
  downloads: int("downloads").default(0),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"),
  isPublished: int("isPublished").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = typeof templates.$inferInsert;

/**
 * Site analytics for deployed projects
 */
export const siteAnalytics = mysqlTable("siteAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  date: timestamp("date").notNull(),
  pageViews: int("pageViews").default(0),
  uniqueVisitors: int("uniqueVisitors").default(0),
  avgSessionDuration: int("avgSessionDuration").default(0),
  bounceRate: decimal("bounceRate", { precision: 5, scale: 2 }).default("0.00"),
  topPages: text("topPages"),
  referrers: text("referrers"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SiteAnalytics = typeof siteAnalytics.$inferSelect;

/**
 * Subscriptions / billing history
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plan: mysqlEnum("plan", ["free", "pro", "business"]).default("free").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: int("cancelAtPeriodEnd").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
