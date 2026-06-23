# CV Match Analyzer

CV Match Analyzer is a no-login freemium SaaS MVP built with Next.js, TypeScript, Tailwind CSS, App Router, API routes, PDF upload, PDF text extraction, and OpenAI-powered CV/job matching.

## Features

- Marketing homepage with CTA, how it works, pricing, and FAQ
- Analyzer page with PDF upload, job description input, loading and validation states
- Optional lead capture before results with email and "Send me my report by email" intent
- Server-side PDF text extraction
- Automatic CV language detection for Italian and English
- OpenAI analysis with structured JSON output
- Free preview showing score, ATS risk level, short summary, up to 3 missing keywords, and up to 3 strengths
- AI response language adapts to the detected CV language
- Stripe Checkout unlock for Base 9,99 EUR and Premium 19,99 EUR reports
- Base report with match score, top strengths, top weaknesses, priority missing keywords, and concise CV improvement suggestions
- Premium report with full keyword analysis, detailed recommendations, rewritten CV sections, cover letter draft, and PDF download
- No database, no auth, no dashboard, and no analysis history in the MVP

## Requirements

- Node.js 18.17 or newer
- An OpenAI API key

## Setup

```bash
npm install
cp .env.example .env.local
```

If you prefer pnpm:

```bash
pnpm install
cp .env.example .env.local
```

Add your key to `.env.local`:

```bash
OPENAI_API_KEY=sk-your-openai-api-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLIC_KEY=pk_test_your-stripe-public-key
STRIPE_BASE_PRICE_ID=
STRIPE_PREMIUM_PRICE_ID=
```

`STRIPE_BASE_PRICE_ID` and `STRIPE_PREMIUM_PRICE_ID` are optional. If they are missing, the MVP creates inline Stripe `price_data` for 9,99 EUR and 19,99 EUR. `STRIPE_PRICE_ID` is still supported as a legacy Premium fallback.

## Development

```bash
npm run dev
```

With pnpm:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test the App

1. Go to `/analyzer`.
2. Upload a PDF CV under 5 MB.
3. Paste a real job description.
4. Click **Analyze CV**.
5. Optionally enter an email and choose whether you want the report by email.
6. Review the free preview: score, detected language, risk level, summary, top missing keywords, and top strengths.
7. Choose **Base 9,99 EUR** or **Premium 19,99 EUR** to open Stripe Checkout.
8. Complete payment in Stripe test mode.
9. Return to `/analyzer?success=true` and review the unlocked Base or Premium report.
10. Click **Analyze another CV** to restart.

## Project Structure

```text
app/
  api/analyze/route.ts       Server API route for PDF extraction and AI analysis
  analyzer/page.tsx          Analyzer page
  globals.css                Global Tailwind styles
  layout.tsx                 App layout and metadata
  page.tsx                   Homepage
components/
  analyzer/                  Upload form and result UI
  analyzer/lead-capture-form.tsx Optional frontend-only lead capture
  marketing/                 Homepage sections
  ui/                        Shared UI primitives
lib/
  ai.ts                      OpenAI client and structured analysis call
  language.ts                Simple Italian/English CV language detection
  pdf.ts                     PDF validation and text extraction
  prompt.ts                  Recruiter + ATS prompt
  types.ts                   Shared TypeScript types
```

## Future-Ready Notes

The app keeps the analyzer flow stateless today. Email capture and recent analyses are kept in frontend local storage so the report can be restored after Stripe redirects back with `success=true`. For a production launch, add Stripe webhook verification plus short-lived server-side report persistence before treating checkout success as authoritative.
