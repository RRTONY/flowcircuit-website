import { handleStripeWebhook } from "@/server/stripe/webhook";

export async function POST(req: Request) {
  return handleStripeWebhook(req);
}
