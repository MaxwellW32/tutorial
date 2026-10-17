import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { mailFrom, smtpConfig, smtpConfigured } from "./config";

export type MailMessage = {
  to: string;
  subject: string;
  /** Plain-text body. Every email also gets one, for clients that block HTML. */
  text: string;
  html: string;
};

export type Delivery = "smtp" | "console" | "skipped";

const isDev = process.env.NODE_ENV !== "production";

/** example.com is reserved by the internet standards and can never receive mail. */
export function isExampleAddress(email: string): boolean {
  return email.toLowerCase().endsWith("@example.com");
}

let transporter: Transporter | null = null;

/**
 * Sends one email.
 *
 * In development, mail to an @example.com address (or any mail when SMTP is not configured)
 * is printed to the terminal instead of being sent. That lets you test the whole magic-link
 * flow with `anyone@example.com` and copy the link straight out of the dev server output.
 */
export async function sendMail(message: MailMessage): Promise<Delivery> {
  if (isExampleAddress(message.to) || !smtpConfigured) {
    if (!isDev) {
      console.warn(`mail skipped (to: ${message.to}, subject: ${message.subject})`);
      return "skipped";
    }
    console.log(
      `\n📧  mail → console (not sent)\n    To:      ${message.to}\n    Subject: ${message.subject}\n\n${message.text}\n`,
    );
    return "console";
  }

  // Create the transporter once and reuse it: it keeps a connection pool to the SMTP server.
  transporter ??= nodemailer.createTransport(smtpConfig);
  await transporter.sendMail({ from: mailFrom, ...message });
  return "smtp";
}
