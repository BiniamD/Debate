# Design Guidelines for "Echo Chamber" AI Trading Coach

## Design Approach
**Reference-Based**: Modern fintech clarity (Robinhood + Stripe) meets organic warmth. EcoHoney theme combines professional credibility with approachable, natural aesthetics - warm honey/amber/gold foundation with eco-friendly green accents for a trustworthy, human-centered interface.

## Core Design Principles
- **Single Focus**: One killer feature executed flawlessly
- **Organic Warmth**: Honey-toned palette creates trust and reduces cognitive load
- **Perspective Clarity**: Each viewpoint instantly recognizable through warm color coding
- **Natural Credibility**: Professional financial tool with approachable, earth-toned aesthetic

## Layout System

**Spacing**: Tailwind units of 4, 6, 8, 12, and 16 for consistent rhythm.

**Structure**:
- Centered single-column layout (max-w-4xl)
- Header with branding and value proposition
- Input section as elevated focal card
- Results grid: 3-column desktop (equal width), single-column mobile
- Footer with pricing and educational disclaimer

## Visual Aesthetics

**Background Treatment**:
- Warm gradient: cream (50) to honey (100) to amber (50) spectrum
- Subtle organic texture overlay suggestion through gradient layers
- Light, inviting foundation that doesn't compete with content

**Card Design Philosophy**:
- Soft, organic cards with warm white/cream backgrounds
- Gentle shadows for depth without harshness
- Subtle honey-tinted borders for warmth
- Rounded corners (lg to xl) for natural, friendly feel

## Typography Hierarchy

**Headers**:
- Extra-large bold for main title with icon (text-amber-900)
- Medium weight tagline in warm gray (conversational tone)
- Regular weight subtitle (text-amber-700)

**Body Text**:
- Rich dark brown/amber for headers (900 weights)
- Warm gray for body text (700-600 weights)
- Lighter honey-gray for secondary content (500 weights)

## Component Design

### Input Section
- Elevated card with warm cream background (amber-50/white mix)
- Stock symbol input: uppercase, honey-toned focus ring (amber-400)
- Context textarea: 3 rows, warm placeholder text
- Primary button: Rich eco-green (emerald-600), gold hover state, leaf/sparkle icon
- Loading state: Rotating honey-gold spinner
- Error messages: Warm red-orange (rose-600), clear visibility

### Perspective Cards

**Bull Card (Optimistic)**:
- Eco-green accent (emerald-600 for borders, emerald-500 for icon)
- Soft green-tinted background (emerald-50)
- Upward trending icon
- Growth, sustainability visual language

**Bear Card (Cautionary)**:
- Warm amber accent (amber-700 for borders, amber-600 for icon)
- Honey-tinted background (amber-50)
- Downward trending icon
- Warning with warmth, not alarm

**Neutral Card (Balanced)**:
- Golden honey accent (yellow-600/amber-500 for borders and icon)
- Warm gold-tinted background (yellow-50/amber-50 mix)
- Horizontal/neutral icon
- Balanced, data-driven visual language

**Card Structure** (all three):
- Icon top-left (immediate recognition)
- Bold title header in matching accent color
- Multi-paragraph text with generous line-height (1.7-1.8)
- Bulleted key points (3 items, matching accent colored bullets)
- Gentle background tint (accent at 8% opacity)
- Border with accent color (40% opacity)
- Soft shadow for elevation

### Interactive Elements
- Share button: Secondary honey-gold outline, share icon
- Smooth hover transitions to darker/richer tones
- Cards with subtle lift on hover (shadow deepens, slight translate-y)

## Animations & Transitions

**Entrance**:
- Cards fade in with gentle upward movement (15px)
- 0.6s ease-out for organic, relaxed feel
- Staggered 100ms delay between cards

**Micro-interactions**:
- Gentle scale (1.02x) and shadow enhancement on card hover
- Button hover: Subtle darkening with smooth transition
- Focus states: Warm honey-gold rings

## Responsive Behavior

**Mobile**: Single column, full-width cards, reduced spacing (units 4, 6, 8)
**Desktop** (md+): 3-column grid, max-w-6xl container, generous spacing (units 8, 12, 16)

## Color Palette

**Perspectives**:
- Bull: Eco-green (emerald-600/500 spectrum)
- Bear: Warm amber (amber-700/600 spectrum)
- Neutral: Golden honey (yellow-600/amber-500 spectrum)

**Base UI**:
- Backgrounds: Cream to honey gradients (amber-50 to yellow-50)
- Card surfaces: Warm white (stone-50/amber-50)
- Text: Deep amber-brown (amber-900/800) for emphasis, amber-700/600 for body
- Primary action: Eco-green (emerald-600)
- Accents: Honey-gold (amber-400/500)

## Iconography
**lucide-react icons**:
- Leaf + MessageSquare for eco-friendly branding
- TrendingUp (bull), TrendingDown (bear), Minus (neutral)
- Sparkles for generate
- Loader2 for loading
- Share2 for sharing

## Special Considerations

**Trust Through Warmth**:
- Organic palette builds approachability and credibility
- Clear disclaimer in warm tone (not hidden)
- Balanced presentation honors all perspectives

**Educational Focus**:
- Footer emphasizes learning over advice (amber-700 text)
- Transparent pricing (free tier + paid, honey-gold callout)
- No misleading promises

**Accessibility**:
- Maintain 4.5:1+ contrast ratios with warm tones
- Focus indicators in amber-400 ring
- Clear visual hierarchy through size and weight

## Images
No hero images. Utility-focused tool where immediate functionality and warm, welcoming interface take precedence over visual storytelling. The organic color palette creates sufficient visual interest.