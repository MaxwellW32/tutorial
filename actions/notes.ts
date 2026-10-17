"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { invalid, ok, type ActionState } from "@/lib/action-result";
import { createNote, deleteNote } from "@/lib/dal/notes";
import { safePath } from "@/lib/safe-path";
import { requireUser } from "@/lib/session";

const noteSchema = z.object({
  title: z.string().trim().min(1, "Give the note a title").max(80, "80 characters max"),
  body: z.string().trim().max(2000, "2000 characters max"),
});

export async function createNoteAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  // 1. Who is asking? (redirects to /login if nobody is signed in)
  const user = await requireUser();

  // 2. Is the input valid?
  const parsed = noteSchema.safeParse({ title: formData.get("title"), body: formData.get("body") });
  if (!parsed.success) return invalid(parsed.error);

  // 3. Do the work, scoped to this user.
  await createNote(user.id, parsed.data);

  // 4. The notes list is not cached (it is per-user), so just re-render the current page.
  refresh();
  return ok("Note saved.");
}

export async function deleteNoteAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const redirectTo = formData.get("redirectTo");

  // deleteNote() includes the userId in the WHERE clause: you cannot delete someone else's note
  // by guessing its id.
  await deleteNote(user.id, id);

  if (typeof redirectTo === "string") redirect(safePath(redirectTo, "/"));
  refresh();
}
