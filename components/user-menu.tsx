import Link from "next/link";
import { signOutAction } from "@/actions/auth";
import { getSessionUser } from "@/lib/session";

/**
 * "Sign in" or "<name> · Sign out" in the header.
 *
 * It reads the session (cookies), so it must be rendered inside <Suspense>. The layout does that,
 * with <UserMenuSkeleton /> as the placeholder while the session streams in.
 */
export async function UserMenu() {
  const user = await getSessionUser();

  if (user === null) {
    return (
      <Link
        href="/login"
        className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium no-underline hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link href="/account" className="max-w-40 truncate font-medium no-underline hover:underline">
        {user.name ?? user.email}
      </Link>
      <form action={signOutAction}>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

export function UserMenuSkeleton() {
  return <span className="inline-block h-8 w-20 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" aria-hidden />;
}
