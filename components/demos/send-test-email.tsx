"use client";

import { useActionState } from "react";
import { sendTestEmailAction } from "@/actions/email";

export function SendTestEmail({ email }: { email: string }) {
  // The action takes no form data, so the wrapper just ignores the (state, formData) arguments.
  const [state, formAction, pending] = useActionState(() => sendTestEmailAction(), null);

  return (
    <form action={formAction} className="grid gap-3">
      <p className="text-sm">
        Sends one test email to <strong>{email}</strong> (the address on your session, not something you type in).
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn" disabled={pending}>
          {pending ? "Sending…" : "Send me a test email"}
        </button>
        {state?.ok === true ? <span className="text-sm text-emerald-700 dark:text-emerald-400">{state.message}</span> : null}
        {state?.ok === false ? <span className="text-sm text-red-600">{state.error}</span> : null}
      </div>
    </form>
  );
}
