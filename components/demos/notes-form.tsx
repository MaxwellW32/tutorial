"use client";

import { useActionState } from "react";
import { createNoteAction } from "@/actions/notes";

export function NotesForm() {
  const [state, formAction, pending] = useActionState(createNoteAction, null);
  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="grid gap-3">
      <label className="grid gap-1.5 text-sm font-medium">
        Title
        <input className="field" name="title" maxLength={80} required />
        {fieldErrors?.title ? <span className="text-xs font-normal text-red-600">{fieldErrors.title[0]}</span> : null}
      </label>
      <label className="grid gap-1.5 text-sm font-medium">
        Body <span className="font-normal text-zinc-500">(optional)</span>
        <textarea className="field" name="body" rows={3} maxLength={2000} />
      </label>
      <div className="flex items-center gap-3">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Saving…" : "Save note"}
        </button>
        {state?.ok === true ? <span className="text-sm text-emerald-700 dark:text-emerald-400">{state.message}</span> : null}
        {state?.ok === false ? <span className="text-sm text-red-600">{state.error}</span> : null}
      </div>
    </form>
  );
}
