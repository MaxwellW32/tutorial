import type { MailMessage } from "./send";

/** Never put user-provided text into HTML without escaping it first. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// Email clients ignore your stylesheet, so styles are inline and the colours are literal.
function layout(heading: string, bodyHtml: string, action: { label: string; url: string } | null, footnote: string): string {
  const button = action
    ? `<p style="margin:24px 0;"><a href="${escapeHtml(action.url)}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;font-size:14px;font-weight:500;padding:10px 18px;border-radius:8px;">${escapeHtml(action.label)}</a></p>`
    : "";
  return `
  <div style="background:#fafafa;padding:32px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:10px;padding:28px;">
      <p style="margin:0 0 20px;font-size:14px;font-weight:600;color:#18181b;">Next.js Tutorial</p>
      <h1 style="margin:0 0 12px;font-size:20px;line-height:1.3;color:#18181b;">${escapeHtml(heading)}</h1>
      <div style="font-size:14px;line-height:1.6;color:#52525b;">${bodyHtml}</div>
      ${button}
      <p style="margin:0;font-size:12px;line-height:1.5;color:#71717a;">${escapeHtml(footnote)}</p>
    </div>
  </div>`;
}

export function magicLinkEmail({ to, url }: { to: string; url: string }): MailMessage {
  const host = new URL(url).host;
  return {
    to,
    subject: "Your sign-in link",
    text: `Sign in to the Next.js Tutorial (${host}):\n${url}\n\nThe link works once and expires in 24 hours. If you didn't ask for it, ignore this email.`,
    html: layout(
      "Sign in to the Next.js Tutorial",
      `<p style="margin:0;">Use the button below to sign in on <strong>${escapeHtml(host)}</strong>.</p>`,
      { label: "Sign in", url },
      "The link works once and expires in 24 hours. If you didn't ask for it, you can ignore this email.",
    ),
  };
}

export function testEmail({ to, name }: { to: string; name: string | null }): MailMessage {
  const greeting = name ? `Hi ${name},` : "Hi,";
  return {
    to,
    subject: "Test email from the Next.js Tutorial",
    text: `${greeting}\n\nThis email was sent by a Server Action in Lesson 12 using Nodemailer. If you can read this, SMTP works.`,
    html: layout(
      "It works!",
      `<p style="margin:0;">${escapeHtml(greeting)}</p><p>This email was sent by a Server Action in <strong>Lesson 12</strong> using Nodemailer. If you can read this, SMTP works.</p>`,
      null,
      "Sent from your local dev server.",
    ),
  };
}
