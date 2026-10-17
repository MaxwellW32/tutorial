import Link from "next/link";
import { lessonHref, lessons } from "@/lib/lessons";

/** The numbered list of lessons. No hooks, no state: it works as a Server Component and as a Suspense fallback. */
export function LessonList({ activeSlug = null }: { activeSlug?: string | null }) {
  return (
    <ol className="space-y-0.5 text-sm">
      {lessons.map((lesson, index) => {
        const active = lesson.slug === activeSlug;
        return (
          <li key={lesson.slug}>
            <Link
              href={lessonHref(lesson.slug)}
              aria-current={active ? "page" : undefined}
              className={`flex gap-2 rounded-md px-2 py-1.5 leading-snug no-underline transition-colors ${
                active
                  ? "bg-zinc-900 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              <span className="w-5 shrink-0 tabular-nums opacity-60">{index + 1}.</span>
              <span>{lesson.title}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
