import Link from "next/link";
import { Suspense } from "react";
import { LessonList } from "@/components/lesson/lesson-list";
import { LessonNav } from "@/components/lesson/lesson-nav";
import { UserMenu, UserMenuSkeleton } from "@/components/user-menu";

/**
 * Wraps every /lessons/* page: a header, the lesson list on the left, the lesson on the right.
 * Layouts keep their state across navigations, so the sidebar does not re-render when you
 * move from one lesson to the next.
 */
export default function LessonsLayout({ children }: LayoutProps<"/lessons">) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-black/80">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-semibold tracking-tight no-underline">
            Next.js Tutorial
          </Link>
          {/* The session is request-time data, so it streams in behind this boundary (lesson 7). */}
          <Suspense fallback={<UserMenuSkeleton />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-4 py-6 sm:px-6">
        <aside className="sticky top-20 hidden h-[calc(100dvh-6rem)] w-64 shrink-0 overflow-y-auto md:block">
          <p className="mb-2 px-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Lessons</p>
          {/* The highlighted item depends on the URL, so the plain list is the fallback while it resolves. */}
          <Suspense fallback={<LessonList />}>
            <LessonNav />
          </Suspense>
        </aside>

        <main className="min-w-0 flex-1">
          <details className="mb-6 rounded-lg border border-zinc-200 md:hidden dark:border-zinc-800">
            <summary className="cursor-pointer px-3 py-2 text-sm font-medium">All lessons</summary>
            <div className="border-t border-zinc-200 p-2 dark:border-zinc-800">
              <Suspense fallback={<LessonList />}>
                <LessonNav />
              </Suspense>
            </div>
          </details>
          {children}
        </main>
      </div>
    </div>
  );
}
