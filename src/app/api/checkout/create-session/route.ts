import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { plan = "monthly", successUrl = "/dashboard?upgraded=true", cancelUrl = "/dashboard" } = body;

    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (stripeKey) {
      try {
        const priceMap: Record<string, number> = {
          sprint: 500, // $5.00
          monthly: 1200, // $12.00
          quarterly: 2900 // $29.00
        };

        const formData = new URLSearchParams();
        formData.append("payment_method_types[0]", "card");
        formData.append("line_items[0][price_data][currency]", "usd");
        formData.append(
          "line_items[0][price_data][product_data][name]",
          plan === "sprint" ? "Hicejo 72-Hour Application Sprint" : "Hicejo Pro Unlimited"
        );
        formData.append(
          "line_items[0][price_data][unit_amount]",
          String(priceMap[plan] || 1200)
        );
        formData.append("line_items[0][quantity]", "1");
        formData.append("mode", plan === "sprint" ? "payment" : "subscription");
        formData.append("success_url", successUrl);
        formData.append("cancel_url", cancelUrl);

        if (plan !== "sprint") {
          formData.append("line_items[0][price_data][recurring][interval]", "month");
        }

        const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formData.toString()
        });

        const stripeData = await stripeRes.json();
        if (stripeData.url) {
          return NextResponse.json({ success: true, url: stripeData.url });
        }
      } catch (stripeErr: any) {
        console.error("Stripe session error:", stripeErr);
      }
    }

    // Fallback Simulation for early access or when Stripe key is not configured in local env
    return NextResponse.json({
      success: true,
      simulated: true,
      message: `Upgraded to Hicejo ${plan === "sprint" ? "72-Hour Sprint Pass ($5)" : "Pro Unlimited ($12/mo)"}!`,
      plan
    });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
