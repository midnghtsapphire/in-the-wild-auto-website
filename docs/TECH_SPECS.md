# InTheWild — Technical Specifications

> **Owner:** Audrey Evans · MIDNGHTSAPPHIRE  
> **Last updated:** 2026-03-20

---

## 1. Technology Stack

### Frontend
| Component | Technology | Version |
|---|---|---|
| Framework | React | 19 |
| Language | TypeScript | 5.9 |
| Routing | Wouter | 3.x |
| Styling | Tailwind CSS | 4 |
| Components | shadcn/ui (Radix UI) | latest |
| State / Data | tRPC + TanStack React Query | 11.x / 5.x |
| Build tool | Vite | 7 |
| Package manager | pnpm | 10 |

### Backend
| Component | Technology | Version |
|---|---|---|
| Runtime | Node.js | 22 |
| Framework | Express | 4 |
| API layer | tRPC | 11 |
| Language | TypeScript | 5.9 |
| ORM | Drizzle ORM | 0.44 |
| DB driver | mysql2 | 3.x |
| Validation | Zod | 4 |
| Auth | JWT (jose) + custom OAuth | 6.x |

### Database
| Component | Technology |
|---|---|
| Engine | MySQL 8.0 |
| Migration tool | drizzle-kit |
| Schema location | `drizzle/schema.ts` |

### Infrastructure
| Component | Technology |
|---|---|
| Containerisation | Docker (multi-stage build) |
| Orchestration | Docker Compose |
| CI/CD | GitHub Actions |
| Recommended host | DigitalOcean App Platform |
| Container registry | GitHub Container Registry (ghcr.io) |

### External APIs
| Service | Purpose | Required? |
|---|---|---|
| OpenRouter | LLM generation (app code) | ✅ Yes |
| Stripe | Subscription billing | Optional (needed for paid plans) |
| AWS S3 | File/asset storage | Optional |

---

## 2. Database Schema — Data Dictionary

### Table: `users`
Stores all registered users. Created on first sign-in via OAuth.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | — | Primary key |
| `openId` | VARCHAR(64) UNIQUE | No | — | OAuth subject identifier (immutable) |
| `name` | TEXT | Yes | NULL | Display name |
| `email` | VARCHAR(320) | Yes | NULL | Email address |
| `loginMethod` | VARCHAR(64) | Yes | NULL | e.g. `"google"`, `"email"` |
| `role` | ENUM | No | `"user"` | `"user"` or `"admin"` |
| `plan` | ENUM | No | `"free"` | `"free"`, `"pro"`, `"business"` |
| `stripeCustomerId` | VARCHAR(128) | Yes | NULL | Stripe customer ID |
| `stripeSubscriptionId` | VARCHAR(128) | Yes | NULL | Active Stripe subscription ID |
| `tokensUsed` | INT | No | 0 | Cumulative tokens consumed this billing period |
| `tokensQuota` | INT | No | 50000 | Monthly token ceiling (auto-updated on plan change) |
| `createdAt` | TIMESTAMP | No | NOW() | Account creation time |
| `updatedAt` | TIMESTAMP | No | NOW() | Last modification (auto-updated) |
| `lastSignedIn` | TIMESTAMP | No | NOW() | Last successful sign-in |

---

### Table: `projects`
One row per generated app. Stores the generated code and deployment state.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | — | Primary key |
| `userId` | INT | No | — | FK → `users.id` |
| `name` | VARCHAR(255) | No | — | Human-readable project name |
| `description` | TEXT | Yes | NULL | Auto-extracted description |
| `prompt` | TEXT | No | — | Original user prompt |
| `status` | ENUM | No | `"generating"` | `generating`, `verifying`, `ready`, `deployed`, `failed` |
| `generatedHtml` | TEXT | Yes | NULL | Frontend HTML (full page) |
| `generatedCss` | TEXT | Yes | NULL | CSS or additional styles |
| `generatedJs` | TEXT | Yes | NULL | JavaScript / backend code |
| `framework` | VARCHAR(64) | Yes | `"html"` | Target framework (e.g. `"react"`, `"html"`) |
| `deployUrl` | VARCHAR(512) | Yes | NULL | Live deployment URL |
| `deploySlug` | VARCHAR(128) | Yes | NULL | Subdomain slug (e.g. `my-todo-app`) |
| `customDomain` | VARCHAR(255) | Yes | NULL | User-provided custom domain |
| `verificationScore` | INT | Yes | NULL | Code quality score 0–100 |
| `verificationNotes` | TEXT | Yes | NULL | Human-readable verification notes |
| `totalTokens` | INT | Yes | 0 | Total tokens consumed for this project |
| `createdAt` | TIMESTAMP | No | NOW() | — |
| `updatedAt` | TIMESTAMP | No | NOW() | — |

**Project status lifecycle:**
```
generating → verifying → ready → deployed
                              ↘ failed
```

---

### Table: `generations`
Individual LLM calls made for a project. Multiple rows per project when parallel models are used.

| Column | Type | Nullable | Default | Description |
|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | — | Primary key |
| `projectId` | INT | No | — | FK → `projects.id` |
| `userId` | INT | No | — | FK → `users.id` |
| `model` | VARCHAR(128) | No | — | LLM model identifier (e.g. `"openai/gpt-4o"`) |
| `prompt` | TEXT | No | — | Full system + user prompt sent |
| `response` | TEXT | Yes | NULL | Raw LLM response |
| `tokensInput` | INT | Yes | 0 | Input tokens consumed |
| `tokensOutput` | INT | Yes | 0 | Output tokens produced |
| `totalTokens` | INT | Yes | 0 | `tokensInput + tokensOutput` |
| `latencyMs` | INT | Yes | NULL | Response time in milliseconds |
| `status` | ENUM | No | `"pending"` | `pending`, `completed`, `failed` |
| `error` | TEXT | Yes | NULL | Error message if status=`failed` |
| `chosenAsWinner` | INT | Yes | 0 | 1 if this model's output was used |
| `createdAt` | TIMESTAMP | No | NOW() | — |

---

### Table: `tokenUsage`
Detailed per-action token tracking for billing periods.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | Primary key |
| `userId` | INT | No | FK → `users.id` |
| `tokensUsed` | INT | No | Tokens consumed in this record |
| `model` | VARCHAR(128) | Yes | Model used |
| `action` | VARCHAR(64) | Yes | Action type (e.g. `"generate"`, `"mobile"`) |
| `periodStart` | TIMESTAMP | No | Billing period start |
| `periodEnd` | TIMESTAMP | No | Billing period end |
| `createdAt` | TIMESTAMP | No | — |

---

### Table: `templates`
Community-published and user-created templates in the template marketplace.

| Column | Type | Nullable | Description |
|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | Primary key |
| `userId` | INT | No | FK → `users.id` (creator) |
| `name` | VARCHAR(255) | No | Template name |
| `description` | TEXT | Yes | — |
| `category` | VARCHAR(64) | Yes | `general`, `saas`, `ecommerce`, `blog`, etc. |
| `tags` | TEXT | Yes | Comma-separated tags |
| `prompt` | TEXT | Yes | Seed prompt |
| `generatedHtml` | TEXT | Yes | Pre-generated HTML |
| `generatedCss` | TEXT | Yes | Pre-generated CSS |
| `generatedJs` | TEXT | Yes | Pre-generated JS |
| `thumbnailUrl` | VARCHAR(512) | Yes | Preview image URL |
| `price` | DECIMAL(10,2) | Yes | 0.00 = free |
| `isFree` | INT | Yes | 1 = free, 0 = paid |
| `downloads` | INT | Yes | Download count |
| `rating` | DECIMAL(3,2) | Yes | 0.00–5.00 |
| `isPublished` | INT | Yes | 1 = visible in marketplace |
| `createdAt` | TIMESTAMP | No | — |
| `updatedAt` | TIMESTAMP | No | — |

---

### Table: `siteAnalytics`
Daily analytics snapshots for deployed projects.

| Column | Type | Description |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primary key |
| `projectId` | INT | FK → `projects.id` |
| `date` | TIMESTAMP | The day this snapshot covers |
| `pageViews` | INT | Total page view count |
| `uniqueVisitors` | INT | Unique visitor count |
| `avgSessionDuration` | INT | Seconds |
| `bounceRate` | DECIMAL(5,2) | 0.00–100.00 |
| `topPages` | TEXT | JSON array of `{path, views}` |
| `referrers` | TEXT | JSON array of `{domain, visits}` |
| `createdAt` | TIMESTAMP | — |

---

### Table: `subscriptions`
Stripe subscription records per user.

| Column | Type | Description |
|---|---|---|
| `id` | INT AUTO_INCREMENT | Primary key |
| `userId` | INT | FK → `users.id` |
| `plan` | ENUM | `free`, `pro`, `business` |
| `stripeSubscriptionId` | VARCHAR(128) | Stripe subscription ID |
| `stripeCustomerId` | VARCHAR(128) | Stripe customer ID |
| `status` | ENUM | `active`, `canceled`, `past_due`, `trialing` |
| `currentPeriodStart` | TIMESTAMP | Billing period start |
| `currentPeriodEnd` | TIMESTAMP | Billing period end |
| `cancelAtPeriodEnd` | INT | 1 = cancel when period ends |
| `createdAt` | TIMESTAMP | — |
| `updatedAt` | TIMESTAMP | — |

---

## 3. API Reference (tRPC)

All API calls go through `POST /api/trpc/<procedure>`.

### Auth
| Procedure | Type | Description |
|---|---|---|
| `auth.me` | Query | Returns current user or null |
| `auth.logout` | Mutation | Clears session cookie |

### Generation
| Procedure | Type | Input | Description |
|---|---|---|---|
| `generation.generate` | Mutation | `{ prompt: string, projectName?: string }` | Generate full-stack app |
| `generation.getProject` | Query | `{ projectId: number }` | Get single project |
| `generation.listProjects` | Query | — | List current user's projects |
| `generation.deploy` | Mutation | `{ projectId: number }` | Deploy project |
| `generation.generateMobileApp` | Mutation | `{ projectId, appName, packageName }` | Convert to React Native |

### Billing
| Procedure | Type | Input | Description |
|---|---|---|---|
| `billing.getUsage` | Query | — | Current token usage + tier |
| `billing.getPlans` | Query | — | All subscription plans |
| `billing.createCheckout` | Mutation | `{ planId: string }` | Start Stripe checkout |

---

## 4. Environment Variables

See `.env.example` for the full list. Critical variables:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | MySQL connection string |
| `OPENROUTER_API_KEY` | ✅ | LLM provider key |
| `JWT_SECRET` | ✅ | Session signing key (min 32 chars) |
| `STRIPE_MODE` | — | `test` or `live` |
| `STRIPE_TEST_SECRET_KEY` | — | Stripe test secret |
| `STRIPE_LIVE_SECRET_KEY` | — | Stripe live secret |

---

## 5. Build & Deploy

```bash
# Development
pnpm dev           # starts Express + Vite HMR on :3000

# Production build
pnpm build         # builds client to dist/public, bundles server to dist/index.js

# Production start
pnpm start         # runs dist/index.js

# Database
pnpm db:push       # generate migrations + apply them

# Tests
pnpm test
pnpm check         # TypeScript type check
```

### Docker

```bash
docker build -t inthewild .
docker run -p 3000:3000 \
  -e DATABASE_URL=mysql://... \
  -e OPENROUTER_API_KEY=... \
  -e JWT_SECRET=... \
  inthewild
```

### Full stack (Docker Compose)

```bash
docker-compose up -d        # start all services
docker-compose logs -f app  # follow app logs
docker-compose down         # stop
```
