# LeadHunter AI 🚀
> **"Find businesses that need a website."**

A production-ready credit-based SaaS lead generation platform. Unlocks verified local business leads whose official website was not found in available business registries. Features server-side cryptographic payment verification with Razorpay, Gemini AI natural language query parsing, Google Places API (New) intelligence, and an immutable credit ledger.

---

## Table of Contents
1. [Core Features](#core-features)
2. [Product & Credit Model](#product--credit-model)
3. [Architecture Overview](#architecture-overview)
4. [Environment Variables](#environment-variables)
5. [Google Cloud & Places API Setup](#google-cloud--places-api-setup)
6. [Razorpay Setup & Webhooks](#razorpay-setup--webhooks)
7. [Supabase Setup & Database Schema](#supabase-setup--database-schema)
8. [Gemini AI Configuration](#gemini-ai-configuration)
9. [Local Development](#local-development)
10. [Vercel & GitHub Deployment](#vercel--github-deployment)
11. [Production Testing Checklist](#production-testing-checklist)

---

## Core Features

- **Credit-Based Marketplace:** Users pay first (e.g. ₹99 = 5 lead credits). Each verified payment unlocks exactly 5 leads. Negative credits are strictly prohibited.
- **Server-Side Razorpay Verification:** Cryptographic HMAC SHA-256 signature verification prevents client-side tampering or fake status spoofing. Idempotency guards prevent double crediting.
- **Natural Language AI Commands:** Powered by Gemini (`gemini-3.8-flash`) via the modern `@google/genai` TypeScript SDK. Parse natural English, Hindi, or Hinglish commands into structured multi-query parameters.
- **Google Places API (New):** Utilizes server-side Text Search with cost-efficient field masks (`places.id,displayName,formattedAddress,location,nationalPhoneNumber,websiteUri`). Never exposes Google server keys to the browser.
- **Website Availability & Verification Engine:** Safe server-side HTTP availability checks classify candidates as `NO_WEBSITE_FOUND`, `WEBSITE_FOUND`, `WEBSITE_UNAVAILABLE`, or `WEBSITE_UNKNOWN`.
- **Zero-Waste Delivery Guarantee:** If fewer than 5 qualified leads exist in a target search, 0 credits are deducted.
- **Lead Ownership & Anti-Resale:** Delivered leads are permanently locked to the buyer to prevent the same lead from being delivered twice to the same user.

---

## Product & Credit Model

| Pack Name | Leads | Price | Currency | Credit Rule |
| :--- | :--- | :--- | :--- | :--- |
| **5 Verified Website Leads** | 5 | ₹99 | INR | +5 Credits per verified payment |

- **Default Search Consumption:** Exactly 5 credits per batch.
- **Partial Fulfillment Rule:** If only 3 qualified leads are found, 0 credits are consumed.
- **Ledger Transaction Types:** `PURCHASE`, `LEAD_DELIVERY`, `REFUND`, `ADMIN_ADJUSTMENT`.

---

## Architecture Overview

```
├── server.ts                       # Express server + Vite middlewares + API Route Handlers
├── server/
│   ├── db.ts                       # Server-authoritative data store & transaction ledger
│   ├── places.ts                   # Google Places API (New) & HTTP website verification
│   ├── gemini.ts                   # Gemini 3.8 Flash natural-language command parser
│   └── razorpay.ts                 # Razorpay Orders API, HMAC SHA-256 verification
├── src/
│   ├── components/
│   │   ├── Navbar.tsx              # Responsive header, live credit pill, role switcher
│   │   ├── Hero.tsx                # High-converting SaaS landing hero & pricing cards
│   │   ├── Dashboard.tsx           # User dashboard: metrics, quick actions, profile
│   │   ├── FindLeads.tsx           # AI search command, structured form, 6-step progress
│   │   ├── MyLeads.tsx             # Unlocked leads directory, CSV/JSON export, copy action
│   │   ├── PaymentsView.tsx        # Razorpay checkout, verification, transaction ledger
│   │   ├── AuthModal.tsx           # Authentication modal with 1-click test profiles
│   │   └── SetupModal.tsx          # Real-time API & environment diagnostics
│   ├── api.ts                      # Client-side API client
│   └── types.ts                    # TypeScript interface definitions
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Supabase PostgreSQL schema & indexes
```

---

## Environment Variables

Copy `.env.example` to `.env`:

```bash
# Gemini AI (Natural language parsing & category expansion)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Google Places API (New) (Business search & contact verification)
GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_PLACES_API_KEY"

# Razorpay Payment Gateway (Live or Test credentials)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="YOUR_RAZORPAY_KEY_SECRET"
RAZORPAY_WEBHOOK_SECRET="YOUR_RAZORPAY_WEBHOOK_SECRET"

# Supabase PostgreSQL Database (Optional - local JSON/file storage active if omitted)
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"

# Hosting
PORT=3000
APP_URL="http://localhost:3000"
```

---

## Google Cloud & Places API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project: `LeadHunter-AI`.
3. In **APIs & Services > Library**, enable:
   - **Places API (New)**
4. In **Credentials**, click **Create Credentials > API Key**.
5. Restrict the key:
   - **API restrictions:** Limit key to **Places API (New)**.
   - **Application restrictions:** Restrict to your server IP or HTTP referrers.
6. Set the key in your `.env` as `GOOGLE_MAPS_API_KEY`.

---

## Razorpay Setup & Webhooks

1. Sign up / Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings > API Keys** and generate **Key ID** and **Key Secret**.
3. Add them to `.env`:
   ```bash
   RAZORPAY_KEY_ID="rzp_test_..."
   RAZORPAY_KEY_SECRET="..."
   ```
4. Configure Webhooks:
   - Go to **Settings > Webhooks > Add New Webhook**.
   - **Webhook URL:** `https://your-domain.com/api/payments/webhook`
   - **Secret:** Generate a secure random string and set as `RAZORPAY_WEBHOOK_SECRET`.
   - **Active Events:**
     - `order.paid`
     - `payment.captured`
     - `payment.failed`

---

## Supabase Setup & Database Schema

1. Create a project at [Supabase](https://supabase.com/).
2. In the Supabase **SQL Editor**, run the migration file provided at:
   `/supabase/migrations/001_initial_schema.sql`
3. In **Project Settings > API**, copy the `Project URL`, `anon public key`, and `service_role secret`.
4. Add to `.env`:
   ```bash
   SUPABASE_URL="https://xxx.supabase.co"
   SUPABASE_ANON_KEY="xxx"
   SUPABASE_SERVICE_ROLE_KEY="xxx"
   ```

---

## Gemini AI Configuration

1. Generate an API Key at [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Set `GEMINI_API_KEY` in your environment.
3. The server uses `gemini-3.8-flash` via the `@google/genai` TypeScript SDK for high-speed, cost-effective structured query generation.

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start full-stack development server
npm run dev

# 3. Open in browser
http://localhost:3000
```

---

## Vercel & GitHub Deployment

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: LeadHunter AI production SaaS"
   git remote add origin https://github.com/your-username/leadhunter-ai.git
   git push -u origin main
   ```
2. In [Vercel Dashboard](https://vercel.com/), click **Add New Project** and select your GitHub repo.
3. In **Environment Variables**, paste all keys from your `.env`.
4. Click **Deploy**.

---

## Production Testing Checklist

- [x] **Authentication:** Login, registration, token persistence, and role switching work seamlessly.
- [x] **Credit Purchasing:** Razorpay order creation generates valid orders; server-side HMAC-SHA256 signature verification credits exactly 5 leads.
- [x] **Idempotency Protection:** Re-submitting the same payment verification payload or webhook does not double credit.
- [x] **Credit Gate:** Users with 0 credits cannot search or claim leads.
- [x] **AI Natural Language Command:** Converts English and Hinglish commands into structured parameters.
- [x] **Google Places (New):** Server-side text search with minimal field mask executes query expansion without exposing keys.
- [x] **Website Verification:** Performs server-side HTTP availability check; properly classifies `NO_WEBSITE_FOUND` vs `WEBSITE_UNAVAILABLE`.
- [x] **Exact 5 Lead Guarantee:** If fewer than 5 qualified leads exist, 0 credits are deducted.
- [x] **Lead Ownership:** Delivers unique leads; prevents duplicate resale to the same buyer.
