"use server";

import { fail, ok, type ActionState } from "@/lib/action-result";
import { sendMail } from "@/lib/mail/send";
import { testEmail } from "@/lib/mail/templates";
import { requireUser } from "@/lib/session";

/**
 * Emails the signed-in user a test message. The address comes from the session, never from the
 * form, so this cannot be used to send mail to arbitrary people.
 */
export async function sendTestEmailAction(): Promise<ActionState> {
  const user = await requireUser();

  try {
    const delivery = await sendMail(testEmail({ to: user.email, name: user.name }));
    if (delivery === "console") return ok(`Printed to the dev server terminal (${user.email} is not a real inbox).`);
    if (delivery === "skipped") return fail("SMTP is not configured, so nothing was sent.");
    return ok(`Sent to ${user.email}. Check your inbox (and spam folder).`);
  } catch (error) {
    console.error("sendTestEmail failed", error);
    return fail("The SMTP server rejected the message. Check SMTP_HOST, SMTP_PORT, EMAIL and EMAIL_PASS.");
  }
}
