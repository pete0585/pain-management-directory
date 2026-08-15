# FindPainManagement.com

The first neutral, patient-facing directory for board-certified pain management physicians and clinics. 15,000-20,000 physicians seeded from NPPES public data. Monetized at $149/yr (Verified) and $299/yr (Featured).

## Stack

- Next.js 15.3.9 (App Router, TypeScript)
- Tailwind CSS (custom navy/teal/amber palette)
- Supabase (PostgreSQL + Auth) — `fbuqrnzofktepkzyfmhy` project, `pm_listings/claims/payments/leads` tables
- Stripe (Verified $149/yr, Featured $299/yr)
- Vercel deployment
- Resend for email (verification + outreach via `mail.findpainmanagement.com`)

## Local Development

```bash
cp .env.example .env.local
# Fill in env vars from Vercel dashboard or bootstrap output

npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_VERIFIED_PRICE_ID` | Stripe price ID for Verified ($149/yr) |
| `STRIPE_FEATURED_PRICE_ID` | Stripe price ID for Featured ($299/yr) |
| `NEXT_PUBLIC_SITE_URL` | Site URL (https://www.findpainmanagement.com) |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | Sending email (no-reply@mail.findpainmanagement.com) |

## Supabase Setup

1. Apply the migration:
```bash
# Via Supabase MCP or dashboard SQL editor:
# supabase/migrations/001_initial_schema.sql
```

2. Tables created:
   - `pm_listings` — physician/clinic profiles (NPI-based)
   - `pm_claims` — listing claim tokens
   - `pm_payments` — Stripe payment records
   - `pm_leads` — patient contact requests

## Seeding Data

Download NPPES bulk file from https://download.cms.gov/nppes/NPI_Files.html then:

```bash
npx ts-node -r tsconfig-paths/register scripts/seed.ts /path/to/npidata.csv
```

Target taxonomy codes: `208VP0000X`, `208VP0014X`, `207LP2900X`, `2081P2900X`, `261QP3300X`

## Vercel Deployment

1. Push to GitHub repo (`pete0585/pain-management-directory`)
2. Vercel auto-deploys on push to main
3. All env vars are set via bootstrap agent — no manual configuration needed
4. Custom domain: `findpainmanagement.com` + `www.findpainmanagement.com`

## Key Pages

| Route | Purpose |
|---|---|
| `/` | Homepage with search and specialty browse |
| `/listings` | Browse all with filtering sidebar |
| `/doctor/[slug]` | Physician detail page (JSON-LD schema) |
| `/pain-management-doctors/[city-state]` | City SEO pages |
| `/chronic-pain-conditions/[condition]` | Condition-specific pages |
| `/pain-treatments/[procedure]` | Procedure-specific pages |
| `/submit` | Free listing submission form |
| `/claim/[id]` | Claim a listing (email verification) |
| `/admin` | Protected admin panel |

## API Routes

| Route | Purpose |
|---|---|
| `POST /api/upgrade` | Create Stripe checkout session |
| `POST /api/checkout` | Alias for upgrade |
| `POST /api/claim` | Send verification email |
| `POST /api/claim/verify` | Verify token and claim listing |
| `POST /api/submit` | Submit new listing |
| `POST /api/webhooks/stripe` | Handle Stripe events |
| `POST /api/inbound-email` | Handle Resend inbound webhooks |

## Resend Webhook

Register at: `https://www.findpainmanagement.com/api/inbound-email` (MUST use www — Vercel redirects non-www with 307)

## Outreach Configuration

After launch, add to `agents/outreach/config.json`:
```json
{
  "slug": "pain-management",
  "supabase_table": "pm_listings",
  "sending_domain": "mail.findpainmanagement.com",
  "site_url": "https://www.findpainmanagement.com",
  "enabled": false,
  "daily_cap": 0
}
```
