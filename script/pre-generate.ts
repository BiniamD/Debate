#!/usr/bin/env tsx
/**
 * Pre-generation script for top stocks
 *
 * This script pre-generates AI analyses for the top 500 stocks
 * and caches them for 24 hours. Run this daily via cron job.
 *
 * Usage:
 *   npm run pre-generate          # Generate top 100 stocks
 *   npm run pre-generate -- --all # Generate all 500 stocks
 *   npm run pre-generate -- --limit 50 # Generate first 50
 */

import OpenAI from 'openai';
import { initCache, setCachedAnalysis, getCachedAnalysis } from '../server/cache';
import { TOP_500_STOCKS } from '../server/topStocks';
import { debateResponseSchema, type MultiDebateResponse } from '../shared/schema';

// Configuration
const DEFAULT_LIMIT = 100;
const RATE_LIMIT_DELAY = 2000; // 2 seconds between requests (30 per minute)
const BATCH_SIZE = 10;

// Parse command line arguments
const args = process.argv.slice(2);
const isAll = args.includes('--all');
const limitArg = args.find(arg => arg.startsWith('--limit'));
const limit = limitArg
  ? parseInt(limitArg.split('=')[1])
  : isAll
    ? TOP_500_STOCKS.length
    : DEFAULT_LIMIT;

// Initialize xAI client
const xai = process.env.XAI_API_KEY
  ? new OpenAI({
      baseURL: "https://api.x.ai/v1",
      apiKey: process.env.XAI_API_KEY,
    })
  : null;

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

/**
 * Generate analysis for a single stock
 */
async function generateAnalysis(symbol: string): Promise<MultiDebateResponse | null> {
  if (!xai) {
    console.error('XAI_API_KEY not set');
    return null;
  }

  try {
    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      max_tokens: 2048,
      messages: [
        { role: "system", content: SINGLE_SYMBOL_PROMPT },
        { role: "user", content: `Analyze the stock: ${symbol}` }
      ],
    });

    const textContent = response.choices[0]?.message?.content;
    if (!textContent) {
      throw new Error("No text content in response");
    }

    // Extract JSON from response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const rawParsed = JSON.parse(jsonMatch[0]);
    const validationResult = debateResponseSchema.safeParse(rawParsed);

    if (!validationResult.success) {
      console.error(`Validation failed for ${symbol}:`, validationResult.error.errors);
      return null;
    }

    // Wrap in MultiDebateResponse format
    return { [symbol]: validationResult.data };
  } catch (error) {
    console.error(`Error generating analysis for ${symbol}:`, error);
    return null;
  }
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if a cached analysis is still fresh (less than 12 hours old)
 */
function isFresh(cachedAt: string): boolean {
  const age = Date.now() - new Date(cachedAt).getTime();
  const twelveHours = 12 * 60 * 60 * 1000;
  return age < twelveHours;
}

/**
 * Main pre-generation logic
 */
async function main() {
  console.log('🚀 Starting pre-generation script\n');
  console.log(`Configuration:`);
  console.log(`  - Total stocks available: ${TOP_500_STOCKS.length}`);
  console.log(`  - Generating: ${limit} stocks`);
  console.log(`  - Rate limit: ${RATE_LIMIT_DELAY}ms between requests\n`);

  // Initialize cache
  initCache();

  const stocksToGenerate = TOP_500_STOCKS.slice(0, limit);
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  const startTime = Date.now();

  for (let i = 0; i < stocksToGenerate.length; i += BATCH_SIZE) {
    const batch = stocksToGenerate.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(stocksToGenerate.length / BATCH_SIZE)}`);

    for (const symbol of batch) {
      const progress = `[${i + batch.indexOf(symbol) + 1}/${stocksToGenerate.length}]`;

      // Check if already cached and fresh
      const cached = await getCachedAnalysis(symbol);
      if (cached && isFresh(cached.cachedAt)) {
        console.log(`${progress} ⏭️  ${symbol} - Already cached (fresh)`);
        skipped++;
        continue;
      }

      // Generate new analysis
      console.log(`${progress} 🔄 ${symbol} - Generating...`);
      const result = await generateAnalysis(symbol);

      if (result) {
        await setCachedAnalysis(symbol, result);
        generated++;
        console.log(`${progress} ✅ ${symbol} - Cached successfully`);
      } else {
        failed++;
        console.log(`${progress} ❌ ${symbol} - Generation failed`);
      }

      // Rate limiting
      if (i + batch.indexOf(symbol) < stocksToGenerate.length - 1) {
        await sleep(RATE_LIMIT_DELAY);
      }
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n\n✨ Pre-generation complete!\n`);
  console.log(`Summary:`);
  console.log(`  ✅ Generated: ${generated}`);
  console.log(`  ⏭️  Skipped (fresh): ${skipped}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  ⏱️  Duration: ${duration}s`);
  console.log(`  📊 Rate: ${(generated / (parseInt(duration) / 60)).toFixed(1)} generations/minute\n`);

  // Estimate costs
  const costPerGeneration = 0.03; // $0.03 per xAI API call
  const totalCost = generated * costPerGeneration;
  console.log(`💰 Estimated cost: $${totalCost.toFixed(2)}\n`);
}

// Run the script
main()
  .then(() => {
    console.log('Script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
