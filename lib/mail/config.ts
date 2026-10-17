// SMTP settings from .env.local. EMAIL_PASS is a secret, and it only ever exists on the
// server: it has no NEXT_PUBLIC_ prefix, so Next.js never puts it in browser code.
const port = Number(process.env.SMTP_PORT ?? 587);
const user = process.env.EMAIL;
const pass = process.env.EMAIL_PASS;

export const smtpConfig = {
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port,
  secure: port === 465, // 465 = TLS from the start; 587 starts plain and upgrades (STARTTLS)
  auth: { user, pass },
};

/** True when every variable needed to send real email is present. */
export const smtpConfigured = Boolean(process.env.SMTP_HOST && user && pass);

export const mailFrom = process.env.EMAIL_FROM ?? `Next.js Tutorial <${user ?? "no-reply@localhost"}>`;
