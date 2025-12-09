import { db } from "./db";
import { users, debates, type User, type UpsertUser, type Debate, type MultiDebateResponse } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations (for Replit Auth)
  getUser(id: number): Promise<User | undefined>;
  getUserByReplitSub(replitSub: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Pay-per-use credit operations
  usePurchasedAnalysis(userId: number): Promise<boolean>;
  addPurchasedAnalyses(userId: number, quantity: number): Promise<User | undefined>;

  // Debate operations
  getDebate(id: string): Promise<Debate | undefined>;
  getDebatesByUser(userId: number, limit?: number): Promise<Debate[]>;
  createDebate(userId: number | null, symbol: string, context: string | undefined, result: MultiDebateResponse, symbols?: string[]): Promise<Debate>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByReplitSub(replitSub: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.replitSub, replitSub));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        replitSub: userData.replitSub,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
      })
      .onConflictDoUpdate({
        target: users.replitSub,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users).set({ ...updates, updatedAt: new Date() }).where(eq(users.id, id)).returning();
    return updatedUser;
  }

  // Pay-per-use credit operations
  async usePurchasedAnalysis(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    if (!user || user.purchasedAnalyses <= 0) {
      return false;
    }

    await this.updateUser(userId, {
      purchasedAnalyses: user.purchasedAnalyses - 1
    });
    return true;
  }

  async addPurchasedAnalyses(userId: number, quantity: number): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) {
      return undefined;
    }

    return this.updateUser(userId, {
      purchasedAnalyses: user.purchasedAnalyses + quantity,
      lifetimePurchases: user.lifetimePurchases + quantity,
      lastPurchaseAt: new Date(),
    });
  }

  // Debate operations
  async getDebate(id: string): Promise<Debate | undefined> {
    const [debate] = await db.select().from(debates).where(eq(debates.id, id));
    return debate;
  }

  async getDebatesByUser(userId: number, limit: number = 30): Promise<Debate[]> {
    return db.select().from(debates).where(eq(debates.userId, userId)).orderBy(desc(debates.createdAt)).limit(limit);
  }

  async createDebate(userId: number | null, symbol: string, context: string | undefined, result: MultiDebateResponse, symbols?: string[]): Promise<Debate> {
    const id = nanoid();
    const [debate] = await db.insert(debates).values({
      id,
      userId,
      symbol,
      symbols: symbols || [symbol],
      context,
      result,
    }).returning();
    return debate;
  }
}

export const storage = new DatabaseStorage();
