/**
 * Email Service — Resend integration with notifyOwner fallback
 *
 * When RESEND_API_KEY is configured, sends real emails via Resend.
 * When not configured, falls back to notifyOwner (owner gets the
 * email content as a notification and can forward manually).
 */
import { Resend } from "resend";
import { notifyOwner } from "./_core/notification";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || "Flow Circuit <noreply@flow.tonygreenberg.com>";

let resendClient: Resend | null = null;

if (RESEND_API_KEY) {
  resendClient = new Resend(RESEND_API_KEY);
  console.log("[Email] Resend configured — emails will be sent directly to recipients");
} else {
  console.log("[Email] No RESEND_API_KEY — falling back to owner notifications");
}

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email to a recipient.
 * - If Resend is configured, sends directly.
 * - If not, sends to the owner as a notification (with recipient info in the body).
 *
 * Returns true on success, false on failure.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const { to, subject, text, html } = payload;

  if (resendClient) {
    try {
      const { data, error } = await resendClient.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject,
        text,
        html: html || undefined,
      });

      if (error) {
        console.warn(`[Email] Resend error for ${to}:`, error);
        // Fall back to owner notification
        return sendViaOwnerNotification(to, subject, text);
      }

      console.log(`[Email] Sent to ${to} via Resend (id: ${data?.id})`);
      return true;
    } catch (err) {
      console.warn(`[Email] Resend exception for ${to}:`, err);
      return sendViaOwnerNotification(to, subject, text);
    }
  }

  // No Resend configured — use owner notification as relay
  return sendViaOwnerNotification(to, subject, text);
}

async function sendViaOwnerNotification(
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  try {
    return await notifyOwner({
      title: `📧 Email to send → ${to}`,
      content: `RECIPIENT: ${to}\nSUBJECT: ${subject}\n\n${body}`,
    });
  } catch (err) {
    console.warn("[Email] Owner notification fallback failed:", err);
    return false;
  }
}
