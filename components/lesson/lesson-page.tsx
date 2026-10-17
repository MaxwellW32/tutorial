import Link from "next/link";
import type { ReactNode } from "react";
import { lessonHref, lessons } from "@/lib/lessons";

/** The frame around every lesson: number, title, summary, the content, and prev/next links. */
export function LessonPage({ slug, children }: { slug: string; children: ReactNode }) {
  const index = lessons.findIndex((lesson) => lesson.slug === slug);
  if (index === -1) throw new Error(`Unknown lesson: ${slug}`);
  const lesson = lessons[index];
  const prev = index > 0 ? lessons[index - 1] : null;
  const next = index < lessons.length - 1 ? lessons[index + 1] : null;

  return (
    <article className="lesson mx-auto w-full max-w-3xl">
      <header className="mb-8 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
          Lesson {index + 1} of {lessons.length}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">{lesson.summary}</p>
      </header>

      {children}

      <footer className="mt-14 grid gap-3 border-t border-zinc-200 pt-6 sm:grid-cols-2 dark:border-zinc-800">
        {prev ? (
          <Link href={lessonHref(prev.slug)} className="rounded-lg border border-zinc-200 p-4 no-underline hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <span className="block text-xs text-zinc-500">← Previous</span>
            <span className="mt-1 block font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={lessonHref(next.slug)} className="rounded-lg border border-zinc-200 p-4 text-right no-underline hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <span className="block text-xs text-zinc-500">Next →</span>
            <span className="mt-1 block font-medium">{next.title}</span>
          </Link>
        ) : (
          <Link href="/" className="rounded-lg border border-zinc-200 p-4 text-right no-underline hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <span className="block text-xs text-zinc-500">Done!</span>
            <span className="mt-1 block font-medium">Back to the overview</span>
          </Link>
        )}
      </footer>
    </article>
  );
}
