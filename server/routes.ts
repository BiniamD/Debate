import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { debateRequestSchema, debateResponseSchema, multiDebateResponseSchema, type DebateResponse, type MultiDebateResponse } from "@shared/schema";
import { storage } from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { setupClerkAuth, isAuthenticated, optionalAuth, getOrCreateUser } from "./clerkAuth";
import { getAuth } from "@clerk/express";

// Clerk Frontend API Proxy for custom domain support
async function clerkProxyHandler(req: Request, res: Response) {
  try {
    const clerkSecretKey = process.env.CLERK_SECRET_KEY_ECO;
    if (!clerkSecretKey) {
      return res.status(500).json({ error: "Clerk secret key not configured" });
    }

    // Build the target URL - strip /__clerk prefix
    const targetPath = req.path.replace(/^\/__clerk/, "") || "/";
    const targetUrl = new URL(targetPath, "https://frontend-api.clerk.dev");
    
    // Forward query params
    Object.entries(req.query).forEach(([key, value]) => {
      if (typeof value === "string") {
        targetUrl.searchParams.set(key, value);
      }
    });

    // Build headers for the proxy request
    const proxyHeaders: Record<string, string> = {
      "Clerk-Proxy-Url": `${req.protocol}://${req.get("host")}/__clerk`,
      "Clerk-Secret-Key": clerkSecretKey,
      "X-Forwarded-For": req.ip || req.headers["x-forwarded-for"]?.toString() || "",
    };

    // Forward relevant headers from original request
    const forwardHeaders = ["content-type", "accept", "authorization", "cookie", "user-agent"];
    forwardHeaders.forEach((header) => {
      const value = req.headers[header];
      if (value && typeof value === "string") {
        proxyHeaders[header] = value;
      }
    });

    // Make the proxy request
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: proxyHeaders,
      body: ["POST", "PUT", "PATCH"].includes(req.method) ? JSON.stringify(req.body) : undefined,
      redirect: "manual",
    });

    // Forward response status
    res.status(response.status);

    // Forward response headers
    response.headers.forEach((value, key) => {
      // Skip certain headers that shouldn't be forwarded
      if (!["transfer-encoding", "content-encoding", "connection"].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // Forward response body
    const responseText = await response.text();
    res.send(responseText);
  } catch (error) {
    console.error("Clerk proxy error:", error);
    res.status(500).json({ error: "Proxy request failed" });
  }
}

// Using the javascript_xai blueprint - Grok AI
const xai = process.env.XAI_API_KEY
  ? new OpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey: process.env.XAI_API_KEY,
    })
  : null;

if (!xai) {
  console.warn("XAI_API_KEY not set - AI debate features will be unavailable");
}

const SINGLE_SYMBOL_PROMPT = `You are a financial analysis AI that provides balanced, multi-perspective analysis.
For the given stock symbol, provide THREE perspectives:
1. BULL CASE: optimistic view, growth catalysts, competitive advantages
2. BEAR CASE: risks, downsides, competitive threats  
3. NEUTRAL CASE: data-driven, objective metrics, balanced assessment

Format your response as JSON with this exact structure:
{
  "bull": {
    "title": "Bull Case",
    "argument": "2-3 paragraph optimistic analysis...",
    "keyPoints": ["Point 1", "Point 2", "Point 3"]
  },
  "bear": {
    "title": "Bear Case",
    "argument": "2-3 paragraph pessimistic analysis...",
    "keyPoints": ["Point 1", "Point 2", "Point 3"]
  },
  "neutral": {
    "title": "Neutral Analysis",
    "argument": "2-3 paragraph balanced analysis...",
    "keyPoints": ["Point 1", "Point 2", "Point 3"]
  }
}

Important: Return ONLY the JSON object, no additional text or markdown formatting.`;

const MULTI_SYMBOL_PROMPT = `You are a financial analysis AI that provides balanced, multi-perspective analysis.
For EACH stock symbol provided, provide THREE perspectives:
1. BULL CASE: optimistic view, growth catalysts, competitive advantages
2. BEAR CASE: risks, downsides, competitive threats  
3. NEUTRAL CASE: data-driven, objective metrics, balanced assessment

Format your response as JSON with this exact structure (one entry per symbol):
{
  "SYMBOL1": {
    "bull": {
      "title": "Bull Case",
      "argument": "2-3 paragraph optimistic analysis...",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    },
    "bear": {
      "title": "Bear Case",
      "argument": "2-3 paragraph pessimistic analysis...",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    },
    "neutral": {
      "title": "Neutral Analysis",
      "argument": "2-3 paragraph balanced analysis...",
      "keyPoints": ["Point 1", "Point 2", "Point 3"]
    }
  },
  "SYMBOL2": {
    "bull": { ... },
    "bear": { ... },
    "neutral": { ... }
  }
}

Important: Return ONLY the JSON object, no additional text or markdown formatting. Use the exact symbols as keys.`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Clerk Frontend API Proxy - must be before other middleware
  app.all("/__clerk/*", clerkProxyHandler);
  app.all("/__clerk", clerkProxyHandler);

  // Setup Clerk Auth
  setupClerkAuth(app);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get authenticated user (returns null for anonymous users, not 401)
  app.get("/api/auth/user", optionalAuth, async (req: any, res) => {
    try {
      const auth = getAuth(req);
      if (!auth.userId) {
        return res.json(null);
      }
      
      // Get or create user in our database
      const user = await getOrCreateUser(auth.userId);
      if (!user) {
        return res.json(null);
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.json(null);
    }
  });

  // Get user's debate history
  app.get("/api/user/debates", isAuthenticated, async (req: any, res) => {
    try {
      const auth = getAuth(req);
      const user = await storage.getUserByReplitSub(auth.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const debates = await storage.getDebatesByUser(user.id, 30);
      res.json(debates);
    } catch (error) {
      console.error("Error fetching debates:", error);
      res.status(500).json({ message: "Failed to fetch debates" });
    }
  });

  // Get debate by ID (for shared links)
  app.get("/api/debate/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const debate = await storage.getDebate(id);
      
      if (!debate) {
        return res.status(404).json({ error: "Debate not found" });
      }
      
      // Return the new format with symbols array and result as record
      res.json({
        id: debate.id,
        symbol: debate.symbol,
        symbols: debate.symbols || [debate.symbol],
        context: debate.context,
        createdAt: debate.createdAt,
        result: debate.result,
      });
    } catch (error) {
      console.error("Error fetching debate:", error);
      res.status(500).json({ error: "Failed to fetch debate" });
    }
  });

  // Stripe checkout endpoint - create checkout session for Pro plan
  app.post("/api/checkout", async (req, res) => {
    try {
      const stripe = await getUncachableStripeClient();
      const host = req.get('host');
      // Use HTTPS in production (check X-Forwarded-Proto header or default to https for non-localhost)
      const forwardedProto = req.get('x-forwarded-proto');
      const protocol = forwardedProto || (host?.includes('localhost') ? 'http' : 'https');
      
      // Create a checkout session for the Pro plan ($9/month)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Echo Chamber Pro',
              description: 'Unlimited stock analyses per month',
            },
            unit_amount: 900, // $9.00
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }],
        mode: 'subscription',
        success_url: `${protocol}://${host}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${protocol}://${host}/`,
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("Checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // Checkout success - verify subscription and mark user as Pro
  app.get("/api/checkout/verify", isAuthenticated, async (req: any, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id || typeof session_id !== 'string') {
        console.error("Verify error: Missing session_id");
        return res.status(400).json({ error: "Missing session_id" });
      }

      console.log(`Verifying checkout session: ${session_id}`);
      
      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id);
      console.log(`Session payment status: ${session.payment_status}`);

      if (session.payment_status === 'paid') {
        // Get the authenticated user and mark them as premium
        const auth = getAuth(req);
        const user = await storage.getUserByReplitSub(auth.userId!);
        
        if (!user) {
          console.error(`Verify error: User not found for clerkId ${auth.userId}`);
          return res.status(404).json({ error: "User not found" });
        }
        
        // Update user to premium status and store Stripe customer ID
        await storage.updateUser(user.id, {
          isPremium: true,
          stripeCustomerId: session.customer as string,
        });
        console.log(`User ${user.id} upgraded to Pro - Customer ID: ${session.customer}`);
        
        res.json({ 
          success: true, 
          subscription: session.subscription,
          customer: session.customer,
        });
      } else {
        console.warn(`Session ${session_id} payment status: ${session.payment_status}`);
        res.json({ success: false, status: session.payment_status });
      }
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Failed to verify subscription", details: String(error) });
    }
  });

  // Get Stripe publishable key for frontend
  app.get("/api/stripe/config", async (_req, res) => {
    try {
      const publishableKey = await getStripePublishableKey();
      res.json({ publishableKey });
    } catch (error) {
      console.error("Stripe config error:", error);
      res.status(500).json({ error: "Stripe not configured" });
    }
  });

  const FREE_TIER_LIMIT = 3;

  // Debate generation endpoint (optional auth - works for both logged in and anonymous users)
  app.post("/api/debate", optionalAuth, async (req: any, res) => {
    try {
      // Validate request body
      const parseResult = debateRequestSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: "Invalid request",
          details: parseResult.error.errors,
        });
      }

      const { symbols, context } = parseResult.data;
      const normalizedSymbols = symbols.map(s => s.toUpperCase().trim());
      const symbolCount = normalizedSymbols.length;
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      // Get user ID if authenticated
      let userId: number | null = null;
      const auth = getAuth(req);
      if (auth.userId) {
        const user = await storage.getUserByReplitSub(auth.userId);
        if (user) {
          userId = user.id;
          
          // Check rate limit for non-Pro users (each symbol counts as one debate)
          if (!user.isPremium) {
            const debatesThisMonth = user.lastDebateMonth === currentMonth 
              ? user.debatesThisMonth 
              : 0;
            
            if (debatesThisMonth + symbolCount > FREE_TIER_LIMIT) {
              return res.status(429).json({
                error: "Rate limit exceeded",
                message: `You've reached your free tier limit. You have ${Math.max(0, FREE_TIER_LIMIT - debatesThisMonth)} analyses remaining this month. Upgrade to Pro for unlimited analyses.`,
                code: "RATE_LIMIT_EXCEEDED",
              });
            }
          }
          
          // Update user's monthly debate count (charge per symbol)
          if (user.lastDebateMonth !== currentMonth) {
            // New month, reset count
            await storage.updateUser(user.id, { 
              debatesThisMonth: symbolCount, 
              lastDebateMonth: currentMonth 
            });
          } else {
            // Same month, increment count by number of symbols
            await storage.updateUser(user.id, { 
              debatesThisMonth: user.debatesThisMonth + symbolCount 
            });
          }
        }
      }

      // Build user message based on single or multiple symbols
      const isMultiSymbol = symbolCount > 1;
      let userMessage: string;
      let systemPrompt: string;
      
      if (isMultiSymbol) {
        userMessage = `Analyze these stocks: ${normalizedSymbols.join(', ')}`;
        systemPrompt = MULTI_SYMBOL_PROMPT;
      } else {
        userMessage = `Analyze the stock: ${normalizedSymbols[0]}`;
        systemPrompt = SINGLE_SYMBOL_PROMPT;
      }
      
      if (context) {
        userMessage += `\n\nAdditional context from the investor: ${context}`;
      }

      // Call Grok API (xAI) using OpenAI-compatible SDK
      if (!xai) {
        return res.status(503).json({
          error: "Service unavailable",
          message: "AI service is not configured. Please set XAI_API_KEY environment variable.",
        });
      }

      const response = await xai.chat.completions.create({
        model: "grok-2-1212",
        max_tokens: isMultiSymbol ? 4096 : 2048,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
      });

      // Extract text content from response
      const textContent = response.choices[0]?.message?.content;
      if (!textContent) {
        throw new Error("No text content in response");
      }

      // Parse JSON response
      let rawParsed: unknown;
      try {
        // Try to extract JSON from the response (in case there's extra text)
        const jsonMatch = textContent.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        rawParsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Failed to parse Grok response:", textContent);
        throw new Error("Failed to parse AI response as JSON");
      }

      // Validate and normalize the response structure
      let result: MultiDebateResponse;
      
      if (isMultiSymbol) {
        // Validate multi-symbol response
        const validationResult = multiDebateResponseSchema.safeParse(rawParsed);
        if (!validationResult.success) {
          console.error("Multi-debate response validation failed:", validationResult.error.errors);
          console.error("Raw parsed response:", JSON.stringify(rawParsed, null, 2));
          return res.status(502).json({
            error: "Invalid AI response structure",
            message: "The AI generated an invalid response format. Please try again.",
          });
        }
        result = validationResult.data;
      } else {
        // Single symbol - validate and wrap in object
        const validationResult = debateResponseSchema.safeParse(rawParsed);
        if (!validationResult.success) {
          console.error("Debate response validation failed:", validationResult.error.errors);
          console.error("Raw parsed response:", JSON.stringify(rawParsed, null, 2));
          return res.status(502).json({
            error: "Invalid AI response structure",
            message: "The AI generated an invalid response format. Please try again.",
          });
        }
        result = { [normalizedSymbols[0]]: validationResult.data };
      }

      // Save debate to database (linked to user if authenticated)
      const debate = await storage.createDebate(
        userId, 
        normalizedSymbols.join(','), 
        context, 
        result,
        normalizedSymbols
      );

      // Return result with debate ID for sharing
      res.json({
        id: debate.id,
        symbols: normalizedSymbols,
        result,
      });
    } catch (error) {
      console.error("Debate generation error:", error);
      
      if (error instanceof OpenAI.APIError) {
        return res.status(error.status || 500).json({
          error: "AI service error",
          message: (error as Error).message,
        });
      }

      res.status(500).json({
        error: "Failed to generate debate",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return httpServer;
}
