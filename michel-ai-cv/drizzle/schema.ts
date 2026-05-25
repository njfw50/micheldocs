import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, decimal } from "drizzle-orm/mysql-core";

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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Profile information for Michel de Souza
 */
export const profile = mysqlTable("profile", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  title: text("title"),
  location: varchar("location", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  linkedin: varchar("linkedin", { length: 500 }),
  facebook: varchar("facebook", { length: 500 }),
  profileImage: varchar("profileImage", { length: 500 }),
  summary: text("summary"),
  dogma1: text("dogma1"),
  dogma2: text("dogma2"),
  dogma3: text("dogma3"),
  dogma4: text("dogma4"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profile.$inferSelect;
export type InsertProfile = typeof profile.$inferInsert;

/**
 * Work experience entries
 */
export const experiences = mysqlTable("experiences", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  dateRange: varchar("dateRange", { length: 100 }),
  description: text("description"),
  category: mysqlEnum("category", ["tech", "travel", "admin", "all"]).default("all").notNull(),
  orderIndex: int("orderIndex").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Experience = typeof experiences.$inferSelect;
export type InsertExperience = typeof experiences.$inferInsert;

/**
 * Education entries
 */
export const education = mysqlTable("education", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  institution: varchar("institution", { length: 255 }).notNull(),
  dateRange: varchar("dateRange", { length: 100 }),
  description: text("description"),
  category: mysqlEnum("category", ["tech", "travel", "admin", "all"]).default("all").notNull(),
  orderIndex: int("orderIndex").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Education = typeof education.$inferSelect;
export type InsertEducation = typeof education.$inferInsert;

/**
 * Skills and competencies
 */
export const skills = mysqlTable("skills", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["tech", "core", "language", "certification"]).notNull(),
  levelPercent: int("levelPercent"),
  levelText: varchar("levelText", { length: 100 }),
  profileFilter: mysqlEnum("profileFilter", ["tech", "travel", "admin", "all"]).default("all").notNull(),
  orderIndex: int("orderIndex").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = typeof skills.$inferInsert;

/**
 * Business metrics and achievements
 */
export const businessMetrics = mysqlTable("businessMetrics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  value: int("value").notNull(),
  unit: varchar("unit", { length: 50 }),
  description: text("description"),
  orderIndex: int("orderIndex").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BusinessMetric = typeof businessMetrics.$inferSelect;
export type InsertBusinessMetric = typeof businessMetrics.$inferInsert;

/**
 * Academic research and publications
 */
export const academicResearch = mysqlTable("academicResearch", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  doi: varchar("doi", { length: 255 }),
  url: varchar("url", { length: 500 }),
  publicationDate: varchar("publicationDate", { length: 100 }),
  orderIndex: int("orderIndex").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AcademicResearch = typeof academicResearch.$inferSelect;
export type InsertAcademicResearch = typeof academicResearch.$inferInsert;

/**
 * Human values and principles
 */
export const humanValues = mysqlTable("humanValues", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 100 }),
  orderIndex: int("orderIndex").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type HumanValue = typeof humanValues.$inferSelect;
export type InsertHumanValue = typeof humanValues.$inferInsert;

/**
 * Chat messages between recruiters and AI
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  sessionId: varchar("sessionId", { length: 100 }).notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  profileFilter: mysqlEnum("profileFilter", ["tech", "travel", "admin", "all"]).default("all").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * Notifications sent to Michel
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  question: text("question"),
  profileFilter: mysqlEnum("profileFilter", ["tech", "travel", "admin", "all"]).default("all").notNull(),
  isRead: int("isRead").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
