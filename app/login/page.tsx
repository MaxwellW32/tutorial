import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { signInWithEmail, signInWithGoogle } from "@/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { safePath } from "@/lib/safe-path";
import { getSessionUser } from "@/lib/session";

export const metadata: Metadata = { title: "Sign in" };

// Auth.js reports problems as ?error=<code>. Turn the codes into sentences a person can act on.
const ERRORS: Record<string, string> = {
  OAuthAccountNotLinked: "That email already signs in another way. Use the email link instead.",
  AccessDenied: "Sign-in wasn't allowed for that account.",
  Verification: "That sign-in link has expired or was already used. Request a new one.",
  Configuration: "Sign-in isn't configured correctly. Check the AUTH_* variables in .env.local.",
  EmailSignInError: "We couldn't send the sign-in email. Check the address and try again.",
  EmailInvalid: "Enter a valid email address.",
};

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.5l6.7-6.7C35.6 2.6 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.8 6C12.3 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17.5z" />
      <path fill="#FBBC05" d="M10.4 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.8-6C.9 16.5 0 20.1 0 24s.9 7.5 2.6 10.7l7.8-6z" />
      <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15.1-5.5l-7.5-5.8c-2 1.4-4.6 2.3-7.6 2.3-6.3 0-11.7-4.1-13.6-9.8l-7.8 6C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

/**
 * The part of the page that depends on the request (search params + session).
 * It lives in its own component so it can stream in behind <Suspense> while the rest is static.
 */
async function LoginForms({ searchParams }: Pick<PageProps<"/login">, "searchParams">) {
  const query = await searchParams;
  const redirectTo = safePath(query.callbackUrl, "/account");

  // Already signed in? No need to see this page.
  if ((await getSessionUser()) !== null) redirect(redirectTo);

  const code = typeof query.error === "string" ? query.error : null;
  const error = code === null ? null : (ERRORS[code] ?? "Couldn't sign you in. Please try again.");

  return (
    <div className="grid gap-5">
      {error ? (
        <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      {/* A <form> whose action is a Server Action. No fetch(), no API route, no JSON. */}
      <form action={signInWithGoogle}>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <SubmitButton className="btn btn-outline w-full" pendingLabel="Opening Google…">
          <GoogleMark />
          Continue with Google
        </SubmitButton>
      </form>

      <div className="flex items-center gap-3 text-xs text-zinc-500">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        or
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <form action={signInWithEmail} className="grid gap-3">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <label className="grid gap-1.5 text-sm font-medium">
          Email
          <input className="field" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </label>
        <SubmitButton className="btn w-full" pendingLabel="Sending link…">
          Email me a sign-in link
        </SubmitButton>
      </form>

      <p className="text-xs leading-relaxed text-zinc-500">
        Developing locally? Any <code className="font-mono">@example.com</code> address prints the link in the dev server
        terminal instead of sending an email.
      </p>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="grid gap-5" aria-hidden>
      <div className="h-10 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-16 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-10 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}

export default function LoginPage(props: PageProps<"/login">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight no-underline">
          Next.js Tutorial
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-8 pb-16 sm:pt-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">Sign in</h1>
            <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">No password needed. New here? Signing in creates your account.</p>
          </div>
          <Suspense fallback={<LoginSkeleton />}>
            <LoginForms searchParams={props.searchParams} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
