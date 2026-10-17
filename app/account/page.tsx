import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { signOutAction } from "@/actions/auth";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Your account" };

/** Everything that needs the session goes in here, behind <Suspense>. */
async function AccountDetails() {
  // Signed-out visitors never get past this line: requireUser() redirects them to /login.
  const user = await requireUser();

  return (
    <div className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <div className="flex items-center gap-4">
        {user.image ? (
          <Image src={user.image} alt="" width={56} height={56} className="size-14 rounded-full" />
        ) : (
          <div className="grid size-14 place-items-center rounded-full bg-zinc-200 text-xl font-semibold dark:bg-zinc-800">
            {(user.name ?? user.email).slice(0, 1).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{user.name ?? "No name yet"}</p>
          <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">{user.email}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-2 text-sm">
        <div className="flex justify-between gap-4 border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <dt className="text-zinc-500">User id</dt>
          <dd className="truncate font-mono text-xs">{user.id}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <dt className="text-zinc-500">Stored in</dt>
          <dd className="font-mono text-xs">users / sessions tables</dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-wrap gap-3">
        <form action={signOutAction}>
          <button type="submit" className="btn btn-outline">
            Sign out
          </button>
        </form>
        <Link href="/lessons/13-putting-it-together" className="btn no-underline">
          Try your private notes →
        </Link>
      </div>
    </div>
  );
}

function AccountSkeleton() {
  return <div className="h-56 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" aria-hidden />;
}

export default function AccountPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex h-14 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight no-underline">
          Next.js Tutorial
        </Link>
        <Link href="/lessons/10-auth" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          Back to lesson 10
        </Link>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6">
        <h1 className="mb-6 text-2xl font-semibold">Your account</h1>
        <Suspense fallback={<AccountSkeleton />}>
          <AccountDetails />
        </Suspense>
      </main>
    </div>
  );
}
