import { eq, desc, and, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  projects, InsertProject, Project,
  generations, InsertGeneration,
  tokenUsage,
  templates, InsertTemplate,
  siteAnalytics,
  subscriptions,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserTokens(userId: number, tokensToAdd: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ tokensUsed: sql`${users.tokensUsed} + ${tokensToAdd}` }).where(eq(users.id, userId));
}

export async function updateUserPlan(userId: number, plan: "free" | "pro" | "business", quota: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ plan, tokensQuota: quota }).where(eq(users.id, userId));
}

// ─── Projects ────────────────────────────────────────────
export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(projects).values(data);
  return result[0].insertId;
}

export async function getProjectsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return result[0];
}

export async function updateProject(id: number, data: Partial<Project>) {
  const db = await getDb();
  if (!db) return;
  await db.update(projects).set(data).where(eq(projects.id, id));
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projects).where(eq(projects.id, id));
}

// ─── Generations ─────────────────────────────────────────
export async function createGeneration(data: InsertGeneration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(generations).values(data);
  return result[0].insertId;
}

export async function upsertGeneration(db: any, data: any) {
  const result = await db.insert(generations).values(data);
  return { id: result[0].insertId };
}

export async function getGenerationsByProject(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generations).where(eq(generations.projectId, projectId)).orderBy(desc(generations.createdAt));
}

export async function updateGeneration(id: number, data: Partial<typeof generations.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(generations).set(data).where(eq(generations.id, id));
}

// ─── Token Usage ─────────────────────────────────────────
export async function recordTokenUsage(userId: number, tokens: number, model: string, action: string) {
  const db = await getDb();
  if (!db) return;
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  await db.insert(tokenUsage).values({ userId, tokensUsed: tokens, model, action, periodStart, periodEnd });
}

export async function getTokenUsageByUser(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db.select().from(tokenUsage).where(and(eq(tokenUsage.userId, userId), gte(tokenUsage.createdAt, since))).orderBy(desc(tokenUsage.createdAt));
}

export async function getUserTokenUsage(userId: number) {
  const db = await getDb();
  if (!db) return { tier: "free", tokensUsedThisMonth: 0, monthlyLimit: 50000 };
  
  const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user[0]) return { tier: "free", tokensUsedThisMonth: 0, monthlyLimit: 50000 };
  
  const plan = user[0].plan || "free";
  const limits: Record<string, number> = { free: 50000, pro: 500000, business: 5000000 };
  
  return {
    tier: plan,
    tokensUsedThisMonth: user[0].tokensUsed || 0,
    monthlyLimit: limits[plan] || 50000,
  };
}

export async function updateTokenUsage(userId: number, tokens: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ tokensUsed: sql`${users.tokensUsed} + ${tokens}` }).where(eq(users.id, userId));
}

// ─── Templates ───────────────────────────────────────────
export async function createTemplate(data: InsertTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(templates).values(data);
  return result[0].insertId;
}

export async function getPublishedTemplates(category?: string) {
  const db = await getDb();
  if (!db) return [];
  if (category && category !== "all") {
    return db.select().from(templates).where(and(eq(templates.isPublished, 1), eq(templates.category, category))).orderBy(desc(templates.downloads));
  }
  return db.select().from(templates).where(eq(templates.isPublished, 1)).orderBy(desc(templates.downloads));
}

export async function getTemplatesByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(templates).where(eq(templates.userId, userId)).orderBy(desc(templates.createdAt));
}

export async function getTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
  return result[0];
}

export async function incrementTemplateDownloads(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(templates).set({ downloads: sql`${templates.downloads} + 1` }).where(eq(templates.id, id));
}

// ─── Analytics ───────────────────────────────────────────
export async function getAnalyticsByProject(projectId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db.select().from(siteAnalytics).where(and(eq(siteAnalytics.projectId, projectId), gte(siteAnalytics.date, since))).orderBy(desc(siteAnalytics.date));
}

export async function recordAnalytics(projectId: number, data: { pageViews: number; uniqueVisitors: number; avgSessionDuration?: number }) {
  const db = await getDb();
  if (!db) return;
  await db.insert(siteAnalytics).values({ projectId, date: new Date(), ...data });
}

// ─── Subscriptions ───────────────────────────────────────
export async function getSubscriptionByUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result[0];
}

export async function upsertSubscription(userId: number, data: Partial<typeof subscriptions.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  const existing = await getSubscriptionByUser(userId);
  if (existing) {
    await db.update(subscriptions).set(data).where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({ userId, plan: "free", status: "active", ...data });
  }
}

// ─── Admin ───────────────────────────────────────────────
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getProjectStats() {
  const db = await getDb();
  if (!db) return { total: 0, deployed: 0, generating: 0 };
  const all = await db.select({ count: sql<number>`count(*)` }).from(projects);
  const deployed = await db.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.status, "deployed"));
  return { total: Number(all[0]?.count ?? 0), deployed: Number(deployed[0]?.count ?? 0), generating: 0 };
}
