import Link from "next/link";

/**
 * A nested layout: wraps /lessons/04-routing/demo and everything below it, inside the lessons layout,
 * inside the root layout. Only `children` changes when you navigate between the demo pages.
 */
export default function PlanetsDemoLayout({ children }: LayoutProps<"/lessons/04-routing/demo">) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <nav className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-zinc-200 pb-3 text-sm dark:border-zinc-800">
        <Link href="/lessons/04-routing" className="text-zinc-500 no-underline hover:underline">
          ← Lesson 4
        </Link>
        <span className="text-zinc-300 dark:text-zinc-700">|</span>
        <Link href="/lessons/04-routing/demo">All planets</Link>
        <Link href="/lessons/04-routing/demo/earth">Earth</Link>
        <Link href="/lessons/04-routing/demo/mars">Mars</Link>
        <Link href="/lessons/04-routing/demo/pluto">Pluto (404)</Link>
        <Link href="/lessons/04-routing/demo/boom">Boom (error)</Link>
      </nav>
      {children}
    </div>
  );
}
