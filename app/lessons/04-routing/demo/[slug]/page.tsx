import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlanet, planets } from "@/lib/planets";

type Props = PageProps<"/lessons/04-routing/demo/[slug]">;

/** Which slugs exist. Next.js prerenders each of these pages at build time. */
export function generateStaticParams() {
  return planets.map((planet) => ({ slug: planet.slug }));
}

/** Per-page <title>, computed from the same params. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: getPlanet(slug)?.name ?? "Planet not found" };
}

export default async function PlanetPage({ params }: Props) {
  const { slug } = await params; // params is a Promise in this version of Next.js
  const planet = getPlanet(slug);
  if (!planet) notFound(); // → the nearest not-found.tsx, with a 404 status code

  const neighbours = planets.filter((other) => Math.abs(other.order - planet.order) === 1);

  return (
    <article>
      <p className="font-mono text-xs text-zinc-500">params.slug = &quot;{slug}&quot;</p>
      <h1 className="mt-1 text-2xl font-semibold">{planet.name}</h1>
      <p className="mt-2">{planet.fact}</p>
      <p className="mt-4 text-sm text-zinc-500">
        Neighbours:{" "}
        {neighbours.map((other, index) => (
          <span key={other.slug}>
            {index > 0 ? ", " : ""}
            <Link href={`/lessons/04-routing/demo/${other.slug}`}>{other.name}</Link>
          </span>
        ))}
      </p>
    </article>
  );
}
