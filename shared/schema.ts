import { z } from "zod";
import { pgTable, text, serial, timestamp, json, varchar, boolean, integer } from "drizzle-orm/pg-core";
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
  symbol: z.string().min(1).max(10),
  context: z.string().optional(),
});

export type Perspective = z.infer<typeof perspectiveSchema>;
export type DebateResponse = z.infer<typeof debateResponseSchema>;
export type DebateRequest = z.infer<typeof debateRequestSchema>;

// Database tables
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email"),
  profileImageUrl: text("profile_image_url"),
  isPremium: boolean("is_premium").default(false).notNull(),
  debatesUsedToday: integer("debates_used_today").default(0).notNull(),
  lastDebateDate: text("last_debate_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const debates = pgTable("debates", {
  id: varchar("id", { length: 21 }).primaryKey(), // nanoid
  userId: integer("user_id").references(() => users.id),
  symbol: text("symbol").notNull(),
  context: text("context"),
  result: json("result").$type<DebateResponse>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDebateSchema = createInsertSchema(debates).omit({
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Debate = typeof debates.$inferSelect;
export type InsertDebate = z.infer<typeof insertDebateSchema>;
