import Link from "next/link";
import { Suspense } from "react";
import { SessionStatus, SessionStatusSkeleton } from "@/components/demos/session-status";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Demo } from "@/components/lesson/demo";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("10-auth");

export default function Lesson() {
  return (
    <LessonPage slug="10-auth">
      <h2>Three words that get mixed up</h2>
      <ul>
        <li>
          <strong>Authentication</strong>: proving who you are (Google says so, or you clicked a link only your inbox
          received).
        </li>
        <li>
          <strong>Session</strong>: remembering that proof. The browser gets a cookie with a random token; the server keeps
          a row saying which user that token belongs to and when it expires.
        </li>
        <li>
          <strong>Authorisation</strong>: deciding what a known user may do. That is not the auth library&apos;s job; it is
          a WHERE clause and an <code>if</code> in your code (lesson 13).
        </li>
      </ul>
      <Demo title="Who are you right now?" source="components/demos/session-status.tsx">
        <Suspense fallback={<SessionStatusSkeleton />}>
          <SessionStatus />
        </Suspense>
      </Demo>

      <h2>Auth.js in one file</h2>
      <p>
        The library is <code>next-auth</code> version 5 (the project calls itself Auth.js). The entire configuration is{" "}
        <code>lib/auth.ts</code>; everything else imports from it.
      </p>
      <CodeBlock
        filename="lib/auth.ts"
        code={`
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts, sessionsTable: sessions, verificationTokensTable: verificationTokens }),
  session: { strategy: "database" },
  providers: [
    Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET }),
    Nodemailer({
      server: smtpConfig,
      from: mailFrom,
      async sendVerificationRequest({ identifier, url }) {
        await sendMail(magicLinkEmail({ to: identifier, url }));   // our mail layer (lesson 12)
      },
    }),
  ],
  pages: { signIn: "/login", verifyRequest: "/login/check-email", error: "/login" },
  callbacks: {
    session({ session, user }) {
      return { expires: session.expires, user: { id: user.id, name: user.name ?? null, email: user.email, image: user.image ?? null } };
    },
  },
});
`}
      />
      <table>
        <thead>
          <tr>
            <th>Piece</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>adapter</code>
            </td>
            <td>
              Where users, accounts, sessions and tokens are stored: our Drizzle tables from <code>db/schema.ts</code>.
            </td>
          </tr>
          <tr>
            <td>
              <code>session.strategy: &quot;database&quot;</code>
            </td>
            <td>
              The cookie holds only a random token; the user data is in the <code>sessions</code> table. The alternative
              (JWT) puts the data in the cookie itself and cannot be revoked server-side.
            </td>
          </tr>
          <tr>
            <td>
              <code>providers</code>
            </td>
            <td>Ways to sign in. Google is OAuth; Nodemailer sends a magic link.</td>
          </tr>
          <tr>
            <td>
              <code>pages</code>
            </td>
            <td>Use our own pages instead of the default Auth.js screens.</td>
          </tr>
          <tr>
            <td>
              <code>callbacks.session</code>
            </td>
            <td>Shape what pages receive. We expose id, name, email and image and nothing else.</td>
          </tr>
        </tbody>
      </table>
      <CodeBlock
        filename="app/api/auth/[...nextauth]/route.ts"
        code={`
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;   // mounts /api/auth/signin, /api/auth/callback/google, /api/auth/signout, …
`}
      />

      <h3>Environment variables</h3>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>AUTH_SECRET</code>
            </td>
            <td>Signs cookies and tokens. Any long random string; different per environment.</td>
          </tr>
          <tr>
            <td>
              <code>AUTH_URL</code>
            </td>
            <td>
              Where the app lives (<code>http://localhost:3000</code> in dev). Google sends users back here.
            </td>
          </tr>
          <tr>
            <td>
              <code>AUTH_TRUST_HOST</code>
            </td>
            <td>Trust the incoming Host header (needed behind proxies and on most hosts).</td>
          </tr>
          <tr>
            <td>
              <code>AUTH_GOOGLE_ID</code> / <code>AUTH_GOOGLE_SECRET</code>
            </td>
            <td>
              From Google Cloud Console → APIs &amp; Services → Credentials → OAuth client (Web application). The
              authorised redirect URI must be exactly <code>{"<AUTH_URL>"}/api/auth/callback/google</code>.
            </td>
          </tr>
        </tbody>
      </table>

      <h2>How Google sign-in works</h2>
      <ol>
        <li>The user clicks &quot;Continue with Google&quot;; our Server Action calls <code>signIn(&quot;google&quot;)</code>.</li>
        <li>Auth.js redirects the browser to accounts.google.com with our client id.</li>
        <li>The user approves; Google redirects back to <code>/api/auth/callback/google</code> with a one-time code.</li>
        <li>Auth.js exchanges the code for the user&apos;s profile (server to server, using the secret).</li>
        <li>
          It finds or creates the user, writes a row in <code>sessions</code>, sets the cookie, and redirects to{" "}
          <code>redirectTo</code>.
        </li>
      </ol>
      <p>
        <strong>Magic links</strong> replace steps 2 to 4: Auth.js stores a one-time token in{" "}
        <code>verification_tokens</code>, we email a link containing it, and clicking the link proves the user owns that
        inbox. The rest is identical.
      </p>

      <h2>The sign-in actions</h2>
      <CodeBlock
        filename="actions/auth.ts"
        code={`
"use server";

export async function signInWithGoogle(formData: FormData) {
  const redirectTo = safePath(formData.get("redirectTo"), "/account");   // never redirect off-site
  try {
    await signIn("google", { redirectTo });          // throws a redirect to Google: that is how it works
  } catch (error) {
    if (error instanceof AuthError) redirect(\`/login?error=\${error.type}\`);
    throw error;                                     // let Next's redirect "error" through
  }
}

export async function signInWithEmail(formData: FormData) {
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!email.success) redirect("/login?error=EmailInvalid");
  await signIn("nodemailer", { email: email.data, redirectTo, redirect: false });   // sends the email
  redirect("/login/check-email");
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
`}
      />
      <p>
        The login page (<code>app/login/page.tsx</code>) is two plain forms whose <code>action</code> is one of those
        functions, plus an error banner driven by <code>?error=</code> in the URL.{" "}
        <Link href="/login">Open it</Link> and read it next to the code.
      </p>

      <h2>Reading the session</h2>
      <CodeBlock
        filename="lib/session.ts"
        code={`
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const getSessionUser = cache(async () => {     // one lookup per request, however many callers
  const session = await auth();
  return session?.user ?? null;
});

export async function requireUser() {                 // for pages and actions that need a user
  const user = await getSessionUser();
  if (user === null) redirect("/login");
  return user;
}
`}
      />
      <p>
        <code>auth()</code> reads the cookie, which is request data, so any component that calls these must be inside{" "}
        <code>&lt;Suspense&gt;</code>. The header of every lesson page does exactly that:
      </p>
      <CodeBlock
        filename="app/lessons/layout.tsx"
        code={`
<Suspense fallback={<UserMenuSkeleton />}>
  <UserMenu />            {/* calls getSessionUser() → "Sign in" or "<name> · Sign out" */}
</Suspense>
`}
      />
      <CodeBlock
        filename="types/next-auth.d.ts"
        code={`
// Teach TypeScript the shape our session callback returns, so session.user.id type-checks.
declare module "next-auth" {
  interface Session {
    user: { id: string; name: string | null; email: string; image: string | null } & DefaultSession["user"];
  }
}
`}
      />

      <h2>Protecting things</h2>
      <table>
        <thead>
          <tr>
            <th>What</th>
            <th>How</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A page</td>
            <td>
              <code>const user = await requireUser()</code> in the component behind Suspense. See{" "}
              <code>app/account/page.tsx</code>.
            </td>
          </tr>
          <tr>
            <td>A Server Action</td>
            <td>
              <code>requireUser()</code> inside the action, every time. The page check does not carry over.
            </td>
          </tr>
          <tr>
            <td>An API route</td>
            <td>
              <code>getSessionUser()</code> and return 401 when null. See <code>app/api/me/route.ts</code>.
            </td>
          </tr>
          <tr>
            <td>A whole section</td>
            <td>
              Optional: a <code>proxy.ts</code> that redirects when the session cookie is missing. A quick check only;
              the real one stays in the page.
            </td>
          </tr>
        </tbody>
      </table>

      <Callout kind="tip" title="Testing sign-in without sending email">
        <p>
          Use any address ending in <code>@example.com</code> on the login page. <code>lib/mail/send.ts</code> prints the
          magic link in the terminal instead of sending it. Copy it into the browser and you are signed in as that user.
          Real addresses receive a real email through SMTP.
        </p>
      </Callout>

      <h2>Your first try</h2>
      <p>Sign in without an inbox:</p>
      <ol>
        <li>
          Press <strong>Sign in</strong> at the top of this page.
        </li>
        <li>
          Type <code>you@example.com</code> and press <em>Email me a sign-in link</em>.
        </li>
        <li>
          Look at the terminal where <code>npm run dev</code> is running. Find the line that starts with{" "}
          <code>http://localhost:3000/api/auth/callback/nodemailer</code> and paste it into the browser.
        </li>
        <li>
          You land on <code>/account</code>. Come back to this lesson: the demo at the top now knows your name.
        </li>
      </ol>
      <p>
        <strong>If you want more:</strong> sign in with Google instead, then open <code>npm run db:studio</code> and find
        the <code>accounts</code> row that links your Google id to your user. Delete your <code>sessions</code> row and
        reload: you are signed out.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>
          Auth.js is configured once in <code>lib/auth.ts</code>; the Drizzle adapter stores everything in your tables.
        </li>
        <li>Database sessions: a random cookie token, user data on the server, revocable.</li>
        <li>
          Sign in and out are Server Actions calling <code>signIn</code> / <code>signOut</code>.
        </li>
        <li>
          Read the session with <code>getSessionUser</code> / <code>requireUser</code>, inside Suspense, and re-check it
          inside every action and API route.
        </li>
      </ul>
    </LessonPage>
  );
}
