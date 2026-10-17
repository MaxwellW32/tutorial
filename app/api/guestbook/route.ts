import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { addGuestbookEntry, GUESTBOOK_TAG, listGuestbookEntries } from "@/lib/dal/guestbook";

// A Route Handler: a plain HTTP endpoint at /api/guestbook.
// Export a function named after the HTTP method you want to handle.

/** GET /api/guestbook → { entries: [...] } */
export async function GET() {
  const entries = await listGuestbookEntries();
  return NextResponse.json({ entries });
}

const schema = z.object({
  name: z.string().trim().min(1).max(40),
  message: z.string().trim().min(1).max(280),
});

/** POST /api/guestbook with a JSON body { name, message } → 201 { entry } */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", fields: z.flattenError(parsed.error).fieldErrors }, { status: 400 });
  }

  const entry = await addGuestbookEntry(parsed.data);

  // updateTag() is for Server Actions only. In a Route Handler, revalidateTag() marks the cached
  // list stale so the next visitor to the lesson page gets fresh data.
  revalidateTag(GUESTBOOK_TAG, "max");

  return NextResponse.json({ entry }, { status: 201 });
}
