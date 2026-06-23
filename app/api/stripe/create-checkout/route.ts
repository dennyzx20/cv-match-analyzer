import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

type CheckoutPlan = "base" | "premium";

const checkoutPlans: Record<
  CheckoutPlan,
  {
    envPriceId: string;
    name: string;
    unitAmount: number;
  }
> = {
  base: {
    envPriceId: "STRIPE_BASE_PRICE_ID",
    name: "CV Match Base Report",
    unitAmount: 999
  },
  premium: {
    envPriceId: "STRIPE_PREMIUM_PRICE_ID",
    name: "CV Match Premium Report",
    unitAmount: 1999
  }
};

export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local." },
        { status: 500 }
      );
    }

    const payload = await readCheckoutPayload(request);
    const selectedPlan = checkoutPlans[payload.plan];
    const configuredPriceId = process.env[selectedPlan.envPriceId] || getLegacyPremiumPriceId(payload.plan);
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = getCheckoutOrigin(request.url);
    const successUrl = new URL("/analyzer", origin);
    successUrl.searchParams.set("success", "true");
    successUrl.searchParams.set("plan", payload.plan);
    if (payload.analysisId) {
      successUrl.searchParams.set("analysisId", payload.analysisId);
    }

    const lineItem = configuredPriceId
      ? {
          price: configuredPriceId,
          quantity: 1
        }
      : {
          price_data: {
            currency: "eur",
            product_data: {
              name: selectedPlan.name
            },
            unit_amount: selectedPlan.unitAmount
          },
          quantity: 1
        };

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [lineItem],
      metadata: {
        plan: payload.plan,
        ...(payload.analysisId ? { analysisId: payload.analysisId } : {})
      },
      success_url: successUrl.toString(),
      cancel_url: `${origin}/analyzer`
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

async function readCheckoutPayload(request: Request): Promise<{ analysisId?: string; plan: CheckoutPlan }> {
  try {
    const body = (await request.json()) as { analysisId?: unknown; plan?: unknown };
    const plan = body.plan === "base" || body.plan === "premium" ? body.plan : "premium";
    return {
      plan,
      ...(typeof body.analysisId === "string" && body.analysisId.trim() ? { analysisId: body.analysisId.trim() } : {})
    };
  } catch {
    return { plan: "premium" };
  }
}

function getLegacyPremiumPriceId(plan: CheckoutPlan) {
  if (plan !== "premium") {
    return undefined;
  }

  return process.env.STRIPE_PRICE_ID;
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
