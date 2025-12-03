# Echo Chamber - AI Trading Coach Design Guidelines

## Design Philosophy
A premium financial analysis tool combining Coinbase's trust and clarity with Linear's modern sophistication. The design balances professional credibility with approachable usability through refined visual hierarchy, subtle depth, and strategic use of color.

**Design Approach**: Design System (Material Design + Apple HIG principles)
- Depth through elevation and subtle shadows (not flat)
- Clear information hierarchy
- Purposeful color as meaning
- Premium touches without decoration

## Color System

### Core Palette
**Primary Blue (Neutral)**: `#0052FF` - Trust, stability, neutral analysis
**Success Green (Bull)**: `#00D395` - Bullish, gains, positive
**Error Red (Bear)**: `#FF5F57` - Bearish, losses, negative
**Warning Amber**: `#FFB800` - Caution, alerts

### Background Layers (Light Mode)
**Base**: `#F8F9FA` - Main background (not pure white for reduced eye strain)
**Elevated**: `#FFFFFF` - Cards, input areas
**Interactive**: `#F0F2F5` - Hover states

### Background Layers (Dark Mode)
**Base**: `#0A0B0D` - Main background
**Elevated**: `#141519` - Primary cards
**Raised**: `#1E2025` - Secondary cards, nested elements
**Interactive**: `#252830` - Hover states

### Text Hierarchy
**Primary**: `#0A0B0D` (light) / `#FFFFFF` (dark)
**Secondary**: `#5B616E` (light) / `#8A919E` (dark)
**Tertiary**: `#8A919E` (light) / `#5B616E` (dark)

### Borders & Dividers
**Strong**: `#E0E3E7` (light) / `#2C2F36` (dark)
**Subtle**: `#F0F2F5` (light) / `#1E2025` (dark)

## Typography

**Font Stack**: Inter, system-ui, sans-serif
**Monospace**: SF Mono, Consolas, monospace (ticker symbols, prices)

### Scale
- **Display**: 56px, weight 700, line-height 1.1
- **H1**: 36px, weight 700, line-height 1.2
- **H2**: 28px, weight 600, line-height 1.3
- **H3**: 20px, weight 600, line-height 1.4
- **Body Large**: 18px, weight 400, line-height 1.6
- **Body**: 16px, weight 400, line-height 1.5
- **Small**: 14px, weight 500, line-height 1.4
- **Caption**: 12px, weight 500, line-height 1.3, letter-spacing 0.3px

## Spacing System
Based on 8px grid (Tailwind units: 2, 3, 4, 6, 8, 10, 12, 16, 20, 24)
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-6 on desktop, gap-4 on mobile

## Layout Structure

### Header
- Height: 72px
- Background: Elevated layer with subtle border-bottom
- Logo left, navigation center (for future features), CTA right
- Sticky on scroll with backdrop blur

### Main Container
- Max-width: max-w-7xl
- Padding: px-4 mobile, px-8 desktop
- Sections clearly separated with py-12 spacing

### Analysis Input Section
- Prominent card with elevated shadow
- Two-column on desktop: ticker input left, generate CTA right
- Single column on mobile
- Clear labeling and helper text

### Results Grid
- Three-column desktop (lg:grid-cols-3)
- Single column mobile
- Equal height cards with gap-6
- Cards fade in with stagger animation

### Footer
- Minimal, two-row layout
- Top row: disclaimer, educational message
- Bottom row: legal links, pricing info

## Component Design

### Cards (Perspective Analysis)
**Structure**:
- Border-radius: 16px (rounded-2xl)
- Padding: p-8
- Shadow: subtle elevation (shadow-lg)
- Border: 1px with accent color at 20% opacity

**Bull Card**:
- Accent: 4px left border in Success Green
- Icon: TrendingUp in Success Green
- Background tint: `#00D39505` (ultra-subtle)
- Hover: Lift shadow (shadow-xl)

**Bear Card**:
- Accent: 4px left border in Error Red
- Icon: TrendingDown in Error Red
- Background tint: `#FF5F5705`
- Hover: Lift shadow

**Neutral Card**:
- Accent: 4px left border in Primary Blue
- Icon: BarChart in Primary Blue
- Background tint: `#0052FF05`
- Hover: Lift shadow

### Buttons
**Primary CTA**:
- Height: 56px large, 48px default
- Border-radius: 12px
- Background: Gradient from Primary Blue to slightly darker
- Shadow: medium elevation
- Icon: Sparkles before text
- Hover: Lift with shadow-lg

**Secondary**:
- Transparent with 2px border
- Same dimensions as primary
- Hover: Subtle background fill

**Ghost**:
- No border, minimal background
- Hover: Light background tint

### Input Fields
- Height: 56px
- Border-radius: 12px
- 2px border (strong border color)
- Focus: Primary blue ring, lift shadow
- Label above with small weight 600
- Helper text below in secondary color

### Badges
- Border-radius: 8px
- Padding: py-1.5 px-3
- Font: caption size, weight 600
- Slight shadow for depth

## Visual Hierarchy Enhancements

### Depth & Elevation
Use shadow system (not flat):
- **sm**: Subtle cards
- **md**: Interactive elements
- **lg**: Elevated cards, modals
- **xl**: Active/hover states

### Section Separation
- Background alternation: base → elevated → base
- Generous vertical spacing (py-16 between major sections)
- Subtle dividers where needed

### Emphasis Techniques
- Color contrast for CTAs (saturated blue vs muted backgrounds)
- Size variation (display text vs body)
- Weight contrast (700 headings vs 400 body)
- Spacing isolation (generous margins around key elements)

## Dark Mode Strategy
- Automatic based on system preference
- Invert elevation (darker = lower, lighter = higher)
- Reduce color saturation by 10-15%
- Maintain contrast ratios (4.5:1 minimum)
- Borders more prominent in dark mode

## Responsive Behavior
**Mobile** (base to md):
- Stack all columns
- Reduce padding to p-4
- Smaller typography scale (0.875× multiplier)
- Full-width cards

**Tablet** (md to lg):
- Two-column grids where appropriate
- Medium padding p-6

**Desktop** (lg+):
- Three-column grids
- Full spacing scale
- Hover states enabled

## Iconography
Lucide React icons with 24px default size:
- MessageSquare (branding)
- TrendingUp (bull)
- TrendingDown (bear)
- BarChart (neutral)
- Sparkles (generate)
- ArrowRight (CTAs)
- Info (tooltips)

## Animation Principles
- Duration: 200ms micro, 300ms standard
- Easing: cubic-bezier(0.4, 0.0, 0.2, 1)
- Cards: Fade + translateY(8px)
- Buttons: Scale 0.98 on press
- Loading: Subtle pulse on skeleton screens

## Images
**No hero image**. This is a utility-first tool where immediate functionality takes priority. The input section serves as the focal point with clear CTAs.

## Accessibility
- WCAG 2.1 AA contrast (minimum 4.5:1)
- Keyboard navigation with visible focus rings
- Screen reader labels for all interactive elements
- Color not sole indicator (icons + text reinforce meaning)

## Special Considerations
- Perspective cards use both color AND icons to differentiate
- Pricing transparency in header or footer
- Disclaimer prominently placed but not obstructive
- Educational tone in microcopy