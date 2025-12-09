import { clerkMiddleware, getAuth, requireAuth } from "@clerk/express";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";

export function setupClerkAuth(app: Express) {
  // Add Clerk middleware to all routes
  app.use(clerkMiddleware());
}

// Middleware to require authentication
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const auth = getAuth(req);
  
  if (!auth.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Attach user info to request for downstream use
  (req as any).clerkUserId = auth.userId;
  (req as any).clerkSessionId = auth.sessionId;
  
  next();
};

// Optional authentication - continues even if not authenticated
export const optionalAuth: RequestHandler = async (req, res, next) => {
  const auth = getAuth(req);
  
  if (auth.userId) {
    (req as any).clerkUserId = auth.userId;
    (req as any).clerkSessionId = auth.sessionId;
  }
  
  next();
};

// Helper to get or create user from Clerk auth
export async function getOrCreateUser(clerkUserId: string, email?: string, firstName?: string, lastName?: string, imageUrl?: string) {
  // Check if user exists
  let user = await storage.getUserByReplitSub(clerkUserId);
  
  if (!user) {
    // Create new user
    user = await storage.upsertUser({
      replitSub: clerkUserId,
      email: email || null,
      firstName: firstName || null,
      lastName: lastName || null,
      profileImageUrl: imageUrl || null,
    });
  }
  
  return user;
}
