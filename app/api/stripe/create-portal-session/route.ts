import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(req: NextRequest) {
  try {
    // TODO: Get the authenticated user ID from your auth provider
    // Example with Clerk:
    // const { userId } = auth();
    // if (!userId) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // For now, we'll use a mock user ID
    // Replace this with actual user authentication
    const userId = "mock-user-id";

    // TODO: Fetch the user's stripeCustomerId from your database
    // Example:
    // const user = await db.user.findUnique({
    //   where: { id: userId },
    //   select: { stripeCustomerId: true }
    // });
    //
    // if (!user?.stripeCustomerId) {
    //   return NextResponse.json(
    //     { error: "No Stripe customer found" },
    //     { status: 404 }
    //   );
    // }

    // Mock Stripe customer ID - replace with actual database lookup
    const stripeCustomerId = process.env.STRIPE_CUSTOMER_ID || "cus_mock123";

    // Create a Stripe billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to create billing portal session",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
