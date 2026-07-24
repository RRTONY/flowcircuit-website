import Stripe from "stripe";
import { getStripe } from "./stripe";
import { ENV } from "../_core/env";

/**
 * Handle Stripe webhook events
 * Route: app/api/stripe/webhook/route.ts (POST)
 * Requires the raw request body for signature verification.
 */
export async function handleStripeWebhook(req: Request): Promise<Response> {
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return Response.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, ENV.stripeWebhookSecret);
  } catch (err: any) {
    console.error("[Webhook] Signature verification failed:", err.message);
    return Response.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Test event detected, returning verification response");
    return Response.json({ verified: true });
  }

  console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Webhook] Invoice paid: ${invoice.id}`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`[Webhook] Invoice payment failed: ${invoice.id}`);
        // Could notify owner about failed payment
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err: any) {
    console.error(`[Webhook] Error processing ${event.type}:`, err.message);
    // Return 200 to acknowledge receipt even if processing fails
    // Stripe will retry on 5xx responses
  }

  return Response.json({ received: true });
}

/**
 * Handle successful checkout — activate subscription
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  if (!userId) {
    console.error("[Webhook] No user_id in checkout session metadata");
    return;
  }

  const { getDb } = await import("../db");
  const db = await getDb();
  if (!db) return;

  const { users } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  await db.update(users).set({
    stripeCustomerId: session.customer as string,
    subscriptionId: session.subscription as string,
    subscriptionStatus: "active",
  }).where(eq(users.id, parseInt(userId)));

  console.log(`[Webhook] Subscription activated for user ${userId}`);

  // Notify owner
  const { notifyOwner } = await import("../_core/notification");
  await notifyOwner({
    title: "New Tribe Subscription!",
    content: `User ${session.metadata?.customer_name || userId} (${session.metadata?.customer_email || "unknown"}) just subscribed to the Tribe plan.`,
  });
}

/**
 * Handle subscription updates (upgrades, downgrades, status changes)
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { getDb } = await import("../db");
  const db = await getDb();
  if (!db) return;

  const { users } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  await db.update(users).set({
    subscriptionStatus: subscription.status,
    subscriptionId: subscription.id,
  }).where(eq(users.stripeCustomerId, customerId));

  console.log(`[Webhook] Subscription updated for customer ${customerId}: ${subscription.status}`);
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  const { getDb } = await import("../db");
  const db = await getDb();
  if (!db) return;

  const { users } = await import("../../drizzle/schema");
  const { eq } = await import("drizzle-orm");

  await db.update(users).set({
    subscriptionStatus: "canceled",
    subscriptionId: null,
  }).where(eq(users.stripeCustomerId, customerId));

  console.log(`[Webhook] Subscription canceled for customer ${customerId}`);

  // Notify owner
  const { notifyOwner } = await import("../_core/notification");
  await notifyOwner({
    title: "Subscription Canceled",
    content: `Customer ${customerId} has canceled their Tribe subscription.`,
  });
}
