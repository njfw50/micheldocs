import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, profile, experiences, education, skills, businessMetrics, academicResearch, humanValues, chatMessages, notifications } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { mode: 'default' });
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
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

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Profile queries
export async function getProfile() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(profile).limit(1);
  return result.length > 0 ? result[0] : null;
}

// Experience queries
export async function getExperiencesByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(experiences).where(eq(experiences.category, category as any));
}

export async function getAllExperiences() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(experiences);
}

// Education queries
export async function getEducationByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(education).where(eq(education.category, category as any));
}

export async function getAllEducation() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(education);
}

// Skills queries
export async function getSkillsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(skills).where(eq(skills.category, category as any));
}

export async function getSkillsByProfileFilter(profileFilter: string) {
  const db = await getDb();
  if (!db) return [];
  if (profileFilter === 'all') {
    return await db.select().from(skills);
  }
  return await db.select().from(skills).where(eq(skills.profileFilter, profileFilter as any));
}

export async function getAllSkills() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(skills);
}

// Metrics queries
export async function getBusinessMetrics() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(businessMetrics);
}

// Research queries
export async function getAcademicResearch() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(academicResearch);
}

// Human Values queries
export async function getHumanValues() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(humanValues);
}

// Chat Messages queries
export async function getChatMessages(sessionId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId as any));
}

export async function saveChatMessage(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(chatMessages).values(data);
  return result;
}

// Notifications queries
export async function createNotification(data: any) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(notifications).values(data);
  return result;
}

export async function getNotifications() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return null;
  return await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, notificationId));
}
