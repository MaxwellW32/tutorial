import type { ReactNode } from "react";

/** A framed, interactive example. Everything inside is real, running code from this project. */
export function Demo({ title, source, children }: { title?: string; source?: string; children: ReactNode }) {
  return (
    <section className="my-5 overflow-hidden rounded-lg border-2 border-dashed border-violet-300 dark:border-violet-800">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-violet-200 bg-violet-50 px-4 py-2 text-xs dark:border-violet-900 dark:bg-violet-950/40">
        <span className="font-semibold tracking-wide text-violet-700 uppercase dark:text-violet-300">
          Live demo{title ? ` · ${title}` : ""}
        </span>
        {source ? <span className="font-mono text-violet-600/80 dark:text-violet-300/80">{source}</span> : null}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
