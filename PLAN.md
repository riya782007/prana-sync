# Prana Sync — Build Plan & Tooling Blueprint

A hyperlocal, **brand-agnostic** skin / hair / gut health coach for Tier-1 urban
India. This document is the engineering + go-to-market plan that the code in
this repo implements as an MVP.

> TL;DR on your ₹2,000 budget: **you do not need to spend it on API keys.** The
> entire MVP runs on free tiers (Gemini, Groq, WAQI, Supabase, Vercel,
> Razorpay-on-transaction). Spend the ₹2,000 on a **domain name** + keep the
> rest as a usage buffer. See [Budget](#5-the-2000-budget).

---

## 1. What we are building (from the research)

The research identifies three converging, high-growth markets (premium
skincare, microbiome/gut supplements, subscription + quick commerce) and four
concrete, unsolved consumer pains. Prana Sync attacks all four:

| # | Consumer pain (from research) | Prana Sync feature | Where it lives in the code |
|---|---|---|---|
| 1 | "Hard water in my city is ruining my skin/hair" | **Hyperlocal water-TDS calibration** → routine adjustments + ₹ savings | `src/lib/water/tds-data.ts` |
| 2 | "AQI spikes wreck my skin barrier" | **AQI-adaptive routine routing** (live AQI) | `src/lib/aqi/waqi.ts` |
| 3 | "Cupboard full of serums, no idea what works/clashes" | **Brand-agnostic ingredient compatibility + objective Skin Score** | `src/lib/ingredients/`, `src/lib/llm/skin-analysis.ts` |
| 4 | "I forget to take/refill my supplements" | **Depletion tracking + 1-tap quick-commerce deep-link refills** | `src/lib/commerce/deeplink.ts` |

The strategic moat is **decoupling diagnosis from selling product**. Unlike
Cureskin / Skinkraft / Minimalist (diagnosis funnels into their own catalog),
Prana Sync stays an impartial orchestrator and earns from **SaaS subscriptions +
affiliate commission**, which builds the trust those closed-loop apps lack.

---

## 2. Architecture

```
                 ┌──────────────────────────────────────────────┐
   Browser /     │   Next.js 15 (App Router) — PWA, installable   │
   Mobile PWA ──▶│   src/app/page.tsx  +  src/app/dashboard       │
                 └───────────────┬──────────────────────────────┘
                                 │  (same-origin API routes)
        ┌────────────────────────┼─────────────────────────────────┐
        ▼                        ▼                                  ▼
 /api/routine            /api/skin/analyze                /api/ingredients/check
 /api/refill                                              (+ OCR)
        │                        │                                  │
        ▼                        ▼                                  ▼
 Domain libraries (pure TS, fully unit-testable, no keys needed):
  • water/tds-data.ts   – locality → TDS → routine + savings
  • aqi/waqi.ts         – WAQI live AQI (+ simulated fallback)
  • ingredients/        – active-family detection + clash rules
  • commerce/deeplink   – depletion math + Blinkit/Zepto/Instamart links
  • routine/builder     – composes everything into AM/PM/Wash
        │
        ▼
 LLM layer (REST, swappable):
  • llm/gemini.ts  – multimodal: skin analysis + label OCR  (PRIMARY)
  • llm/groq.ts    – fast text fallback                      (OPTIONAL)
```

**Key design choice:** every external dependency has a **keyless fallback**
(simulated AQI, heuristic skin score, manual ingredient paste). The product is
fully demoable with zero keys and zero cost; keys simply upgrade fidelity.

**Why a Next.js PWA instead of native first:** one TypeScript codebase serves
web + installable mobile (Add to Home Screen), the cheapest path to "web/mobile"
on a tight budget. When you need app-store presence later, wrap the same build
with **Capacitor** — no rewrite.

---

## 3. The exact tech stack

| Layer | Choice | Why this one | Cost (MVP) |
|---|---|---|---|
| Web/mobile app | **Next.js 15 + React 19 + TypeScript** | One codebase → web + PWA; API routes remove a separate backend | Free |
| Styling | **Tailwind CSS** | Fast, no design system overhead | Free |
| Primary LLM | **Google Gemini 2.5 Flash** | Multimodal (one model = skin analysis **and** OCR), generous free tier, no card | Free tier |
| Text fallback LLM | **Groq (Llama 3.3 70B)** | Fastest tokens/sec, free tier, OpenAI-compatible | Free tier |
| Air quality data | **WAQI / aqicn** | Free token, strong India station coverage | Free |
| Water hardness data | **Proprietary curated dataset** (this repo, 40+ localities across 5 metros) | No public API exists → this is your moat | Free |
| Quick commerce | **Deep links (Blinkit/Zepto/Instamart)** | Affiliate model; avoids enterprise API access entirely | Free |
| DB + Auth (Phase 2) | **Supabase** (Postgres) | Free tier covers Auth, DB, storage | Free tier |
| Hosting | **Vercel** | Zero-config Next.js deploys, free hobby tier | Free tier |
| Payments (Phase 3) | **Razorpay** | India-native UPI + subscriptions; pay per transaction | ~2% per txn |

### LLM recommendation rationale
- **Use Gemini for everything vision** (the Skin Score + ingredient-label OCR).
  Vision is the expensive part everywhere else — Gemini's free multimodal tier
  is what makes this product viable on ₹2,000.
- **Add Groq only if** you hit Gemini's per-minute limits or want sub-second
  text routine narration. It is genuinely optional.
- **Do NOT buy** Perfect Corp / GlamAR enterprise vision SDKs at this stage
  (they are enterprise-priced). Gemini covers the MVP; revisit only after
  revenue justifies clinical-grade 180° face mapping.

---

## 4. How to get every key (step by step)

All of these are free and take ~2 minutes each.

### A. Gemini API key (PRIMARY — do this first)
1. Go to **https://aistudio.google.com/apikey** and sign in with a Google account.
2. Click **Create API key** → copy it.
3. Put it in `.env.local` as `GEMINI_API_KEY=...`
4. Free tier (verify current limits on the page): roughly 10 req/min and a few
   hundred req/day on Flash; `gemini-2.5-flash-lite` gives the highest daily
   request count. No credit card needed to start.

### B. WAQI air-quality token (FREE)
1. Go to **https://aqicn.org/data-platform/token/**
2. Enter your email → confirm → copy the token.
3. Put it in `.env.local` as `WAQI_TOKEN=...`

### C. Groq key (OPTIONAL)
1. Go to **https://console.groq.com/keys** → sign in → **Create API Key**.
2. Put it in `.env.local` as `GROQ_API_KEY=...`

### D. Supabase (Phase 2 — when you add user accounts)
1. Create a project at **https://supabase.com** (free tier).
2. Project → **Settings → API**: copy the URL + anon key + service role key.

### E. Razorpay (Phase 3 — when you charge money)
1. Sign up at **https://dashboard.razorpay.com**, complete KYC.
2. **Settings → API Keys → Generate** (start in Test mode).
3. No setup fee; you pay a per-transaction percentage only when you earn.

---

## 5. The ₹2,000 budget

| Item | Cost | Notes |
|---|---|---|
| Gemini API | ₹0 | Free tier covers MVP |
| Groq API | ₹0 | Free tier |
| WAQI token | ₹0 | Free |
| Supabase | ₹0 | Free tier |
| Vercel hosting | ₹0 | Free hobby tier |
| Razorpay | ₹0 upfront | Per-transaction only |
| **Domain name** (e.g. pranasync.in / .app) | **₹800–₹1,200/yr** | The one thing worth buying |
| **LLM usage buffer** | **₹500–₹800** | Top up Gemini/Groq *only if* you exceed free limits during a launch spike |
| **Total** | **≤ ₹2,000** | Comfortably within budget |

**Recommendation:** buy the domain now; keep ~₹800 as a prepaid buffer you load
into Gemini only if free-tier limits bite during a traffic spike. You will most
likely never need it pre-revenue.

---

## 6. Monetization (numbers from the research)

- **Soft paywall**: free first skin scan + free water/AQI report. Show the
  subscription prompt **after** the first "aha" (ingredient compatibility report
  / first environmental routine) — the research notes this placement lifts
  conversion ~35%.
- **Pricing (PPP-localized for India):**
  - Pro Monthly: **₹99/mo**
  - Pro Annual (lead offer): **₹699/yr** (~₹58/mo)
- **Affiliate revenue:** commission on quick-commerce reorders (no inventory,
  no fulfilment, no payment processing on our side).
- Annual plans align with the 4–8 week skin-renewal cycle and the 24-month
  retention milestone; avoid discount-heavy acquisition (those cohorts churn).

---

## 7. Roadmap

**Phase 0 — MVP scaffold (this repo) ✅**
Environment calibration, Skin Score, ingredient checker, refill deep-links — all
working with keyless fallbacks.

**Phase 1 — Go live (free)**
Add Gemini + WAQI keys; deploy to Vercel; buy domain; ship PWA.

**Phase 2 — Accounts & history (free tier) ✅ implemented**
Supabase Auth (email magic-link) + Postgres with Row-Level Security: users sign
in, every Skin Score is saved and charted over time, and inventory persists for
refill tracking. Gracefully degrades to demo mode when Supabase env vars are
absent.

> Required env var NAMES (must match exactly; the two browser vars MUST keep the
> `NEXT_PUBLIC_` prefix or the client cannot read them):
> `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
> (the Supabase "anon"/"publishable" key value goes here).
> After adding/renaming env vars in Vercel, trigger a **redeploy**.

Still to do: crowd-source water-TDS data per pincode to widen the moat.

**Phase 3 — Monetize**
Razorpay subscriptions (₹99/₹699), soft paywall after the aha moment, affiliate
deals with quick-commerce platforms, refill push notifications.

**Phase 4 — Depth**
Water dataset now covers **Bangalore, Delhi NCR, Mumbai, Hyderabad and Pune**
(40+ localities). Next: crowd-source exact TDS per society/pincode (users submit
TDS-meter readings), add a gut-skin protocol, and optionally ship a native shell
via Capacitor for the app stores.

### Water dataset sources & accuracy
Bangalore values are from field research. Delhi NCR / Mumbai / Hyderabad / Pune
values are informed **estimates** from public groundwater & municipal studies
and reporting (e.g. Dwarka groundwater avg ~1042 mg/L TDS; Noida society samples
1,000–3,500+ ppm; Mumbai lake-fed supply is soft, typically <150 ppm). Treat
non-Bangalore numbers as seed estimates and calibrate with a ₹300–₹500 TDS meter
or your local water board's report. The app falls back to a **city-typical
estimate** when a specific locality is not yet mapped.

---

## 8. Run it locally

```bash
npm install
cp .env.example .env.local   # optional — leave blank to run on simulated data
npm run dev                  # http://localhost:3000  → open /dashboard
```

No keys? Everything still works on simulated data so you can demo immediately.

---

_Prana Sync is preventive wellness tooling, not a medical device. It does not
provide diagnosis or treatment._
