import type { Express } from "express";
import { createServer, type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import { debateRequestSchema, debateResponseSchema, type DebateResponse } from "@shared/schema";
import { storage } from "./storage";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { setupAuth, isAuthenticated, optionalAuth } from "./replitAuth";

// Using the javascript_anthropic blueprint
// The newest Anthropic model is "claude-sonnet-4-20250514"
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a financial analysis AI that provides balanced, multi-perspective analysis.
For any stock symbol, provide THREE perspectives:
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Replit Auth
  await setupAuth(app);

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get authenticated user (returns null for anonymous users, not 401)
  app.get("/api/auth/user", optionalAuth, async (req: any, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.json(null);
      }
      const replitSub = req.user.claims.sub;
      const user = await storage.getUserByReplitSub(replitSub);
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
      const replitSub = req.user.claims.sub;
      const user = await storage.getUserByReplitSub(replitSub);
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
      
      res.json({
        id: debate.id,
        symbol: debate.symbol,
        context: debate.context,
        createdAt: debate.createdAt,
        ...debate.result,
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
      const protocol = req.protocol;
      
      // Create a checkout session for the Pro plan ($9/month)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Echo Chamber Pro',
              description: 'Unlimited debates per month',
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
  app.get("/api/checkout/verify", async (req, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id || typeof session_id !== 'string') {
        return res.status(400).json({ error: "Missing session_id" });
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status === 'paid') {
        res.json({ 
          success: true, 
          subscription: session.subscription,
          customer: session.customer,
        });
      } else {
        res.json({ success: false, status: session.payment_status });
      }
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Failed to verify subscription" });
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

      const { symbol, context } = parseResult.data;

      // Get user ID if authenticated
      let userId: number | null = null;
      if (req.isAuthenticated() && req.user?.claims?.sub) {
        const user = await storage.getUserByReplitSub(req.user.claims.sub);
        if (user) {
          userId = user.id;
          
          // Update user's monthly debate count
          const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
          if (user.lastDebateMonth !== currentMonth) {
            // New month, reset count
            await storage.updateUser(user.id, { 
              debatesThisMonth: 1, 
              lastDebateMonth: currentMonth 
            });
          } else {
            // Same month, increment count
            await storage.updateUser(user.id, { 
              debatesThisMonth: user.debatesThisMonth + 1 
            });
          }
        }
      }

      // Build user message
      let userMessage = `Analyze the stock: ${symbol.toUpperCase()}`;
      if (context) {
        userMessage += `\n\nAdditional context from the investor: ${context}`;
      }

      // Call Anthropic API
      const message = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      });

      // Extract text content from response
      const textContent = message.content.find((block) => block.type === "text");
      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in response");
      }

      // Parse JSON response
      let rawParsed: unknown;
      try {
        // Try to extract JSON from the response (in case there's extra text)
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        rawParsed = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("Failed to parse Claude response:", textContent.text);
        throw new Error("Failed to parse AI response as JSON");
      }

      // Validate the response structure using Zod schema
      const validationResult = debateResponseSchema.safeParse(rawParsed);
      if (!validationResult.success) {
        console.error("Debate response validation failed:", validationResult.error.errors);
        console.error("Raw parsed response:", JSON.stringify(rawParsed, null, 2));
        return res.status(502).json({
          error: "Invalid AI response structure",
          message: "The AI generated an invalid response format. Please try again.",
        });
      }

      // Save debate to database (linked to user if authenticated)
      const debate = await storage.createDebate(userId, symbol, context, validationResult.data);

      // Return result with debate ID for sharing
      res.json({
        id: debate.id,
        symbol: debate.symbol,
        ...validationResult.data,
      });
    } catch (error) {
      console.error("Debate generation error:", error);
      
      if (error instanceof Anthropic.APIError) {
        return res.status(error.status || 500).json({
          error: "AI service error",
          message: error.message,
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
