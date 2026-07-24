import "server-only";
import { TRPCError } from "@trpc/server";
import { Resend } from "resend";
import { ENV } from "./env";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

const FROM_EMAIL = process.env.FROM_EMAIL || "Flow Circuit <noreply@flow.tonygreenberg.com>";

let resendClient: Resend | null = null;
function getResendClient(): Resend | null {
  if (!ENV.resendApiKey) return null;
  if (!resendClient) resendClient = new Resend(ENV.resendApiKey);
  return resendClient;
}

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Notification title is required." });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Notification content is required." });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.` });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({ code: "BAD_REQUEST", message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.` });
  }

  return { title, content };
};

/**
 * Dispatches a project-owner notification via Resend (replaces Manus's
 * proprietary WebDevService/SendNotification). Returns `true` if the email
 * was accepted, `false` when it couldn't be sent (callers already treat this
 * as best-effort). Validation errors bubble up as TRPC errors so callers can
 * fix the payload.
 */
export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  const client = getResendClient();
  if (!client) {
    console.warn("[Notification] RESEND_API_KEY not configured — owner notification skipped:", title);
    return false;
  }

  if (!ENV.ownerOpenId) {
    console.warn("[Notification] OWNER_OPEN_ID (owner email) not configured — owner notification skipped:", title);
    return false;
  }

  try {
    const { error } = await client.emails.send({
      from: FROM_EMAIL,
      to: [ENV.ownerOpenId],
      subject: title,
      text: content,
    });

    if (error) {
      console.warn("[Notification] Resend error sending owner notification:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Notification] Error sending owner notification:", error);
    return false;
  }
}
