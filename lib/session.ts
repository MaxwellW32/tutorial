import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { auth } from "@/lib/auth";

export type SessionUser = { id: string; name: string | null; email: string; image: string | null };

/**
 * The signed-in user, or null.
 *
 * Wrapped in React `cache` so that when several components on one page ask for the user,
 * the session is only looked up once per request.
 *
 * Reading the session means reading the request's cookies, so a component that calls this
 * has to sit inside a <Suspense> boundary (Lesson 7 explains why).
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  // Tell Next.js up front that this is per-request work. auth() generates random tokens before it
  // reads the cookie, and a random value during prerendering is otherwise reported as a mistake.
  await connection();
  const session = await auth();
  return session?.user ?? null;
});

/** Like getSessionUser, but sends signed-out visitors to /login instead of returning null. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (user === null) redirect("/login");
  return user;
}
