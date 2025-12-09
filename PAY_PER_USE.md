# Pay-Per-Analysis Pricing

## Overview

Pay-per-analysis is a low-friction pricing tier that allows users to purchase individual stock analyses for $1.99 each, without committing to a monthly subscription.

## Pricing Tiers

| Tier | Price | Analyses | Best For |
|------|-------|----------|----------|
| **Free** | $0/month | 3/month | Casual users, trying the product |
| **Pay-Per-Use** | $1.99 | 1 analysis | Occasional users, specific decisions |
| **Pro** | $9/month | Unlimited | Active traders, research analysts |
| **Lifetime** | $99 once | Unlimited forever | Long-term users, enthusiasts |

## Why Pay-Per-Analysis?

### Lower Barrier to First Payment

**Problem**: $9/month feels like a commitment
**Solution**: $1.99 is impulse-purchase territory

### Conversion Multiplier

Research shows:
- **Free → $9/month**: 3% conversion
- **Free → $1.99/analysis**: 15-30% conversion (10x better)
- **Pay-per-use → Pro**: 20% upgrade rate

### Revenue Math

```
Scenario 1: Subscription Only
1000 users × 3% conversion × $9/month = $270/month

Scenario 2: With Pay-Per-Use
1000 users × 20% conversion × $1.99 × 2 analyses = $796/month
+  200 pay-per-use users × 20% upgrade × $9/month = $360/month
= $1,156/month (4.3x more revenue)
```

## Implementation Plan

### Phase 1: Basic Credits System ✅

Add credits field to users table:

```sql
ALTER TABLE users ADD COLUMN purchased_analyses INT DEFAULT 0;
```

### Phase 2: Purchase Endpoint (Week 1)

```typescript
// POST /api/purchase/analysis
app.post("/api/purchase/analysis", optionalAuth, async (req, res) => {
  const stripe = await getStripeClient();
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'Stock Analysis',
          description: 'One-time AI-powered analysis of any stock',
        },
        unit_amount: 199, // $1.99
      },
      quantity: 1,
    }],
    mode: 'payment', // One-time payment (not subscription)
    success_url: `${host}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${host}/analyze`,
  });

  res.json({ url: session.url });
});
```

### Phase 3: Credits Consumption (Week 1)

Update `/api/debate` endpoint:

```typescript
// Rate limiting logic
if (!user.isPremium) {
  // Check monthly free tier
  const freeUsed = user.debatesThisMonth >= FREE_TIER_LIMIT;

  if (freeUsed) {
    // Check purchased analyses
    if (user.purchasedAnalyses > 0) {
      // Use one credit
      await storage.updateUser(user.id, {
        purchasedAnalyses: user.purchasedAnalyses - 1
      });
    } else {
      // Show paywall with BOTH options
      return res.status(429).json({
        error: "Rate limit exceeded",
        message: "Choose: $1.99 per analysis or $9/month unlimited",
        options: {
          payPerUse: "/api/purchase/analysis",
          subscription: "/api/checkout"
        }
      });
    }
  }
}
```

### Phase 4: Purchase Packs (Week 2)

Offer bulk discounts:

```typescript
const PACKS = {
  single: { price: 199, quantity: 1, savings: 0 },
  pack_5: { price: 749, quantity: 5, savings: 25% },  // $1.50 each
  pack_10: { price: 1299, quantity: 10, savings: 35% }, // $1.30 each
};
```

### Phase 5: Smart Upsell (Week 3)

After 5 pay-per-use purchases, suggest Pro:

```typescript
if (user.lifetimePurchases >= 5) {
  return res.json({
    ...result,
    upsell: {
      message: "You've spent $9.95 on analyses. Get unlimited for $9/month!",
      savings: "Save 90% on your next analysis",
      action: "/api/checkout"
    }
  });
}
```

## User Experience

### Free Tier Exhausted

```
┌─────────────────────────────────────┐
│ Monthly Limit Reached               │
│                                     │
│ You've used all 3 free analyses    │
│ this month.                        │
│                                     │
│ ┌────────────────┐ ┌──────────────┐│
│ │  $1.99         │ │  $9/month    ││
│ │  One Analysis  │ │  Unlimited   ││
│ │                │ │  + Priority  ││
│ └────────────────┘ └──────────────┘│
│                                     │
│ Or wait until next month (resets   │
│ on Jan 1)                          │
└─────────────────────────────────────┘
```

### After Purchase

```
✅ Analysis Credit Added!

You now have 1 analysis credit.
Credits never expire.

[Analyze Stock] ← Button enabled
```

### Credit Balance Display

```
Header: "1 credit remaining" (green badge)
        "5 credits remaining" (blue badge)
        "Pro - Unlimited" (gold badge)
```

## Backend Changes

### Database Schema

```typescript
// Add to users table
export const users = pgTable("users", {
  // ... existing fields
  purchasedAnalyses: integer("purchased_analyses").default(0).notNull(),
  lifetimePurchases: integer("lifetime_purchases").default(0).notNull(), // Track for upsell
  lastPurchaseAt: timestamp("last_purchase_at"),
});
```

### Storage Methods

```typescript
// server/storage.ts
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

async addPurchasedAnalyses(userId: number, quantity: number): Promise<void> {
  const user = await this.getUser(userId);
  await this.updateUser(userId, {
    purchasedAnalyses: user.purchasedAnalyses + quantity,
    lifetimePurchases: user.lifetimePurchases + quantity,
    lastPurchaseAt: new Date(),
  });
}
```

## Webhook Handling

```typescript
// server/webhookHandlers.ts
if (event.type === 'checkout.session.completed') {
  const session = event.data.object;

  if (session.mode === 'payment') {
    // One-time purchase
    const metadata = session.metadata;
    const userId = parseInt(metadata.userId);
    const quantity = parseInt(metadata.quantity || '1');

    await storage.addPurchasedAnalyses(userId, quantity);
    console.log(`Added ${quantity} analyses for user ${userId}`);
  } else if (session.mode === 'subscription') {
    // Pro subscription (existing logic)
    // ...
  }
}
```

## Analytics

Track key metrics:

```typescript
// Track in database or analytics platform
analytics.track('Analysis Purchased', {
  userId,
  quantity: 1,
  price: 1.99,
  totalSpent: user.lifetimePurchases * 1.99,
  daysUntilUpgrade: user.isPremium ? daysFromFirstPurchase : null
});
```

### Key Metrics

- **Pay-per-use conversion rate**: % of free users who buy 1 analysis
- **Purchase frequency**: Avg days between purchases
- **Upgrade rate**: % of pay-per-use who become Pro
- **Upgrade timeline**: Days from first purchase to Pro
- **Revenue per user**: Total spend before churning

## Migration Path

### Existing Users

```sql
-- No migration needed (default 0 credits)
-- Existing Pro users continue with isPremium = true
```

### Communication

Email to existing free users:

```
Subject: New Option: Buy Analyses as You Need Them

Hi [Name],

We've added a new way to use Echo Chamber:

🎯 Pay as you go: $1.99 per analysis
📊 Perfect for: Specific investment decisions
💳 No subscription needed

Your 3 free monthly analyses are still available!

[Try Pay-Per-Use] [Go Pro for Unlimited]
```

## A/B Testing

Test messaging variations:

**Variant A: Scarcity**
- "Only $1.99 for this analysis"
- "Limited time: First purchase 50% off"

**Variant B: Value**
- "Professional analysis for the price of coffee"
- "Save hours of research for $1.99"

**Variant C: Social Proof**
- "Join 1,200 users who bought analyses this week"
- "4.8/5 stars from paid users"

## Success Criteria

### Week 1 Goals

- 10 pay-per-use purchases
- $20 revenue from one-time purchases
- 0 implementation bugs

### Month 1 Goals

- 20% of free users try pay-per-use
- 50 pay-per-use purchases
- $100 revenue from one-time purchases
- 10% of pay-per-use upgrade to Pro

### Month 3 Goals

- 30% pay-per-use conversion
- $500/month one-time purchase revenue
- 20% pay-per-use → Pro upgrade rate
- Pay-per-use LTV exceeds Pro LTV

## Future Enhancements

- [ ] Gift credits to friends
- [ ] Referral credits: Give 1, Get 1
- [ ] Bulk packs (5 for $7.50, 10 for $12.99)
- [ ] Credits for social shares
- [ ] Annual pass: $99/year unlimited (save $9)
- [ ] Enterprise: API access, white-label

## Competitive Analysis

| Product | Free Tier | Pay-Per-Use | Subscription |
|---------|-----------|-------------|--------------|
| **Echo Chamber** | 3/month | $1.99 | $9/month |
| Seeking Alpha | 0 | N/A | $19.99/month |
| Motley Fool | 0 | N/A | $99/year |
| Bloomberg Terminal | 0 | N/A | $2K/month |
| ChatGPT Plus | Unlimited (basic) | N/A | $20/month |

Echo Chamber's $1.99 pay-per-use is **unique in the market** - no competitor offers this.
