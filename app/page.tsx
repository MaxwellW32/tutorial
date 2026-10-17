import Link from "next/link";
import { lessonHref, lessons } from "@/lib/lessons";

// The home page. It reads no request data and nothing changes between visitors,
// so Next.js prerenders it into static HTML at build time.
export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
      <header className="max-w-2xl">
        <p className="text-sm font-medium text-violet-600 dark:text-violet-400">Next.js 16 · React 19 · TypeScript</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Everything you need to know, in one place.</h1>
        <p className="mt-5 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          A hands-on tour for someone who knows HTML, CSS and JavaScript. Fifteen short lessons, each with real code from
          this project and live demos you can click. By the end you will have built sign-in with Google and magic links, a
          Postgres database, forms, an API and email.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={lessonHref(lessons[0].slug)} className="btn no-underline">
            Start with lesson 1 →
          </Link>
          <Link href="/login" className="btn btn-outline no-underline">
            Try the sign-in flow
          </Link>
        </div>
      </header>

      <section className="mt-16">
        <h2 className="text-sm font-semibold tracking-wide text-zinc-500 uppercase">Lessons</h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2">
          {lessons.map((lesson, index) => (
            <li key={lesson.slug}>
              <Link
                href={lessonHref(lesson.slug)}
                className="flex h-full gap-4 rounded-xl border border-zinc-200 p-4 no-underline transition-colors hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
              >
                <span className="font-mono text-sm text-zinc-400 tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <span className="block font-medium">{lesson.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{lesson.summary}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 grid gap-6 rounded-xl border border-zinc-200 p-6 sm:grid-cols-3 dark:border-zinc-800">
        <div>
          <h3 className="font-medium">How to use it</h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Read a lesson, then open the files it names in your editor. Every sample is the real code that powers the demo next
            to it.
          </p>
        </div>
        <div>
          <h3 className="font-medium">Before you start</h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            You should be comfortable with HTML, CSS and JavaScript basics: variables, functions, arrays, objects and
            promises. No React or TypeScript needed.
          </p>
        </div>
        <div>
          <h3 className="font-medium">Break things</h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Change a sample, save, and watch the page update. Each lesson ends with small exercises. The dev server tells you
            when something is wrong.
          </p>
        </div>
      </section>
    </div>
  );
}
