# TerraMind AI

**Understand the planet. Anticipate the risk. Protect what matters.**

A premium, cinematic global disaster intelligence platform built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and React Three Fiber. It unifies live seismic and environmental feeds from public government and scientific APIs, visualizes them on an interactive map and 3D Earth, and provides an AI analyst that grounds every answer in verified data.

---

## Features

### Cinematic Landing Page
- Full-screen **3D procedural Earth** with atmospheric rim glow, slow rotation, and floating particle field
- Aurora gradient backdrops, translucent glassmorphism navigation, oversized editorial typography
- Smooth scroll-reveal animations, spring-based micro-interactions, refined loading sequence
- Respects `prefers-reduced-motion`

### Global Intelligence Dashboard
- Full-width **interactive world map** with pulsing event markers color-coded by hazard type
- **Real-time event feed** backed by actual API results (USGS + NASA EONET)
- **Filters** by hazard category, severity, time window, and full-text search
- **Event detail drawer** with source, timestamp, coordinates, magnitude, verified status, and official-source links
- **Statistics**: active events, top hazard, severe count, max magnitude, category distribution, and event timeline
- Live / partial / demo status indicators — never claims a feed is live if it failed

### AI Disaster Analyst
- Secure **server-side edge function** (Supabase Deno) — API keys never reach the browser
- Grounded in retrieved event data — cites sources and timestamps, explains uncertainty
- Directs users to **official authorities** for severe weather or urgent danger
- Graceful fallback: if no AI provider key is configured, returns a data-grounded summary built from verified context
- Supports OpenAI and Anthropic providers via environment variables

### Disaster Explorer & Hazard Pages
- Dedicated pages for earthquakes, floods, cyclones, wildfires, volcanic eruptions, tsunamis, droughts, landslides, extreme heat, and severe storms
- Each page shows recent events from the live feed, hazard-specific preparedness guidance, and official resource links
- Hash-based routing (`#/hazard/earthquake`, etc.)

### Preparedness & Resilience
- Practical, vetted guidance for emergency kits, communication, shelter, water, and first aid
- Calm emergency-information panel directing to official channels

### Transparent Sources
- Every event traces to a documented public API
- Methodology section explaining the data pipeline and AI grounding approach

---

## Data Sources

| Source | API | Status |
|--------|-----|--------|
| **USGS Earthquake Hazards** | `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson` | Live integration |
| **NASA EONET** | `https://eonet.gsfc.nasa.gov/api/v3/events?status=open` | Live integration |
| **GDACS** | `https://www.gdacs.org` | Referenced (RSS/XML feeds vary by hazard) |

The frontend calls a **provider abstraction layer** that:
1. Fetches USGS and NASA EONET in parallel
2. Applies client-side caching (sessionStorage) with TTLs
3. Retries failed requests with exponential backoff
4. Falls back to clearly-labeled **demo data** if all live feeds are unreachable
5. Normalizes events into a unified `DisasterEvent` type with source, timestamp, location, severity, and verified status

Demo data is always clearly labeled. The app never fabricates live events or claims a feed is live if it failed.

---

## Setup

### Prerequisites
- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

The dev server runs automatically in Bolt. For local development outside Bolt:

```bash
npm install
npm run dev      # start Vite dev server
npm run build    # production build
npm run typecheck # TypeScript check
```

### Environment Variables

Supabase variables are pre-populated automatically in Bolt. For the AI analyst, set these as **edge function secrets** (via Supabase dashboard or CLI):

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_API_KEY` or `OPENAI_API_KEY` | No* | API key for the AI provider |
| `ANTHROPIC_API_KEY` | No* | Alternative: Anthropic API key |
| `AI_PROVIDER` | No | `openai` (default) or `anthropic` |
| `AI_MODEL` | No | Model name (default: `gpt-4o-mini` or `claude-3-5-sonnet-20241022`) |
| `SUPABASE_URL` | Yes | Pre-populated in Bolt |
| `SUPABASE_ANON_KEY` | Yes | Pre-populated in Bolt |

\* If no AI key is configured, the analyst runs in **data-grounded summary mode** — it returns structured summaries from verified feed data without calling an external LLM. The app is fully functional without an AI key.

---

## Architecture

```
src/
├── components/
│   ├── earth/          # 3D Earth scene (R3F, shaders, particles)
│   ├── dashboard/      # Filters, feed, drawer, stats
│   ├── map/            # SVG world map with event markers
│   ├── layout/         # Navbar, Footer
│   ├── sections/       # Hero, Dashboard, AIAnalyst, Explorer, etc.
│   └── ui/             # Reveal animations, Preloader
├── data/
│   └── providers.ts    # Provider abstraction: USGS, EONET, caching, fallback
├── hooks/
│   └── useDisasterEvents.ts  # Live data hook with auto-refresh
├── lib/
│   └── utils.ts        # Time formatting, lat/lon projection, filtering
└── types/
    └── index.ts        # DisasterEvent, HazardCategory, severity metadata

supabase/functions/
└── ai-analyst/         # Edge function: grounded AI analyst
```

### AI Analyst Edge Function

The AI analyst runs as a Supabase Edge Function (`supabase/functions/ai-analyst`). It:
- Receives the user's question + context events from the frontend
- Builds a grounded context summary from verified feed data
- Calls the configured AI provider (OpenAI or Anthropic) server-side
- Returns the answer with a notice that it's AI-generated and grounded in feed data
- Falls back to data-grounded summary mode if no provider key is set

API keys are stored as edge function secrets and never exposed in frontend code.

---

## Limitations

- **Not an emergency alert system.** TerraMind AI provides intelligence and context, not real-time emergency alerts. For emergencies, always follow official authorities.
- **API availability** depends on the public feed providers. If USGS or EONET is down, the app shows clearly-labeled demo data.
- **AI responses** are grounded in provided context but may contain inaccuracies. They explain uncertainty and never claim certainty.
- **GDACS** integration is referenced but not fully wired (RSS/XML feeds vary by hazard and lack a unified JSON endpoint).
- **Map** uses a stylized SVG world outline, not a full-precision geographic projection.

---

## Deployment

### Bolt
The project runs and deploys automatically within Bolt. The Supabase instance and edge function are provisioned automatically.

### Manual (Supabase + static hosting)
1. Build the frontend: `npm run build`
2. Deploy `dist/` to any static host (Vercel, Netlify, Cloudflare Pages)
3. Deploy the edge function via the Supabase MCP tool or Supabase dashboard
4. Set AI provider secrets in the Supabase dashboard under Edge Functions > Secrets

---

## Tech Stack

- **React 18** + **TypeScript**
- **Vite 7** — build tooling
- **Tailwind CSS 3** — styling
- **Framer Motion** — animations
- **React Three Fiber** + **Three.js** — 3D Earth
- **Lucide React** — icons
- **Supabase** — edge functions, backend

---

## License

Data is sourced from public government and scientific APIs (USGS, NASA, GDACS). This project is an independent intelligence platform and is not affiliated with those agencies.
