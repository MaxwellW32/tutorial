import type { ReactNode } from "react";

const styles = {
  note: "border-sky-300 bg-sky-50 text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100",
  tip: "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100",
  warning: "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100",
} as const;

const labels = { note: "Note", tip: "Tip", warning: "Careful" } as const;

export function Callout({ kind = "note", title, children }: { kind?: keyof typeof styles; title?: string; children: ReactNode }) {
  return (
    <aside className={`my-4 rounded-lg border px-4 py-3 text-sm leading-relaxed ${styles[kind]}`}>
      <p className="m-0 text-xs font-semibold tracking-wide uppercase opacity-70">{title ?? labels[kind]}</p>
      <div className="[&>p]:my-1.5 [&>ul]:my-1.5">{children}</div>
    </aside>
  );
}
