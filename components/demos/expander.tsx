"use client";

import { useState, type ReactNode } from "react";

/**
 * A Client Component that receives Server Component output as `children`.
 * It can show or hide that content, but it never sees how it was made.
 */
export function Expander({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-2 text-sm font-medium">
        {label}
        <span aria-hidden>{open ? "▲" : "▼"}</span>
      </button>
      {open ? <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">{children}</div> : null}
    </div>
  );
}
