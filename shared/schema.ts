import { z } from "zod";
import { sql } from "drizzle-orm";
import { pgTable, text, serial, timestamp, json, varchar, boolean, integer, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Zod schemas for API validation
export const perspectiveSchema = z.object({
  title: z.string(),
  argument: z.string(),
  keyPoints: z.array(z.string()),
});

export const debateResponseSchema = z.object({
  bull: perspectiveSchema,
  bear: perspectiveSchema,
  neutral: perspectiveSchema,
});

export const debateRequestSchema = z.object({
  symbols: z.array(z.string().min(1).max(10)).min(1).max(5),
  context: z.string().optional(),
});

// Schema for multi-symbol debate response
export const multiDebateResponseSchema = z.record(z.string(), debateResponseSchema);

export type Perspective = z.infer<typeof perspectiveSchema>;
export type DebateResponse = z.infer<typeof debateResponseSchema>;
export type MultiDebateResponse = z.infer<typeof multiDebateResponseSchema>;
export type DebateRequest = z.infer<typeof debateRequestSchema>;

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Database tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  replitSub: varchar("replit_sub").unique(), // Replit Auth identifier
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isPremium: boolean("is_premium").default(false).notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  debatesThisMonth: integer("debates_this_month").default(0).notNull(),
  lastDebateMonth: varchar("last_debate_month"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const debates = pgTable("debates", {
  id: varchar("id", { length: 21 }).primaryKey(), // nanoid
  userId: integer("user_id").references(() => users.id),
  symbol: text("symbol").notNull(), // comma-separated symbols
  symbols: text("symbols").array(), // array of symbols analyzed
  context: text("context"),
  result: json("result").$type<MultiDebateResponse>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDebateSchema = createInsertSchema(debates).omit({
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = {
  replitSub: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
};
export type Debate = typeof debates.$inferSelect;
export type InsertDebate = z.infer<typeof insertDebateSchema>;
