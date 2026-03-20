# InTheWild — Branding Guide

> **Owner:** Audrey Evans · MIDNGHTSAPPHIRE  
> **Last updated:** 2026-03-20

---

## 1. Current Brand — What's Already In the App

The branding **is** live and consistent. Here's the full inventory:

| Element | Current value | Location |
|---|---|---|
| **Product name** | InTheWild | `client/src/components/Logo.tsx` → `APP_NAME` |
| **Logo icon** | Lucide `<Zap>` (lightning bolt) | `client/src/components/Logo.tsx` → icon |
| **Icon gradient** | `from-purple-500 to-green-500` | `client/src/components/Logo.tsx` → `ICON_GRADIENT` |
| **Text gradient** | `from-purple-400 to-green-400` | `client/src/components/Logo.tsx` → `TEXT_GRADIENT` |
| **Page background** | `from-purple-950 via-slate-900 to-green-950` | All pages, dark cinematic |
| **Primary tagline** | "Full-Stack From Soup To Nuts" | `Home.tsx` hero |
| **Secondary tagline** | "The Lovable Killer" | `Home.tsx` badge |
| **Favicon** | SVG lightning bolt on purple-green gradient bg | `client/public/favicon.svg` |
| **Browser tab title** | "InTheWild — Full-Stack AI App Generator" | `client/index.html` |

> **To rebrand the entire app** — name, icon, and colours — edit **one file only:**  
> `client/src/components/Logo.tsx` (lines `ICON_GRADIENT`, `TEXT_GRADIENT`, `APP_NAME`)

---

## 2. Is the Branding Generic or Audience-Specific?

**Currently:** generic-developer tone. "InTheWild" and "Soup to Nuts" will land with technical builders but may confuse non-technical users.

**This matters because InTheWild has two distinct audience segments:**

### Segment A — Technical Builders (Indie Developers / Solo Founders)
- Want speed and completeness: "give me a real app, not a Figma mockup"
- Respond to: raw power language, anti-establishment framing ("Lovable Killer"), dark theme
- Current brand fits this audience **well**

### Segment B — Non-Technical Entrepreneurs / Creators
- Want results without code knowledge: "I have an idea, build it"
- Respond to: approachable, empowering language, clear value proposition
- Current brand partially fits — "Soup to Nuts" may land as confusing jargon

---

## 3. Naming Options (by audience + genre)

The name `InTheWild` is strong — it implies production-ready, real-world deployment ("software out in the wild"). It also connects naturally to the **Revvel** music ecosystem (underground, unfiltered, raw). Consider keeping it.

If you ever want to pivot the brand per audience, here are options:

### For Developers (technical audience)
| Name | Vibe | Notes |
|---|---|---|
| **InTheWild** ✅ | Raw, production, real | Current — keep if staying developer-focused |
| **StackForge** | Power tool, craft | Implies building full stacks from scratch |
| **WildStack** | Hybrid — both audiences | Keeps "Wild" brand equity |
| **FullForge** | Complete, powerful | Communicates full-stack clearly |
| **AppForge** | Broad, accessible | Could work for non-technical users too |

### For Non-Technical Creators (broader audience)
| Name | Vibe | Notes |
|---|---|---|
| **BuildWild** | Creative, empowering | Action verb + brand equity |
| **Summon** | Magical, effortless | "Summon your app into existence" |
| **Scaffold** | Clear, useful | Very developer though |
| **Conjure** | Creative, fast | Appeals to non-technical creators |

### Connecting to Revvel Music Ecosystem
| Name | Vibe | Notes |
|---|---|---|
| **InTheWild** ✅ | Underground, real, unfiltered | Already fits Revvel's "no gatekeepers" ethos |
| **FullTrack** | Music + full-stack | Double meaning: full audio track + full tech stack |
| **MixStack** | Music production + tech | Could be confusing |

**Recommendation:** Keep `InTheWild`. It's distinctive, short, memorable, and fits both the developer audience and the Revvel brand identity. The risk is zero — no other major AI tool uses it.

---

## 4. Logo / Icon Upgrade Path

The current icon is Lucide's generic `<Zap>`. It's used by Vercel, dozens of SaaS apps, and countless other projects. Consider upgrading to a custom SVG when budget allows.

### Logo concept ideas (matching "InTheWild" brand)
- **Lightning bolt in a rounded square** (current) — keep for now, very readable at small sizes
- **Stylized "W" with a spark** — initials W for "Wild", with an energy motif
- **A fragment of circuit board shaped like a lightning bolt** — tech-forward, custom
- **Abstract animal silhouette** — a wolf or fox mid-stride (plays on "in the wild"), very distinctive but off-brand for a dev tool

### Recommended colour tokens to keep
```
Primary gradient: purple-500 (#a855f7) → green-500 (#22c55e)
Background:       purple-950 (#2e1065) via slate-900 (#0f172a) → green-950 (#052e16)
Accent light:     purple-400 / green-400
```

This palette is distinctive — it doesn't copy Vercel (black/white), Lovable (peach/pink), Cursor (dark grey), or Supabase (dark green). It's yours.

---

## 5. Tagline Options

| Tagline | Audience | Tone |
|---|---|---|
| "Full-Stack From Soup To Nuts" ✅ | Developers | Confident, comprehensive |
| "The Lovable Killer" ✅ | Developers | Aggressive positioning, memorable |
| "Your idea. A real app. In minutes." | Both | Clear, non-technical |
| "Generate apps, not excuses." | Developers | Cheeky, action-oriented |
| "From prompt to production." | Both | Clean, clear |
| "Built wild. Shipped fast." | Both | Energetic, brand-consistent |

**Recommendation:** Keep both current taglines for the dev-facing landing page. Add "Your idea. A real app. In minutes." as a secondary sub-headline if you want to reach non-technical users without changing the primary positioning.

---

## 6. How to Change the Name or Colours

Everything is centralized in **one file:**

```
client/src/components/Logo.tsx
```

Edit these three lines:
```typescript
const ICON_GRADIENT = "from-purple-500 to-green-500";  // icon square background
const TEXT_GRADIENT = "from-purple-400 to-green-400";  // wordmark gradient
const APP_NAME = "InTheWild";                           // the name shown everywhere
```

Page backgrounds and button gradients still use inline Tailwind classes across the pages. A future clean-up could extract those to CSS variables in `client/src/index.css`.
