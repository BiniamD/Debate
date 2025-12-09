# Test Plan: Caching + Pay-Per-Use Implementation

## Overview

This test plan covers the complete user journey for both the caching system and pay-per-use pricing implementation.

---

## Prerequisites

### 1. Database Migration

Run database push to add new columns:

```bash
npm run db:push
```

This adds to `users` table:
- `purchased_analyses` (integer, default 0)
- `lifetime_purchases` (integer, default 0)
- `last_purchase_at` (timestamp, nullable)

### 2. Environment Variables

Required for full testing:

```bash
# Required
DATABASE_URL="postgresql://..."
CLERK_SECRET_KEY_ECO="sk_..."
CLERK_PUBLISHABLE_KEY_ECO="pk_test_..."

# For caching (optional - uses in-memory fallback)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# For AI (required for non-cached analyses)
XAI_API_KEY="xai-..."

# For payments (required for pay-per-use)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Test Stripe Keys

Use test mode keys:
- No real charges will occur
- Use test card: `4242 4242 4242 4242`
- Any future date for expiry
- Any 3 digits for CVC
- Any ZIP code

---

## Test Cases

### ✅ Test 1: Caching System

**Goal:** Verify cached analyses work correctly

**Steps:**

1. Start dev server:
   ```bash
   npm run dev
   ```

2. **First Request (Cache Miss):**
   ```bash
   curl -X POST http://localhost:5000/api/debate \
     -H "Content-Type: application/json" \
     -d '{"symbols": ["AAPL"]}'
   ```

   **Expected:**
   - Response time: 2-4 seconds
   - Log: `Cache MISS for AAPL`
   - Log: `Cached AAPL for 24 hours`
   - Response includes: `"cached": false`

3. **Second Request (Cache Hit):**
   ```bash
   curl -X POST http://localhost:5000/api/debate \
     -H "Content-Type: application/json" \
     -d '{"symbols": ["AAPL"]}'
   ```

   **Expected:**
   - Response time: <200ms (instant)
   - Log: `Cache HIT for AAPL`
   - Response includes:
     - `"cached": true`
     - `"cachedAt": "2024-12-09T..."`
     - `"expiresAt": "2024-12-10T..."`
   - **Does NOT count against rate limit**

4. **With Context (Not Cached):**
   ```bash
   curl -X POST http://localhost:5000/api/debate \
     -H "Content-Type: application/json" \
     -d '{"symbols": ["AAPL"], "context": "earnings report"}'
   ```

   **Expected:**
   - No cache check (context provided)
   - Fresh AI generation
   - Response includes: `"cached": false`

5. **Pre-generation Script:**
   ```bash
   npm run pre-generate -- --limit=5
   ```

   **Expected:**
   - Generates top 5 stocks
   - Logs progress: `[1/5] 🔄 AAPL - Generating...`
   - Logs: `✅ AAPL - Cached successfully`
   - Summary at end with success count

---

### ✅ Test 2: Free Tier Rate Limiting

**Goal:** Verify free tier works correctly

**Steps:**

1. **Sign in** to app (create test account)

2. **Use 1st Free Analysis:**
   - Go to `/analyze`
   - Enter symbol: `TSLA`
   - Click "Generate Analysis"

   **Expected:**
   - Analysis generated successfully
   - User's `debatesThisMonth`: 1

3. **Use 2nd Free Analysis:**
   - Enter symbol: `GOOGL`
   - Click "Generate Analysis"

   **Expected:**
   - Analysis generated successfully
   - User's `debatesThisMonth`: 2

4. **Use 3rd Free Analysis:**
   - Enter symbol: `MSFT`
   - Click "Generate Analysis"

   **Expected:**
   - Analysis generated successfully
   - User's `debatesThisMonth`: 3

5. **4th Analysis (Free Tier Exhausted):**
   - Enter symbol: `AMZN`
   - Click "Generate Analysis"

   **Expected:**
   - 429 error returned
   - Paywall modal appears with:
     - Message: "You've used all 3 free analyses this month"
     - Option 1: "Buy 1 Analysis ($1.99)"
     - Option 2: "Go Pro - Unlimited ($9/month)"

---

### ✅ Test 3: Pay-Per-Use Purchase Flow

**Goal:** Complete purchase and credit usage

**Steps:**

1. **Purchase Credit:**
   - After hitting rate limit, click "Buy 1 Analysis ($1.99)"
   - Redirects to Stripe Checkout

   **Expected:**
   - Stripe checkout page opens
   - Shows: "Stock Analysis Credit - $1.99"
   - Description: "One AI-powered stock analysis (never expires)"

2. **Complete Payment:**
   - Use test card: `4242 4242 4242 4242`
   - Fill in any email, name, billing info
   - Click "Pay $1.99"

   **Expected:**
   - Payment succeeds
   - Redirects to `/purchase/success?session_id=cs_test_...`

3. **Verification Page:**
   - Purchase success page loads

   **Expected:**
   - Shows: "Verifying Purchase..." (briefly)
   - Then shows: "Analysis Credit Added!"
   - Displays: "1 Credit" (large)
   - Shows: "Credits never expire"
   - Button: "Analyze a Stock Now"

4. **Verify Database:**
   ```sql
   SELECT
     id,
     email,
     purchased_analyses,
     lifetime_purchases,
     last_purchase_at
   FROM users
   WHERE id = <your_user_id>;
   ```

   **Expected:**
   - `purchased_analyses`: 1
   - `lifetime_purchases`: 1
   - `last_purchase_at`: Recent timestamp

---

### ✅ Test 4: Using Purchased Credit

**Goal:** Verify credits are consumed correctly

**Steps:**

1. **Use Purchased Credit:**
   - Go to `/analyze`
   - Enter symbol: `AMZN` (or any stock)
   - Click "Generate Analysis"

   **Expected:**
   - Analysis generates successfully
   - Log: `User X used 1 purchased credit (0 remaining)`
   - **Does NOT increment `debatesThisMonth`**

2. **Verify Database:**
   ```sql
   SELECT
     purchased_analyses,
     debates_this_month
   FROM users
   WHERE id = <your_user_id>;
   ```

   **Expected:**
   - `purchased_analyses`: 0 (decremented)
   - `debates_this_month`: Still 3 (NOT incremented)

3. **Next Analysis (No Credits Left):**
   - Enter symbol: `NVDA`
   - Click "Generate Analysis"

   **Expected:**
   - 429 error again (no credits remaining)
   - Paywall modal appears with both options

---

### ✅ Test 5: Pro Subscription Bypass

**Goal:** Verify Pro users skip all rate limits

**Steps:**

1. **Upgrade to Pro:**
   - Click "Go Pro - Unlimited"
   - Complete Stripe checkout ($9/month)
   - Verify subscription

2. **Unlimited Analyses:**
   - Generate 10+ analyses in succession

   **Expected:**
   - All succeed (no rate limit)
   - `isPremium`: true in database
   - `debatesThisMonth` NOT incremented
   - No paywall ever shown

---

### ✅ Test 6: Cached Results Don't Count

**Goal:** Verify cached results are truly "free"

**Steps:**

1. **Reset User:**
   ```sql
   UPDATE users
   SET
     debates_this_month = 3,
     purchased_analyses = 0
   WHERE id = <your_user_id>;
   ```

2. **Analyze Cached Stock:**
   - Go to `/analyze`
   - Enter symbol: `AAPL` (or any pre-cached stock)
   - Click "Generate Analysis"

   **Expected:**
   - Cache HIT (instant response)
   - Analysis shows with `"cached": true`
   - **Does NOT trigger paywall**
   - `debatesThisMonth` stays at 3

3. **Analyze Non-Cached Stock:**
   - Enter symbol: `RANDOM_TICKER`
   - Click "Generate Analysis"

   **Expected:**
   - Paywall triggered (free tier exhausted)

---

### ✅ Test 7: Monthly Reset

**Goal:** Verify free tier resets each month

**Steps:**

1. **Simulate Month Change:**
   ```sql
   UPDATE users
   SET
     debates_this_month = 3,
     last_debate_month = '2024-11'  -- Previous month
   WHERE id = <your_user_id>;
   ```

2. **Generate Analysis:**
   - Analyze any stock

   **Expected:**
   - Analysis succeeds
   - Database updated:
     - `debates_this_month`: 1 (reset)
     - `last_debate_month`: '2024-12' (current month)

---

### ✅ Test 8: Multiple Credits

**Goal:** Test buying and using multiple credits

**Steps:**

1. **Purchase 1st Credit:**
   - Buy 1 analysis ($1.99)
   - Verify: `purchased_analyses`: 1

2. **Purchase 2nd Credit:**
   - Buy another analysis ($1.99)
   - Verify: `purchased_analyses`: 2

3. **Use Credits:**
   - Generate 2 analyses
   - Verify credits decrement: 2 → 1 → 0

4. **Verify Lifetime Tracking:**
   ```sql
   SELECT lifetime_purchases FROM users WHERE id = <your_user_id>;
   ```

   **Expected:**
   - `lifetime_purchases`: 2

---

### ✅ Test 9: Error Handling

**Goal:** Verify graceful error handling

**Test Cases:**

1. **Stripe Down:**
   - Temporarily remove `STRIPE_SECRET_KEY`
   - Try to purchase
   - **Expected:** 500 error with message

2. **Invalid Session ID:**
   - Navigate to `/purchase/success?session_id=invalid`
   - **Expected:** "Payment verification failed" error

3. **Credit Consumption Failure:**
   - Mock database failure
   - **Expected:** 500 error, credit NOT consumed

4. **Double Credit Usage:**
   - Use credit for analysis
   - Attempt same analysis again
   - **Expected:** Paywall (credit already used)

---

## Edge Cases

### Edge Case 1: Anonymous Users

- **Scenario:** User not logged in
- **Behavior:**
  - Can view cached analyses (free)
  - Cannot generate new analyses (must sign in)
  - Cannot purchase (must sign in)

### Edge Case 2: Cached Stock with Context

- **Scenario:** User adds context to cached stock
- **Behavior:**
  - Cache is bypassed (context makes it unique)
  - Fresh AI generation
  - Counts against rate limit or uses credit

### Edge Case 3: Multi-Symbol Analysis

- **Scenario:** User enters "AAPL, TSLA"
- **Behavior:**
  - Not cached (only single symbols cached)
  - Counts as 2 analyses (rate limit)
  - Would need 2 credits (not implemented yet)

### Edge Case 4: Simultaneous Purchases

- **Scenario:** User opens 2 tabs, buys in both
- **Behavior:**
  - Both succeed (Stripe handles idempotency)
  - Credits: 1 + 1 = 2

### Edge Case 5: Pro User with Credits

- **Scenario:** Pro user has leftover credits
- **Behavior:**
  - Credits NOT used (Pro is unlimited)
  - Credits saved for if they cancel Pro

---

## Performance Benchmarks

### Latency Targets

| Scenario | Target | Acceptable | Unacceptable |
|----------|--------|------------|--------------|
| Cache Hit | <100ms | <200ms | >500ms |
| Cache Miss (AI) | 2-4s | <6s | >10s |
| Purchase Flow | N/A (Stripe) | <3s redirect | >10s redirect |
| Verification | <500ms | <1s | >3s |

### Cost Targets

| Metric | Target | Current | Notes |
|--------|--------|---------|-------|
| Cache Hit Rate | >80% | TBD | After pre-generation |
| Cost per Request | <$0.01 | $0.006 (est) | With caching |
| Monthly AI Cost (1M req) | <$10K | $6K (est) | 80% cached |

---

## Automated Tests (Future)

```typescript
// test/caching.test.ts
describe('Caching System', () => {
  it('should cache single-symbol requests', async () => {
    // First request - cache miss
    const res1 = await POST('/api/debate', { symbols: ['AAPL'] });
    expect(res1.cached).toBe(false);

    // Second request - cache hit
    const res2 = await POST('/api/debate', { symbols: ['AAPL'] });
    expect(res2.cached).toBe(true);
    expect(res2.result).toEqual(res1.result);
  });

  it('should not cache requests with context', async () => {
    const res = await POST('/api/debate', {
      symbols: ['AAPL'],
      context: 'earnings'
    });
    expect(res.cached).toBe(false);
  });
});

// test/pay-per-use.test.ts
describe('Pay-Per-Use', () => {
  it('should consume credit when free tier exhausted', async () => {
    // Setup: User with 3 debates this month, 1 credit
    const user = await createTestUser({
      debatesThisMonth: 3,
      purchasedAnalyses: 1
    });

    // Attempt 4th analysis
    const res = await POST('/api/debate', { symbols: ['AAPL'] });
    expect(res.status).toBe(200);

    // Verify credit consumed
    const updated = await getUser(user.id);
    expect(updated.purchasedAnalyses).toBe(0);
  });

  it('should show paywall when no credits', async () => {
    // Setup: User with 3 debates, 0 credits
    const user = await createTestUser({
      debatesThisMonth: 3,
      purchasedAnalyses: 0
    });

    // Attempt 4th analysis
    const res = await POST('/api/debate', { symbols: ['AAPL'] });
    expect(res.status).toBe(429);
    expect(res.body.options).toBeDefined();
    expect(res.body.options.payPerUse.price).toBe(1.99);
  });
});
```

---

## Success Criteria

### ✅ Caching System

- [ ] Cache hit rate >50% after pre-generation
- [ ] Cache hit response time <200ms
- [ ] Cache misses properly generate and store
- [ ] Pre-generation script runs without errors

### ✅ Pay-Per-Use

- [ ] Purchase flow completes successfully
- [ ] Credits are added to user account
- [ ] Credits are consumed correctly
- [ ] Paywall shows both options (pay-per-use + subscription)
- [ ] Database accurately tracks purchased_analyses and lifetime_purchases

### ✅ Rate Limiting

- [ ] Free tier (3/month) enforced
- [ ] Pro users bypass all limits
- [ ] Cached results don't count against limits
- [ ] Monthly reset works correctly

### ✅ Integration

- [ ] All TypeScript compiles without errors
- [ ] No console errors in browser
- [ ] Database migrations apply cleanly
- [ ] Stripe webhooks process correctly

---

## Rollback Plan

If issues arise in production:

```bash
# 1. Revert to previous commit
git revert HEAD~3..HEAD

# 2. Revert database changes
ALTER TABLE users
DROP COLUMN purchased_analyses,
DROP COLUMN lifetime_purchases,
DROP COLUMN last_purchase_at;

# 3. Redeploy
git push origin main
```

---

## Monitoring

### Key Metrics to Track

1. **Cache Performance:**
   - Cache hit rate (goal: >80%)
   - Cache response time (goal: <100ms)
   - Cache storage size

2. **Revenue Metrics:**
   - Pay-per-use purchases per day
   - Conversion rate (free → pay-per-use)
   - Upgrade rate (pay-per-use → Pro)

3. **Cost Metrics:**
   - AI API costs per day
   - Cost per request (with vs without caching)
   - Total monthly AI cost

4. **User Behavior:**
   - % of users hitting free tier limit
   - % of users purchasing credits
   - Average credits purchased per user
   - Time to first purchase

---

## Next Steps After Testing

1. **Deploy to production**
2. **Set up Upstash Redis** (if using in-memory dev cache)
3. **Run pre-generation** for top 100 stocks
4. **Configure GitHub Actions** for daily cache refresh
5. **Monitor metrics** for first week
6. **Optimize cache TTL** based on data
7. **Implement bulk packs** (5 for $7.50, etc.)
8. **Add upsell logic** (after 5 purchases → Pro)
