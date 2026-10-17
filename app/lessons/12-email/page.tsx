import { Suspense } from "react";
import { SendTestEmailGate } from "@/components/demos/send-test-email-gate";
import { SessionStatusSkeleton } from "@/components/demos/session-status";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Demo } from "@/components/lesson/demo";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("12-email");

export default function Lesson() {
  return (
    <LessonPage slug="12-email">
      <h2>How an app sends email</h2>
      <p>
        Your server does not deliver email itself; it hands the message to an <strong>SMTP server</strong> (your email
        provider) over the network, with a username and password, and that server delivers it. Nodemailer is the Node.js
        library that speaks SMTP.
      </p>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>SMTP_HOST</code>
            </td>
            <td>
              The provider&apos;s server, e.g. <code>smtp.gmail.com</code> or <code>smtp.hostinger.com</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>SMTP_PORT</code>
            </td>
            <td>
              <code>465</code> (encrypted from the start) or <code>587</code> (starts plain, upgrades to TLS).
            </td>
          </tr>
          <tr>
            <td>
              <code>EMAIL</code> / <code>EMAIL_PASS</code>
            </td>
            <td>
              The mailbox to send from and its password. Gmail and others require an <em>app password</em>, not your login
              password.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>The mail layer</h2>
      <p>
        Three small files in <code>lib/mail/</code>: settings, sending, and templates. Nothing else in the app knows
        Nodemailer exists.
      </p>
      <CodeBlock
        filename="lib/mail/config.ts"
        lang="ts"
        code={`
const port = Number(process.env.SMTP_PORT ?? 587);

export const smtpConfig = {
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port,
  secure: port === 465,
  auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASS },
};

export const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.EMAIL && process.env.EMAIL_PASS);
export const mailFrom = \`Next.js Tutorial <\${process.env.EMAIL}>\`;
`}
      />
      <CodeBlock
        filename="lib/mail/send.ts"
        lang="ts"
        code={`
import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

export type MailMessage = { to: string; subject: string; text: string; html: string };

let transporter: Transporter | null = null;          // created once, reused (it pools connections)

export async function sendMail(message: MailMessage) {
  if (isExampleAddress(message.to) || !smtpConfigured) {
    if (!isDev) return "skipped";                     // never try to deliver to example.com in production
    console.log(\`📧 mail → console\\nTo: \${message.to}\\nSubject: \${message.subject}\\n\\n\${message.text}\`);
    return "console";
  }

  transporter ??= nodemailer.createTransport(smtpConfig);
  await transporter.sendMail({ from: mailFrom, ...message });
  return "smtp";
}
`}
      />
      <p>
        The <code>@example.com</code> rule is the development trick that makes the whole tutorial testable: that domain
        is reserved and can never receive mail, so any message to it is printed in the terminal instead. That is how you can
        test the magic-link flow in lesson 10 without a real inbox.
      </p>

      <h2>Templates: text and HTML, always both</h2>
      <CodeBlock
        filename="lib/mail/templates.ts"
        lang="ts"
        code={`
export function magicLinkEmail({ to, url }: { to: string; url: string }): MailMessage {
  const host = new URL(url).host;
  return {
    to,
    subject: "Your sign-in link",
    text: \`Sign in to the Next.js Tutorial (\${host}):\\n\${url}\\n\\nThe link works once and expires in 24 hours.\`,
    html: layout("Sign in to the Next.js Tutorial", \`<p>Use the button below to sign in on <strong>\${escapeHtml(host)}</strong>.</p>\`, { label: "Sign in", url }, "…"),
  };
}
`}
      />
      <ul>
        <li>
          Email clients ignore your stylesheet, so <code>layout()</code> writes inline styles with literal colours.
        </li>
        <li>
          Every email has a plain-text version for clients that block HTML, and for the terminal in development.
        </li>
        <li>
          Anything that came from a user goes through <code>escapeHtml()</code> first. An email is HTML like any other
          page.
        </li>
      </ul>

      <h2>Wiring it into Auth.js</h2>
      <CodeBlock
        filename="lib/auth.ts"
        code={`
Nodemailer({
  server: smtpConfig,
  from: mailFrom,
  async sendVerificationRequest({ identifier, url }) {   // Auth.js makes the token and the URL…
    await sendMail(magicLinkEmail({ to: identifier, url }));   // …we decide how to deliver it
  },
}),
`}
      />

      <h2>Sending from a Server Action</h2>
      <CodeBlock
        filename="actions/email.ts"
        code={`
"use server";

export async function sendTestEmailAction(): Promise<ActionState> {
  const user = await requireUser();                                 // the address comes from the session,
  try {                                                             // never from the form
    const delivery = await sendMail(testEmail({ to: user.email, name: user.name }));
    return ok(delivery === "console" ? "Printed to the terminal." : \`Sent to \${user.email}.\`);
  } catch (error) {
    console.error("sendTestEmail failed", error);
    return fail("The SMTP server rejected the message. Check the SMTP_* variables.");
  }
}
`}
      />
      <Demo title="Send yourself a test email" source="actions/email.ts">
        <Suspense fallback={<SessionStatusSkeleton />}>
          <SendTestEmailGate />
        </Suspense>
      </Demo>

      <h2>Do not make the user wait</h2>
      <p>
        An SMTP round trip can take a second or two. For notifications (as opposed to the test above, where the result is
        the point), send after the response has gone out using <code>after()</code>:
      </p>
      <CodeBlock
        code={`
import { after } from "next/server";

export async function assignTask(formData: FormData) {
  const user = await requireUser();
  const task = await assign(user.id, …);                          // the important part, inside the request
  refresh();

  after(async () => {                                              // runs once the response has been sent
    await sendMail(assignedEmail({ to: task.assigneeEmail, task }));
  });

  return ok("Assigned.");
}
`}
      />

      <Callout kind="warning" title="Never let the user choose the recipient">
        <p>
          An action that sends to an address from the form is an open relay for spam the moment it goes live. Send to
          addresses you already have on record (the session, a row in your database) and keep rate limits in mind for
          anything a visitor can trigger.
        </p>
      </Callout>

      <h2>Deliverability, briefly</h2>
      <ul>
        <li>
          Send from the mailbox you authenticate as. A <code>from</code> that does not match the account is rejected or
          marked as spam.
        </li>
        <li>
          Set up SPF and DKIM DNS records for your domain (your provider documents this). Without them, Gmail quietly
          distrusts you.
        </li>
        <li>For real volume, a transactional service (Resend, Postmark, SES) replaces SMTP credentials with an API key. The{" "}
          <code>sendMail()</code> function is the only place that would change.</li>
      </ul>

      <h2>Your first try</h2>
      <p>Send an email you can read in the terminal, then change its words:</p>
      <ol>
        <li>
          Signed in as <code>you@example.com</code> (lesson 10), press the button in the demo above. The email is printed
          in the <code>npm run dev</code> terminal.
        </li>
        <li>
          Open <code>lib/mail/templates.ts</code>, find <code>subject: &quot;Test email from the Next.js Tutorial&quot;</code>{" "}
          and change it to anything.
        </li>
        <li>Press the button again and spot your subject line in the terminal.</li>
      </ol>
      <p>
        <strong>If you want more:</strong> sign in with Google (a real address) and press the button. The same code now
        goes through SMTP; check your inbox.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>SMTP settings in env vars, one Nodemailer transporter reused, one sendMail() function for the whole app.</li>
        <li>Templates return text and HTML; escape user content.</li>
        <li>
          Example addresses print to the terminal in development; use <code>after()</code> so email never slows a response.
        </li>
      </ul>
    </LessonPage>
  );
}
