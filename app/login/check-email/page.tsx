import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Check your email" };

// A completely static page: no data, no request APIs, so it is prerendered at build time.
export default function CheckEmailPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight no-underline">
          Next.js Tutorial
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pt-8 pb-16 sm:pt-16">
        <div className="w-full max-w-sm">
          <div className="mb-5 grid size-11 place-items-center rounded-full bg-zinc-100 text-xl dark:bg-zinc-900">✉️</div>
          <h1 className="text-2xl font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            We sent you a sign-in link. It works once and expires in 24 hours. You can close this tab.
          </p>
          {process.env.NODE_ENV !== "production" ? (
            <p className="mt-4 rounded-md bg-zinc-100 px-3 py-2.5 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              Developing locally: if you used an <code className="font-mono">@example.com</code> address, the link is printed in
              the terminal running <code className="font-mono">npm run dev</code>.
            </p>
          ) : null}
          <Link href="/login" className="btn btn-outline mt-8 no-underline">
            Use a different email
          </Link>
        </div>
      </main>
    </div>
  );
}
