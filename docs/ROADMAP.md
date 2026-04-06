# InTheWild — Product Roadmap

> **Owner:** Audrey Evans · MIDNGHTSAPPHIRE  
> **Updated:** 2026-03-20

---

## Status Legend

| Symbol | Meaning |
|---|---|
| ✅ Done | Shipped and working |
| 🔨 In Progress | Actively being built |
| 📋 Backlog | Planned, not started |
| 💡 Idea | Under consideration |
| ❌ Won't Do | Explicitly out of scope |

---

## Now (Current Sprint — V1.0)

These are blocking items for a production-ready V1 launch.

---

### 🔨 CARD-001 — Wire Stripe Checkout

**Priority:** P0 — Blocking revenue  
**Effort:** Medium (4–6 hours)  
**Assignee:** Engineering

**Description:**  
`billing.createCheckout` currently returns a stub URL. Wire it to the real Stripe SDK so users can actually upgrade from Free to Pro or Business.

**Acceptance Criteria:**
- [ ] `billing.createCheckout` calls `stripe.checkout.sessions.create`
- [ ] Stripe webhook handler updates `users.plan` + `subscriptions` table on `checkout.session.completed`
- [ ] Webhook also handles `customer.subscription.deleted` (cancellation)
- [ ] Test mode works end-to-end with Stripe test cards
- [ ] Live mode activates when `STRIPE_MODE=live`

**Files:**
- `server/routers.ts` — `billing.createCheckout`
- New: `server/_core/stripe.ts` — Stripe client init
- New: `server/webhooks/stripe.ts` — webhook handler

---

### 🔨 CARD-002 — Wire Real Deployment

**Priority:** P0 — Core product promise  
**Effort:** Large (8–12 hours)  
**Assignee:** Engineering

**Description:**  
`generation.deploy` currently returns a stub URL. Users should be able to click Deploy and get a real live URL where their generated app is running.

**Options (choose one):**
- **Option A:** Host static HTML on DigitalOcean Spaces (S3-compatible) + CDN — simplest for HTML-only apps
- **Option B:** Spin up a Railway app via their API — works for apps with backends
- **Option C:** Use the `mcp-website-generator` MCP microservice for managed hosting

**Acceptance Criteria:**
- [ ] `generation.deploy` returns a real working URL
- [ ] `projects.status` updates to `"deployed"` and `projects.deployUrl` is set
- [ ] User sees "View Live" button on Project Detail page
- [ ] Deploy is idempotent (re-deploying same project updates the existing URL)

---

### 📋 CARD-003 — Live Preview Panel

**Priority:** P1 — Major UX improvement  
**Effort:** Small (2–3 hours)  
**Assignee:** Frontend

**Description:**  
Show the generated HTML in an `<iframe>` on the Project Detail page so users can see what they built immediately, without deploying first.

**Acceptance Criteria:**
- [ ] "Preview" tab on Project Detail page renders `generatedHtml` in a sandboxed iframe
- [ ] Iframe is responsive (mobile/tablet/desktop toggle)
- [ ] Preview is clearly labeled "sandboxed preview — may not reflect final deployed app"

---

### 📋 CARD-004 — Real-Time Generation Progress

**Priority:** P1 — UX  
**Effort:** Medium (4–6 hours)  
**Assignee:** Engineering + Frontend

**Description:**  
Currently the Generate page shows a spinner until generation completes. Users have no feedback about what's happening during 30–90 second wait.

**Acceptance Criteria:**
- [ ] Generation shows step-by-step progress: "Generating frontend... Generating backend... Generating database..."
- [ ] Either SSE (Server-Sent Events) or polling every 2s
- [ ] Progress visible on the Generate page and My Projects

---

## Next (V1.1)

---

### 📋 CARD-005 — GitHub Repo Auto-Creation

**Priority:** P1 — Key differentiator  
**Effort:** Medium (4–6 hours)

**Description:**  
On deploy, automatically create a GitHub repository under the user's account and push the generated code. Users get a real GitHub repo with all code, ready to clone.

**Acceptance Criteria:**
- [ ] User connects GitHub account via OAuth
- [ ] On deploy, `POST https://api.github.com/user/repos` creates repo
- [ ] All generated files are pushed as initial commit
- [ ] Repo URL is shown on Project Detail page

---

### 📋 CARD-006 — Prompt Templates Gallery

**Priority:** P2  
**Effort:** Small (3–4 hours)

**Description:**  
Show 8–12 example prompts on the Generate page as "starter templates". New users often don't know what to type. Clicking a template fills the prompt textarea.

**Examples:**
- "A recipe sharing app with user profiles and ratings"
- "A SaaS project management tool with Kanban boards"
- "An e-commerce store with Stripe checkout and inventory"
- "A blog with markdown editor and email newsletter"

---

### 📋 CARD-007 — Admin Dashboard

**Priority:** P2  
**Effort:** Medium (6–8 hours)

**Description:**  
Owners with `role = "admin"` should have an `/admin` route showing:
- Total users, new users this week
- Total projects generated
- Revenue this month (from Stripe)
- Recent generations with status

---

### 📋 CARD-008 — Email Notifications

**Priority:** P2  
**Effort:** Small (3–4 hours)

**Description:**  
Send emails on key events:
- Generation complete (with link to project)
- Token usage at 80% and 100%
- Payment successful / failed

Integration: SendGrid or Resend (both have free tiers).

---

## Future (V2.0)

---

### 💡 CARD-009 — Supabase Backend Option

**Priority:** Idea  
**Description:**  
Allow users to choose Supabase (PostgreSQL + Auth + Storage + Realtime) as their backend instead of the default Express + MySQL. Would make the app accessible to users already on the Supabase ecosystem.

**What's needed:**
- Schema migration: MySQL → PostgreSQL dialect in Drizzle
- Alternative auth path using Supabase Auth instead of custom JWT
- Generated apps would output Supabase-flavoured backend code

---

### 💡 CARD-010 — Voice-to-App

**Priority:** Idea  
**Description:**  
The `server/services/voiceToWebsite.ts` service already exists. Wire the frontend so users can speak their app idea instead of typing it. Uses Whisper via OpenRouter for transcription.

---

### 💡 CARD-011 — A/B Testing for Generated Sites

**Priority:** Idea  
**Description:**  
The `server/services/abTestingEngine.ts` service already exists. Expose it as a feature: users can deploy two variants of their generated app and see which one performs better via analytics.

---

### 💡 CARD-012 — Template Marketplace

**Priority:** Idea  
**Description:**  
The `blueOceanRouters.ts` + `templateMarketplace.ts` service already has the full implementation. Wire it up to a `/marketplace` page where users can browse, purchase (Stripe), and fork templates created by other users.

---

### 💡 CARD-013 — Mobile App Store Submission Helper

**Priority:** Idea  
**Description:**  
After generating a React Native mobile app, guide users through:
- Signing the Android APK (keystore generation)
- Building for iOS via EAS Build (Expo cloud)
- Submitting to Google Play Console and Apple App Store

---

## Out of Scope

### ❌ GitHub Pages Deployment
InTheWild generates server-side apps (Node.js + MySQL). GitHub Pages only hosts static files. **This will never work** — use DigitalOcean, Railway, or Render instead.

### ❌ Replacing MySQL with a file-based DB (SQLite)
The production architecture is built around MySQL 8.0. Switching to SQLite would require rewriting the ORM layer and Docker config, and SQLite doesn't support concurrent production traffic.

---

## Version History

| Version | Date | Highlights |
|---|---|---|
| V0.9 | 2026-03-01 | Initial platform: generate + projects CRUD |
| V1.0-beta | 2026-03-20 | Branding Logo component, Billing page, Mobile App tab, CI/CD, favicon, .env.example, all documentation |
| V1.0 | TBD | Stripe + deployment wired (CARD-001, CARD-002) |
| V1.1 | TBD | GitHub repo creation, prompt templates, admin dashboard |
| V2.0 | TBD | Supabase option, voice-to-app, template marketplace |
