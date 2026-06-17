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

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const origin = new URL(request.url).origin;
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
      success_url: `${origin}/analyzer?success=true`,
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
