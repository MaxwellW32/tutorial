import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

/**
 * GET /api/me → the signed-in user, or 401.
 *
 * The browser sends the session cookie with every same-site fetch(), so the exact same
 * getSessionUser() used by pages works here too.
 */
export async function GET() {
  const user = await getSessionUser();
  if (user === null) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json({ user });
}
