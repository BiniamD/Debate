# Echo Chamber - AI Trading Coach

## Overview

Echo Chamber is a full-stack web application that provides multi-perspective AI analysis for stock investments. The application generates three distinct viewpoints (bull case, bear case, and neutral analysis) for stock symbols using xAI's Grok model. Supports analyzing up to 5 stocks simultaneously with comma-separated input. The core philosophy is focused execution: one killer feature done exceptionally well rather than spreading across many features.

The name "Echo Chamber" is ironic - while the term typically refers to a space where only one viewpoint is reinforced, this platform deliberately breaks the echo by presenting multiple opposing perspectives.

The application follows the Coinbase Design System aesthetic with clean, Swiss-inspired design, flat UI elements, and clear visual separation between different perspectives through color coding.

## Key Features

- **Multi-perspective AI Analysis**: Bull, bear, and neutral viewpoints for any stock powered by xAI Grok 4
- **Multi-Symbol Analysis**: Analyze up to 5 stocks simultaneously with comma-separated input and tabbed results UI
- **Shareable Debates**: Public URLs for sharing debates on Twitter/social media (/debate/:id routes)
- **Rate Limiting**: Free tier with 3 analyses/month tracked server-side (counting per symbol analyzed)
- **Monetization**: Free tier vs Pro ($9/month via Stripe) with paywall modal when limit reached
- **Share Functionality**: Twitter share with pre-filled tweets and copy link to clipboard
- **Clerk Auth**: User authentication via Clerk (replaced Replit Auth on Dec 2024)

## Application Routes

- `/` - Landing page with hero section, features overview, and pricing tiers
- `/app` - Dashboard with Analyze (default) and History tabs (requires authentication)
- `/app?tab=history` - Deep link to History tab on dashboard
- `/debate/:id` - Public shareable debate view (no auth required)
- `/checkout/success` - Stripe checkout success page

## Navigation Architecture

**Unified App Shell Pattern:**
- AppLayout component (client/src/components/app-layout.tsx) provides persistent header for authenticated pages
- Dashboard page (client/src/pages/dashboard.tsx) combines Analyze and History into tab-based interface
- Landing page remains separate for marketing purposes
- Login redirects to /app (not landing page)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 19 with TypeScript for type safety
- Vite as the build tool for fast development and optimized production builds
- Wouter for lightweight client-side routing

**UI Component System**
- Shadcn/ui component library with Radix UI primitives
- Custom "New York" style variant configured
- Tailwind CSS for utility-first styling with extensive customization
- Design system based on CSS variables for theming flexibility

**State Management**
- TanStack Query (React Query) for server state management
- Custom query client with centralized API request handling
- No global client state - relies on server state and local component state

**Styling Approach (Coinbase Design System)**
- Clean, flat design with light/dark mode support
- Primary blue (#0052FF) for key actions and branding
- Coinbase semantic colors: green (#00D395) for bull, red (#FF5F57) for bear, blue (#0052FF) for neutral
- Consistent spacing scale following 4px base unit
- Inter font family for clean, modern typography
- Minimal shadows, relying on borders and subtle backgrounds

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for the HTTP server
- Single API endpoint architecture (`POST /api/debate`)
- Health check endpoint for monitoring (`GET /api/health`)

**API Design**
- RESTful endpoint accepting stock symbol and optional context
- Structured JSON responses with three perspective objects
- Error handling with appropriate HTTP status codes
- Request/response logging middleware

**Development Tools**
- Development mode with Vite middleware integration for HMR
- Production mode serves static assets from dist/public
- Custom build script using esbuild for server bundling

### AI Integration

**xAI Grok API**
- Grok 4-1-fast model (grok-4-1-fast) for analysis generation
- Uses OpenAI SDK with base URL pointing to xAI API for compatibility
- System prompt engineering for consistent three-perspective output format
- Structured JSON response format enforced through prompting
- Each perspective includes: title, multi-paragraph argument, and key points array
- Multi-symbol support: Processes up to 5 symbols in a single request with batched prompt

**Analysis Structure**
- Bull Case: Optimistic view, growth catalysts, competitive advantages
- Bear Case: Risks, downsides, competitive threats
- Neutral Analysis: Data-driven, objective metrics, balanced assessment

**Multi-Symbol Processing**
- Comma-separated input parsed and normalized (uppercase, deduplicated)
- Sequential processing for API rate limit management
- Results stored as keyed object (symbol -> bull/bear/neutral)
- Tabbed UI for navigating between symbol analyses

### Database Layer

**ORM & Schema**
- Drizzle ORM configured for PostgreSQL
- Schema definitions in shared/schema.ts for type sharing
- Migration support through Drizzle Kit
- Database credentials managed via environment variables

**Current State**
- PostgreSQL database with debates and users tables
- Debates saved with unique nanoid IDs for sharing
- DatabaseStorage class with full CRUD operations
- Stripe integration for Pro subscriptions

### Type Safety & Validation

**Schema Validation**
- Zod schemas for runtime type validation
- Shared types between client and server via @shared directory
- Request validation using debateRequestSchema
- Response validation using debateResponseSchema and perspectiveSchema

**TypeScript Configuration**
- Strict mode enabled for maximum type safety
- Path aliases for clean imports (@/, @shared/, @assets/)
- Incremental compilation for faster rebuilds
- ESNext module system throughout

### Build & Deployment

**Build Process**
- Custom build script (script/build.ts) orchestrates client and server builds
- Vite builds client to dist/public
- Esbuild bundles server to dist/index.cjs
- Selective dependency bundling to reduce cold start times

**Production Optimization**
- Server dependencies allowlist for bundling frequently used packages
- External dependencies list to avoid bundling large/native modules
- Static file serving from Express in production
- Source maps for debugging

## External Dependencies

### AI Services
- **xAI Grok API** - Primary AI service for generating multi-perspective stock analysis
  - API Key: XAI_API_KEY environment variable
  - Model: grok-4-1-fast
  - Accessed via OpenAI SDK with custom base URL (https://api.x.ai/v1)

### Database Services
- **Neon Database** - Serverless PostgreSQL database
  - Connection: DATABASE_URL environment variable
  - Accessed via @neondatabase/serverless driver
  - Managed through Drizzle ORM

### Authentication
- **Clerk** - Authentication and user management
  - Frontend: @clerk/clerk-react with ClerkProvider in main.tsx
  - Backend: @clerk/express middleware in server/clerkAuth.ts
  - Environment variables:
    - CLERK_PUBLISHABLE_KEY_ECO (backend)
    - CLERK_SECRET_KEY_ECO (backend)
    - VITE_CLERK_PUBLISHABLE_KEY_ECO (frontend)
  - Uses SignInButton/UserButton components for auth UI
  - getAuth() from @clerk/express for backend session verification

### Payment Processing
- **Stripe** - Payment processing for Pro subscriptions ($9/month)
  - Uses dual credential system in server/stripeClient.ts:
    1. Tries Replit Stripe connector first (for development)
    2. Falls back to environment variables (for production or when connector unavailable)
  - Environment variables (required for production):
    - STRIPE_PUBLISHABLE_KEY (pk_live_* for production)
    - STRIPE_SECRET_KEY (sk_live_* for production)
  - Uses stripe-replit-sync for webhook handling and data sync
  - Checkout flow redirects to Stripe hosted checkout page

### UI Component Libraries
- **Radix UI** - Headless UI primitives (accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toast, toggle, tooltip)
- **Lucide React** - Icon library for UI elements
- **Shadcn/ui** - Pre-built accessible components built on Radix UI

### Styling & Design
- **Tailwind CSS** - Utility-first CSS framework with custom configuration
- **PostCSS** - CSS processing with Autoprefixer
- **class-variance-authority** - Utility for creating component variants
- **clsx** & **tailwind-merge** - Classname manipulation utilities

### Form & Data Management
- **React Hook Form** - Form state management
- **Zod** - Schema validation and type inference
- **@hookform/resolvers** - Integration between React Hook Form and Zod
- **TanStack Query** - Asynchronous state management

### Development Tools
- **Vite** - Build tool and dev server
- **@vitejs/plugin-react** - React plugin for Vite
- **Replit Plugins** - Development plugins for runtime error overlay, cartographer, and dev banner (dev only)
- **tsx** - TypeScript execution for development
- **esbuild** - JavaScript bundler for production builds

### Session & Storage
- **Express Session** - Session middleware (configured but minimal use)
- **connect-pg-simple** - PostgreSQL session store
- **Drizzle Zod** - Integration between Drizzle ORM and Zod schemas

### Utilities
- **date-fns** - Date manipulation library
- **nanoid** - Unique ID generation
- **cmdk** - Command menu component