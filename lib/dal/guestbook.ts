import "server-only";
import { desc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/db";
import { guestbook, type GuestbookEntry } from "@/db/schema";

// "DAL" = Data Access Layer: every database query for a feature lives in one server-only file.
// Pages, actions and API routes call these functions instead of writing SQL themselves.

export const GUESTBOOK_TAG = "guestbook";

/** The newest 20 entries, straight from the database. */
export async function listGuestbookEntries(): Promise<GuestbookEntry[]> {
  return db.select().from(guestbook).orderBy(desc(guestbook.createdAt)).limit(20);
}

/**
 * The same data, cached. The result becomes part of the prerendered page and stays there
 * until `updateTag(GUESTBOOK_TAG)` is called (or an hour passes, whichever comes first).
 */
export async function getCachedGuestbook(): Promise<GuestbookEntry[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(GUESTBOOK_TAG);
  return listGuestbookEntries();
}

export async function addGuestbookEntry(input: { name: string; message: string }): Promise<GuestbookEntry> {
  const [entry] = await db.insert(guestbook).values(input).returning();
  return entry;
}
