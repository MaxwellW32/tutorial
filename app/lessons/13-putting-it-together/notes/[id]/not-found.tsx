import Link from "next/link";

/** Shown when getNote() returns null: the note does not exist, or it belongs to another user. */
export default function NoteNotFound() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
        <p className="font-semibold">No such note</p>
        <p className="mt-1">
          Either it never existed or it belongs to someone else. The page cannot tell, and neither can a visitor: that is
          on purpose.
        </p>
        <Link href="/lessons/13-putting-it-together" className="mt-3 inline-block">
          Back to your notes
        </Link>
      </div>
    </div>
  );
}
