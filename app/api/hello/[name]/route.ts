import { NextResponse, type NextRequest } from "next/server";

/**
 * GET /api/hello/<name>?shout=1
 *
 * Dynamic segments work in Route Handlers exactly like in pages: the folder is [name],
 * and `RouteContext<"/api/hello/[name]">` types the params for you.
 */
export async function GET(request: NextRequest, context: RouteContext<"/api/hello/[name]">) {
  const { name } = await context.params;
  const shout = request.nextUrl.searchParams.get("shout") === "1";

  const greeting = `Hello, ${name}!`;
  return NextResponse.json({ greeting: shout ? greeting.toUpperCase() : greeting });
}
