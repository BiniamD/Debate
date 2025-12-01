# Design Guidelines for "Debate" AI Trading Coach

## Design Approach
**Reference-Based**: Financial data tools aesthetic inspired by modern fintech applications (Robinhood's clarity + Stripe's restraint + contemporary trading platforms). Dark, premium feel with glass-morphism for a sophisticated, trustworthy interface.

## Core Design Principles
- **Single Focus**: One killer feature executed flawlessly - no distractions
- **Premium Dark Theme**: Establish credibility and reduce eye strain for data-heavy content
- **Perspective Clarity**: Each viewpoint (bull/bear/neutral) must be instantly recognizable through color coding

## Layout System

**Spacing**: Use Tailwind units of 4, 6, 8, 12, and 16 for consistent rhythm throughout the application.

**Structure**:
- Centered single-column layout with max-width container
- Header section with branding and clear value proposition
- Input section as focal glass card
- Results grid: 3-column desktop (equal width), single-column mobile
- Footer with pricing and disclaimer

## Visual Aesthetics

**Background Treatment**:
- Dark gradient background (slate-900 to blue-900 spectrum)
- Creates depth and premium feel without overwhelming content

**Glass Morphism Cards**:
- Semi-transparent white overlay with backdrop blur
- Subtle white borders for definition
- Elevated feel with soft shadows

## Typography Hierarchy

**Headers**:
- Large, bold for main title with icon pairing
- Medium weight for tagline (engaging, conversational)
- Lighter weight for subtitle (informational)

**Body Text**:
- Clear contrast between white headers and lighter gray body text
- Medium-sized key points for scannability
- Smaller muted text for disclaimer and footer content

## Component Design

### Input Section
- Prominent glass card elevated above background
- Stock symbol input: uppercase transformation, clear placeholder examples
- Optional context textarea: 3 rows, conversational placeholder
- Primary action button: vibrant blue, clear icon pairing
- Loading state: centered spinning icon
- Error messages: red accent, clear visibility

### Perspective Cards (Core Feature)
Three distinct but harmonious card designs:

**Bull Card (Optimistic)**:
- Green accent color (borders, icon, background tint)
- Upward trending icon
- Positive, growth-focused visual language

**Bear Card (Pessimistic)**:
- Red accent color (borders, icon, background tint)
- Downward trending icon
- Warning, cautionary visual language

**Neutral Card (Balanced)**:
- Blue accent color (borders, icon, background tint)
- Neutral/horizontal icon
- Data-driven, objective visual language

**Card Structure** (all three):
- Icon positioned top-left for immediate recognition
- Title as header
- Multi-paragraph argument text with breathing room
- Bulleted key points list (3 items)
- Subtle background tint matching accent color (5% opacity)
- Border accent matching theme color (50% opacity)

### Interactive Elements
- Share button: secondary prominence, share icon
- Buttons with smooth hover states (darker variants)
- Cards with subtle scale transform on hover (1.05x)

## Animations & Transitions

**Entrance Animations**:
- Results cards: fade in with upward movement (20px translation)
- 0.5s ease-out timing for smooth, professional feel
- Staggered appearance feels natural without being distracting

**Micro-interactions**:
- Hover scale on cards for tactile feedback
- Button hover states for clear affordance
- Loading spinner rotation for activity indication

## Responsive Behavior

**Mobile** (base):
- Single column stack
- Full-width cards
- Maintained spacing hierarchy (smaller units)

**Desktop** (md breakpoint):
- 3-column grid for perspective cards
- Wider max-width container
- Increased spacing for breathing room

## Color Palette

**Perspectives** (accent colors only):
- Bull: Green (#10b981 spectrum)
- Bear: Red (#ef4444 spectrum)
- Neutral: Blue (#3b82f6 spectrum)

**Base UI**:
- Backgrounds: Dark slate and blue gradients
- Text: White for emphasis, light gray for body, muted gray for secondary
- Glass elements: Semi-transparent white overlays
- Primary action: Vibrant blue

## Iconography
Use lucide-react icons:
- MessageSquare for branding
- TrendingUp, TrendingDown, Minus for perspectives
- Sparkles for generate action
- Loader2 for loading state
- Share2 for sharing functionality

## Special Considerations

**Trust & Credibility**:
- Dark premium aesthetic builds confidence
- Clear disclaimer in footer (not hidden)
- Balanced presentation of all perspectives

**Educational Focus**:
- Footer messaging emphasizes learning over financial advice
- Pricing clarity upfront (free tier with paid upgrade)
- No misleading promises or guarantees

## Images
No hero images. This is a utility-focused tool where functionality and immediate usability take precedence over visual storytelling.