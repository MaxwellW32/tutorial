import Link from "next/link";
import type { ReactNode } from "react";
import { getSessionUser } from "@/lib/session";

/**
 * Shows who is signed in, or an invitation to sign in. Reads the session, so render it inside <Suspense>.
 * When `children` is given, it is only shown to signed-in users (useful for demos that need an account).
 */
export async function SessionStatus({ children }: { children?: ReactNode }) {
  const user = await getSessionUser();

  if (user === null) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span>You are not signed in.</span>
        <Link href="/login" className="btn no-underline">
          Sign in to try this
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm">
        Signed in as <strong>{user.name ?? user.email}</strong>{" "}
        <span className="text-zinc-500">
          (id <span className="font-mono text-xs">{user.id.slice(0, 8)}…</span>)
        </span>
        {" · "}
        <Link href="/account">account</Link>
      </p>
      {children}
    </div>
  );
}

export function SessionStatusSkeleton() {
  return <div className="h-9 w-64 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" aria-hidden />;
}
