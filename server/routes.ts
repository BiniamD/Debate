import type { Express } from "express";
import { createServer, type Server } from "http";
import Anthropic from "@anthropic-ai/sdk";
import { debateRequestSchema, type DebateResponse } from "@shared/schema";

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
  
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Debate generation endpoint
  app.post("/api/debate", async (req, res) => {
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
      let debateResponse: DebateResponse;
      try {
        // Try to extract JSON from the response (in case there's extra text)
        const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        debateResponse = JSON.parse(jsonMatch[0]) as DebateResponse;
      } catch (parseError) {
        console.error("Failed to parse Claude response:", textContent.text);
        throw new Error("Failed to parse AI response as JSON");
      }

      // Validate the response structure
      if (
        !debateResponse.bull ||
        !debateResponse.bear ||
        !debateResponse.neutral
      ) {
        throw new Error("Invalid debate response structure");
      }

      res.json(debateResponse);
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
