"use client";

import { usePathname } from "next/navigation";
import { LessonList } from "@/components/lesson/lesson-list";

/**
 * The sidebar list with the current lesson highlighted.
 *
 * `usePathname()` is URL data, which is only known at request time, so the layout renders this
 * inside <Suspense> with the plain <LessonList /> as the fallback. On a static lesson page the
 * pathname is known at build time; on a dynamic one (a note's page) it streams in.
 */
export function LessonNav() {
  const pathname = usePathname();
  const active = pathname.split("/")[2] ?? null; // "/lessons/03-react/..." → "03-react"
  return <LessonList activeSlug={active} />;
}
