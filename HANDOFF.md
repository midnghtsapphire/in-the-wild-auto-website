# InTheWild — Developer Handoff

> **Owner:** Audrey Evans · @midnghtsapphire  
> **Date:** 2026-03-20  
> **Status:** Active development — backend wired, frontend complete, deployment configured

---

## What This Is

**InTheWild** is a full-stack AI app generator. A user types a description of an app they want, and InTheWild generates:
- A complete React frontend (HTML/CSS/JS)
- An Express.js backend with routes, controllers, and middleware
- A MySQL database schema with migrations
- A Docker-ready deployment config
- Optional React Native mobile app (iOS + Android)

It competes with Lovable, Bolt, and v0, but unlike those tools it generates complete backends — not just pretty frontends.

---

## Quick-Start (5 minutes)

```bash
git clone https://github.com/MIDNGHTSAPPHIRE/in-the-wild-auto-website.git
cd in-the-wild-auto-website

# 1. Install dependencies
npm install   # or: pnpm install

# 2. Set up environment
cp .env.example .env
# Edit .env — minimum required: DATABASE_URL + OPENROUTER_API_KEY + JWT_SECRET

# 3. Start MySQL (or use Docker)
docker-compose up -d db

# 4. Push database schema
pnpm db:push   # runs drizzle-kit generate + migrate

# 5. Start dev server
pnpm dev       # http://localhost:3000
```

See `.env.example` for all environment variables with explanations.

---

## ❓ Frequently Asked Questions

### Is this using Supabase?
**No.** The app uses **MySQL 8.0** with **Drizzle ORM** and the `mysql2` Node.js driver. There is no Supabase dependency anywhere in the codebase.

If you want to migrate to Supabase (PostgreSQL):
1. Replace `mysql2` with `postgres` or `@supabase/supabase-js`
2. Update `drizzle/schema.ts` — swap `mysqlTable`, `mysqlEnum`, etc. for their `pgTable` equivalents
3. Update `drizzle.config.ts` — change `dialect: "mysql"` to `dialect: "postgresql"`
4. Replace `DATABASE_URL` format: `postgresql://user:pass@host:5432/db`
5. Re-generate migrations: `pnpm db:push`

Migration effort: ~2–4 hours. The ORM (Drizzle) supports both dialects, so it's a mechanical change.

### Is this using DigitalOcean?
**Not yet — but it's configured for it.** DigitalOcean is the recommended production host.

- `docker-compose.yml` — runs the full stack locally with Docker
- `.github/workflows/deploy.yml` — CI/CD pipeline that deploys to DigitalOcean App Platform on push to `main`
- `deploy/digitalocean-app.yaml` — App Platform spec (create this with `doctl apps create --spec deploy/digitalocean-app.yaml`)

To activate DO deployment, add one secret to your GitHub repo:
```
Settings → Secrets → Actions → New secret
Name: DIGITALOCEAN_ACCESS_TOKEN
Value: [your DO personal access token with app read/write scope]
```

### Can this be deployed on GitHub Pages?
**No.** GitHub Pages only serves static HTML/CSS/JS files. InTheWild has:
- An Express.js Node.js server (requires a server runtime)
- A MySQL database (requires persistent storage)
- Runtime secrets (API keys, JWT secrets)

GitHub Pages cannot run servers. Deploy instead on:
| Platform | Cost | Notes |
|---|---|---|
| DigitalOcean App Platform | ~$12/mo | ✅ Recommended. Docker-native, managed DB available |
| Railway | Free tier then ~$5/mo | Good for prototyping |
| Render | Free tier (sleeps) + $7/mo | Simple, Docker-native |
| Fly.io | Free tier then usage-based | Global edge, excellent Docker support |
| Self-hosted VPS (DO Droplet) | $6–12/mo | Most control, requires sysadmin work |

### What API keys are required?
**Minimum to run:**
- `DATABASE_URL` — MySQL connection string
- `OPENROUTER_API_KEY` — Free at https://openrouter.ai (enables LLM generation)
- `JWT_SECRET` — Any random 32-char string

**For billing (optional):**
- `STRIPE_*` keys — Test mode works without a real Stripe account

---

## Current State

### ✅ Working
- Landing page with sign-in flow
- Generate page — prompt input, token usage display
- My Projects page — list of all user projects
- Project Detail page — code tabs (Frontend, Backend, Database, Mobile App)
- Billing page — plan display and checkout initiation
- tRPC API — generation, billing, project CRUD
- Database layer — all queries implemented in `server/db.ts`
- Docker deployment — `Dockerfile` + `docker-compose.yml`
- CI/CD — GitHub Actions workflow (`.github/workflows/deploy.yml`)
- Favicon + branding — `Logo` component, `client/public/favicon.svg`
- MCP microservice layer — `server/services/mcpClient.ts`

### 🟡 Stubs / Needs Real Implementation
- **Stripe checkout** — `billing.createCheckout` returns a stub URL; wire to real Stripe SDK
- **Deployment** — `generation.deploy` returns a stub URL; wire to S3/Docker/hosting
- **LLM generation** — works if `OPENROUTER_API_KEY` is set, but parallel model selection needs tuning
- **OAuth** — uses Manus built-in OAuth; replace with standard OAuth2 if self-hosting

### ❌ Not Implemented
- Live preview panel for generated code
- GitHub repo auto-creation on deploy
- Real-time generation status (WebSocket or polling)
- Admin dashboard

---

## Architecture Diagram

```
Browser (React 19 + Wouter + tRPC client)
       │  HTTPS
       ▼
Express 4 Server (Node 22)
  ├── /api/trpc        → tRPC router (routers.ts + blueOceanRouters.ts)
  ├── /api/oauth/*     → OAuth callbacks
  └── /*               → Static React bundle (production)
       │
       ├── MySQL 8.0 (Drizzle ORM)
       │     └── Tables: users, projects, generations, tokenUsage,
       │                 templates, siteAnalytics, subscriptions
       │
       ├── OpenRouter API (LLM generation)
       │     └── Parallel: 2 models → pick best response
       │
       ├── Stripe API (billing)
       │
       └── MCP Microservices (optional, Docker Compose)
             ├── mcp-website-generator
             ├── mcp-analytics
             ├── mcp-payment
             ├── mcp-seo-accessibility
             ├── mcp-code-review
             └── mcp-ai-chat
```

---

## Key Files

| File | Purpose |
|---|---|
| `server/routers.ts` | Main tRPC API — generation, billing, auth |
| `server/blueOceanRouters.ts` | Extended features — micro-apps, SEO, marketplace |
| `server/db.ts` | All database queries |
| `drizzle/schema.ts` | Database schema (source of truth) |
| `server/services/fullStackGenerator.ts` | Core LLM generation pipeline |
| `server/services/mcpClient.ts` | HTTP client for MCP microservices |
| `client/src/components/Logo.tsx` | **Single source of truth for brand** |
| `client/src/pages/Home.tsx` | Landing page |
| `client/src/pages/Generate.tsx` | Main app page |
| `.env.example` | All required environment variables |
| `docker-compose.yml` | Full local dev stack |
| `.github/workflows/deploy.yml` | CI/CD pipeline |

---

## Next Steps (Priority Order)

1. **Wire Stripe** — implement `billing.createCheckout` with real `stripe.checkout.sessions.create`
2. **Wire deployment** — implement `generation.deploy` (S3 static hosting or Railway API)
3. **Add live preview** — show generated HTML in an iframe on the Project Detail page
4. **Real-time generation status** — polling or SSE so users see progress during generation
5. **GitHub repo creation** — use GitHub API to push generated code to a new repo on deploy
6. **Admin dashboard** — usage stats, user management, revenue overview

See `docs/ROADMAP.md` for the full product roadmap.

---

## Running Tests

```bash
pnpm test         # run all tests
pnpm test --watch # watch mode
pnpm check        # TypeScript type check
```

Current test coverage: auth logout + generation API (5 tests total).

## Known Issues

- `blueOceanRouters.ts` has 7 pre-existing TypeScript errors (wrong arg types) — not blocking but should be fixed
- `aiSEOOptimizer.ts` and `microAppEngine.ts` have missing import — `openrouterClient` not exported from `openrouter.ts`
- MCP microservice Docker images (`ghcr.io/midnghtsapphire/mcp-*`) do not exist yet — `docker-compose up` will fail on those services until images are published

---

*This document was generated by GitHub Copilot Coding Agent for handoff purposes.*
