import { db } from "./db";
import { users, debates, type User, type InsertUser, type Debate, type InsertDebate, type DebateResponse } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Debate operations
  getDebate(id: string): Promise<Debate | undefined>;
  getDebatesByUser(userId: number): Promise<Debate[]>;
  createDebate(userId: number | null, symbol: string, context: string | undefined, result: DebateResponse): Promise<Debate>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  // Debate operations
  async getDebate(id: string): Promise<Debate | undefined> {
    const [debate] = await db.select().from(debates).where(eq(debates.id, id));
    return debate;
  }

  async getDebatesByUser(userId: number): Promise<Debate[]> {
    return db.select().from(debates).where(eq(debates.userId, userId)).orderBy(desc(debates.createdAt));
  }

  async createDebate(userId: number | null, symbol: string, context: string | undefined, result: DebateResponse): Promise<Debate> {
    const id = nanoid();
    const [debate] = await db.insert(debates).values({
      id,
      userId,
      symbol,
      context,
      result,
    }).returning();
    return debate;
  }
}

export const storage = new DatabaseStorage();
