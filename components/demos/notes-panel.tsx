import Link from "next/link";
import { deleteNoteAction } from "@/actions/notes";
import { NotesForm } from "@/components/demos/notes-form";
import { SessionStatus } from "@/components/demos/session-status";
import { listNotes } from "@/lib/dal/notes";
import { getSessionUser } from "@/lib/session";

/**
 * The whole notes feature on one screen: the list, a delete button per note, and the form.
 * It reads the session and the user's notes (per-user data, never cached), so it lives inside Suspense.
 */
export async function NotesPanel() {
  const user = await getSessionUser();
  if (user === null) return <SessionStatus />;

  const notes = await listNotes(user.id);

  return (
    <SessionStatus>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">New note</p>
          <NotesForm />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Your notes ({notes.length})</p>
          {notes.length === 0 ? (
            <p className="text-sm text-zinc-500">No notes yet. Only you can see what you add here.</p>
          ) : (
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {notes.map((note) => (
                <li key={note.id} className="flex items-start justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <Link href={`/lessons/13-putting-it-together/notes/${note.id}`} className="font-medium">
                      {note.title}
                    </Link>
                    <p className="truncate text-xs text-zinc-500">{note.body || "(no body)"}</p>
                  </div>
                  {/* A tiny form per row: the hidden input tells the action which note to delete. */}
                  <form action={deleteNoteAction}>
                    <input type="hidden" name="id" value={note.id} />
                    <button type="submit" className="text-xs text-zinc-500 hover:text-red-600">
                      delete
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </SessionStatus>
  );
}
