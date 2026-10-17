import { highlight, type CodeLanguage } from "@/lib/highlight";

type Props = {
  /** The sample. A leading newline and trailing whitespace are trimmed, so template literals read nicely. */
  code: string;
  lang?: CodeLanguage;
  /** Shown above the code, e.g. "app/page.tsx". */
  filename?: string;
};

/** A highlighted code sample. This is a Server Component: the highlighter never reaches the browser. */
export async function CodeBlock({ code, lang = "tsx", filename }: Props) {
  const html = await highlight(code.replace(/^\n/, "").trimEnd(), lang);

  return (
    <figure className="my-4 overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      {filename ? (
        <figcaption className="border-b border-zinc-200 bg-zinc-50 px-4 py-1.5 font-mono text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          {filename}
        </figcaption>
      ) : null}
      <div className="code-sample overflow-x-auto" dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
