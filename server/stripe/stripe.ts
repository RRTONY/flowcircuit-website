import Stripe from "stripe";
import { ENV } from "../_core/env";

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!ENV.stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2025-01-27.acacia" as any,
    });
  }
  return stripeInstance;
}

/**
 * Create or retrieve a Stripe customer for a user
 */
export async function getOrCreateCustomer(
  userId: number,
  email: string,
  name: string
): Promise<string> {
  const stripe = getStripe();

  // Check if user already has a Stripe customer ID
  const { getDb } = await import("../db");
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { users } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (user?.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId: userId.toString(),
    },
  });

  // Save customer ID to database
  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, userId));

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for the Tribe plan
 */
export async function createCheckoutSession(params: {
  userId: number;
  email: string;
  name: string;
  origin: string;
  teamSize?: number;
}): Promise<{ url: string }> {
  const stripe = getStripe();
  const customerId = await getOrCreateCustomer(params.userId, params.email, params.name);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    client_reference_id: params.userId.toString(),
    mode: "subscription",
    allow_promotion_codes: true,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Flow Circuit — Tribe Plan",
            description: "Team Performance: Map your team's energy circuit.",
          },
          unit_amount: 2900, // $29.00 per member/month
          recurring: {
            interval: "month",
          },
        },
        quantity: params.teamSize || 1,
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
          maximum: 100,
        },
      },
    ],
    success_url: `${params.origin}/pricing?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${params.origin}/pricing?canceled=true`,
    metadata: {
      user_id: params.userId.toString(),
      customer_email: params.email,
      customer_name: params.name,
      tier: "tribe",
    },
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session");
  }

  return { url: session.url };
}

/**
 * Create a Stripe Customer Portal session for managing subscriptions
 */
export async function createPortalSession(params: {
  customerId: string;
  origin: string;
}): Promise<{ url: string }> {
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: `${params.origin}/pricing`,
  });

  return { url: session.url };
}

/**
 * Get subscription status for a user
 */
export async function getSubscriptionStatus(userId: number): Promise<{
  active: boolean;
  tier: string;
  status: string | null;
  subscriptionId: string | null;
  customerId: string | null;
}> {
  const { getDb } = await import("../db");
  const db = await getDb();
  if (!db) return { active: false, tier: "explorer", status: null, subscriptionId: null, customerId: null };

  const { users } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return { active: false, tier: "explorer", status: null, subscriptionId: null, customerId: null };

  const isActive = user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";

  return {
    active: isActive,
    tier: isActive ? "tribe" : "explorer",
    status: user.subscriptionStatus ?? null,
    subscriptionId: user.subscriptionId ?? null,
    customerId: user.stripeCustomerId ?? null,
  };
}
