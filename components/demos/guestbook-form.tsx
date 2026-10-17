"use client";

import { useActionState } from "react";
import { postToGuestbook } from "@/actions/guestbook";

/**
 * useActionState(action, initialState) gives back:
 *   state      → whatever the action returned last time (null before the first submit)
 *   formAction → what you pass to <form action>
 *   pending    → true while the action is running
 */
export function GuestbookForm() {
  const [state, formAction, pending] = useActionState(postToGuestbook, null);
  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="grid gap-3">
      <label className="grid gap-1.5 text-sm font-medium">
        Name
        <input className="field" name="name" maxLength={40} required />
        {fieldErrors?.name ? <span className="text-xs font-normal text-red-600">{fieldErrors.name[0]}</span> : null}
      </label>

      <label className="grid gap-1.5 text-sm font-medium">
        Message
        <textarea className="field" name="message" rows={2} maxLength={280} required />
        {fieldErrors?.message ? <span className="text-xs font-normal text-red-600">{fieldErrors.message[0]}</span> : null}
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Posting…" : "Post"}
        </button>
        {state?.ok === true ? <span className="text-sm text-emerald-700 dark:text-emerald-400">{state.message}</span> : null}
        {state?.ok === false ? <span className="text-sm text-red-600">{state.error}</span> : null}
      </div>
    </form>
  );
}
