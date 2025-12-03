# Echo Chamber - Coinbase Design System

## Design Philosophy
Following Coinbase's design principles: clean, functional, Swiss-inspired design that balances crypto innovation with financial trust. The design emphasizes clarity, simplicity, and modern sophistication.

## Core Design Principles
- **Single Focus**: One killer feature executed flawlessly - no distractions
- **Clarity First**: Clean typography, generous whitespace, clear hierarchy
- **Trust Through Design**: Blue primary color evokes reliability and security
- **Flat & Modern**: Minimal shadows, rely on borders and background colors

## Color Palette

### Primary Colors
- **Blue Ribbon (Primary)**: `#0052FF` - Key actions, trust, security
- **White**: `#FFFFFF` - Clarity, light backgrounds
- **Woodsmoke (Dark)**: `#0A0B0D` - Text, dark mode backgrounds

### Semantic Colors
- **Success/Bull**: `#00D395` - Positive trends, gains
- **Error/Bear**: `#FF5F57` - Negative trends, losses, errors
- **Neutral**: `#0052FF` - Balanced analysis (uses primary blue)
- **Warning**: `#FFB800` - Caution states

### Background Hierarchy (Light Mode)
- **Primary Background**: `#FFFFFF`
- **Secondary Background**: `#F8F9FA`
- **Card Background**: `#FFFFFF`

### Background Hierarchy (Dark Mode)
- **Primary Background**: `#0A0B0D`
- **Secondary Background**: `#141519`
- **Card Background**: `#1E2025`

### Text Hierarchy
- **Primary Text**: `#0A0B0D` (light) / `#FFFFFF` (dark)
- **Secondary Text**: `#5B616E` (light) / `#8A919E` (dark)
- **Muted Text**: `#8A919E` (light) / `#5B616E` (dark)

### Borders
- **Default**: `#E8EAED` (light) / `#2C2F36` (dark)
- **Subtle**: `#F0F2F5` (light) / `#1E2025` (dark)

## Typography

### Font Family
- **Primary**: Inter, -apple-system, BlinkMacSystemFont, sans-serif
- **Mono**: SF Mono, Menlo, monospace (for stock symbols, financial data)

### Font Sizes
- **Display/Hero**: 48px / 3rem (font-weight: 600)
- **Heading 1**: 32px / 2rem (font-weight: 600)
- **Heading 2**: 24px / 1.5rem (font-weight: 600)
- **Heading 3**: 20px / 1.25rem (font-weight: 600)
- **Body**: 16px / 1rem (font-weight: 400)
- **Small**: 14px / 0.875rem (font-weight: 400)
- **Micro**: 12px / 0.75rem (font-weight: 500)

### Line Heights
- **Tight**: 1.2 (headings)
- **Normal**: 1.5 (body)
- **Relaxed**: 1.75 (paragraphs)

## Spacing Scale
Following 4px base unit (Tailwind units):
- `space-1`: 4px (1)
- `space-2`: 8px (2)
- `space-3`: 12px (3)
- `space-4`: 16px (4)
- `space-6`: 24px (6)
- `space-8`: 32px (8)
- `space-12`: 48px (12)
- `space-16`: 64px (16)

## Layout System

**Structure**:
- Centered single-column layout with max-width container (max-w-6xl)
- Clean header with branding
- Input section as prominent card
- Results grid: 3-column desktop (equal width), single-column mobile
- Minimal footer

## Component Design

### Buttons
- **Primary**: Blue (#0052FF) background, white text
- **Secondary**: Transparent with blue border, blue text
- **Ghost**: No background, subtle hover state
- **Border Radius**: 8px (rounded-lg)
- **Height**: 40px default, 48px large

### Cards
- **Background**: White (light) / `#1E2025` (dark)
- **Border**: 1px solid border color
- **Border Radius**: 12px (rounded-xl)
- **Padding**: 24px (p-6)
- **Shadow**: None (flat design)

### Input Fields
- **Height**: 48px
- **Border**: 1px solid border color
- **Border Radius**: 8px
- **Focus State**: 2px blue ring

### Badges/Pills
- **Border Radius**: 6px
- **Padding**: 4px 12px
- **Font Size**: 12px, font-weight: 500

## Perspective Cards (Echo Chamber Specific)

### Bull Case
- **Accent Color**: `#00D395` (Coinbase green)
- **Background**: `#00D39508` (very light tint)
- **Border**: `#00D39540` (40% opacity)
- **Icon**: TrendingUp

### Bear Case
- **Accent Color**: `#FF5F57` (Coinbase red)
- **Background**: `#FF5F5708` (very light tint)
- **Border**: `#FF5F5740` (40% opacity)
- **Icon**: TrendingDown

### Neutral Analysis
- **Accent Color**: `#0052FF` (Coinbase blue)
- **Background**: `#0052FF08` (very light tint)
- **Border**: `#0052FF40` (40% opacity)
- **Icon**: Minus

## Interactive Elements
- Buttons with smooth hover states (slightly darker)
- Cards with subtle border highlight on hover
- No excessive scale transforms (keep it professional)

## Animations & Transitions
- **Duration**: 150-200ms for micro-interactions
- **Easing**: ease-out for most transitions
- **Approach**: Subtle, purposeful animations only
- Cards fade in with slight upward movement

## Responsive Behavior

**Mobile** (base):
- Single column stack
- Full-width cards
- Smaller padding (p-4)

**Desktop** (md breakpoint):
- 3-column grid for perspective cards
- max-w-6xl container
- Larger padding (p-6)

## Iconography
Use lucide-react icons:
- MessageSquare for branding
- TrendingUp, TrendingDown, Minus for perspectives
- Sparkles for generate action
- Loader2 for loading state
- Link2 for sharing functionality

## Accessibility
- Maintain WCAG 2.1 AA contrast ratios
- Never use color alone to communicate information
- Support keyboard navigation
- Include proper ARIA labels

## Special Considerations

**Trust & Credibility**:
- Clean, professional Coinbase aesthetic builds confidence
- Clear disclaimer in footer
- Balanced presentation of all perspectives

**Educational Focus**:
- Footer messaging emphasizes learning over financial advice
- Pricing clarity upfront (free tier with paid upgrade)
- No misleading promises

## Images
No hero images. This is a utility-focused tool where functionality and immediate usability take precedence over visual storytelling.
