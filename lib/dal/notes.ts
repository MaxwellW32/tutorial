import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes, type Note } from "@/db/schema";

// Every function takes the userId FIRST and puts it in the WHERE clause.
// That is the authorization: a user can only ever see or change their own rows,
// no matter what id the browser sends.

export async function listNotes(userId: string): Promise<Note[]> {
  return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt));
}

/** A single note, or null when it does not exist OR belongs to someone else (same answer on purpose). */
export async function getNote(userId: string, id: string): Promise<Note | null> {
  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)));
  return note ?? null;
}

export async function createNote(userId: string, input: { title: string; body: string }): Promise<Note> {
  const [note] = await db
    .insert(notes)
    .values({ userId, ...input })
    .returning();
  return note;
}

/** Returns true when a row was deleted, false when there was nothing of yours to delete. */
export async function deleteNote(userId: string, id: string): Promise<boolean> {
  const deleted = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning({ id: notes.id });
  return deleted.length > 0;
}
