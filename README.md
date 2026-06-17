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
- Stripe Checkout unlock for the €19 one-time full report
- Full report sections for all missing keywords, matching keywords, weaknesses, suggested improvements, rewritten summary, skills to add, and final recommendation after payment redirect
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
```

`STRIPE_PRICE_ID` is optional. If it is missing, the MVP creates the €19 checkout item with inline Stripe `price_data`.

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
7. Click **Unlock full report for €19** to open Stripe Checkout.
8. Complete payment in Stripe test mode.
9. Return to `/analyzer?success=true` and review the unlocked full report.
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

The app keeps the analyzer flow stateless today. Email capture and the latest analysis are kept in frontend session storage so the report can be restored after Stripe redirects back with `success=true`. For a production launch, add Stripe webhook verification plus short-lived server-side report persistence before treating checkout success as authoritative.
