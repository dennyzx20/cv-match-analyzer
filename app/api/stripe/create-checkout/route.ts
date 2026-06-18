import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local." },
        { status: 500 }
      );
    }

    const payload = await readCheckoutPayload(request);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = getCheckoutOrigin(request.url);
    const successUrl = new URL("/analyzer", origin);
    successUrl.searchParams.set("success", "true");
    if (payload.analysisId) {
      successUrl.searchParams.set("analysisId", payload.analysisId);
    }

    const lineItem = process.env.STRIPE_PRICE_ID
      ? {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      : {
          price_data: {
            currency: "eur",
            product_data: {
              name: "CV Match Full Report"
            },
            unit_amount: 1900
          },
          quantity: 1
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      metadata: payload.analysisId ? { analysisId: payload.analysisId } : undefined,
      success_url: successUrl.toString(),
      cancel_url: `${origin}/`
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return NextResponse.json({ error: "Stripe checkout could not be started." }, { status: 500 });
  }
}

async function readCheckoutPayload(request: Request): Promise<{ analysisId?: string }> {
  try {
    const body = (await request.json()) as { analysisId?: unknown };
    return typeof body.analysisId === "string" && body.analysisId.trim()
      ? { analysisId: body.analysisId.trim() }
      : {};
  } catch {
    return {};
  }
}

function getCheckoutOrigin(requestUrl: string) {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const url = new URL(requestUrl);
  if (url.hostname === "0.0.0.0") {
    url.hostname = "localhost";
  }

  return url.origin;
}
