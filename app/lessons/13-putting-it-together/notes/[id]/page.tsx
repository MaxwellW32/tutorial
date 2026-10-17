import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteNoteAction } from "@/actions/notes";
import { SubmitButton } from "@/components/submit-button";
import { getNote } from "@/lib/dal/notes";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Note" };

type Props = PageProps<"/lessons/13-putting-it-together/notes/[id]">;

/** Everything that needs the session or the database, behind Suspense. */
async function NoteDetail({ params }: Pick<Props, "params">) {
  const user = await requireUser(); // signed out → /login
  const { id } = await params;
  const note = await getNote(user.id, id);
  if (note === null) notFound(); // not yours, or does not exist → not-found.tsx next to this file

  return (
    <article className="rounded-xl border border-zinc-200 p-6 dark:border-zinc-800">
      <p className="font-mono text-xs text-zinc-500">note {note.id}</p>
      <h1 className="mt-1 text-2xl font-semibold">{note.title}</h1>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{note.body || <span className="text-zinc-400">(no body)</span>}</p>
      <p className="mt-4 text-xs text-zinc-500">Created {note.createdAt.toLocaleString("en-GB")}</p>

      <form action={deleteNoteAction} className="mt-6">
        <input type="hidden" name="id" value={note.id} />
        <input type="hidden" name="redirectTo" value="/lessons/13-putting-it-together" />
        <SubmitButton className="btn btn-outline" pendingLabel="Deleting…">
          Delete this note
        </SubmitButton>
      </form>
    </article>
  );
}

export default function NotePage({ params }: Props) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <Link href="/lessons/13-putting-it-together" className="text-sm text-zinc-500">
        ← Back to lesson 13
      </Link>
      <div className="mt-4">
        <Suspense fallback={<div className="h-48 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900" />}>
          <NoteDetail params={params} />
        </Suspense>
      </div>
    </div>
  );
}
