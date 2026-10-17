import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { planets } from "@/lib/planets";

export const metadata: Metadata = { title: "Planets" };

/** The list page. The heading is static; the sorted list depends on ?sort= so it streams in. */
export default function PlanetsPage({ searchParams }: PageProps<"/lessons/04-routing/demo">) {
  return (
    <>
      <h1 className="text-2xl font-semibold">Planets</h1>
      <p className="mt-1 mb-4 text-sm text-zinc-500">
        Sort:{" "}
        <Link href="/lessons/04-routing/demo" className="mr-2">
          nearest first
        </Link>
        <Link href="/lessons/04-routing/demo?sort=desc">farthest first</Link>
      </p>
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading planets…</p>}>
        <PlanetList searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function PlanetList({ searchParams }: Pick<PageProps<"/lessons/04-routing/demo">, "searchParams">) {
  const { sort } = await searchParams;
  const sorted = [...planets].sort((a, b) => (sort === "desc" ? b.order - a.order : a.order - b.order));

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {sorted.map((planet) => (
        <li key={planet.slug} className="flex items-center justify-between py-2">
          <Link href={`/lessons/04-routing/demo/${planet.slug}`} className="font-medium">
            {planet.name}
          </Link>
          <span className="font-mono text-xs text-zinc-500">#{planet.order}</span>
        </li>
      ))}
    </ul>
  );
}
