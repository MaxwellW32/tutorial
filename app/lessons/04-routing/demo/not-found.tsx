import Link from "next/link";

/** Rendered (with a 404 status) when a page under /lessons/04-routing/demo calls notFound(). */
export default function PlanetNotFound() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
      <p className="font-semibold">No such planet</p>
      <p className="mt-1">
        This is <code className="font-mono">app/lessons/04-routing/demo/not-found.tsx</code>. The page called{" "}
        <code className="font-mono">notFound()</code> because the slug did not match any planet.
      </p>
      <Link href="/lessons/04-routing/demo" className="mt-3 inline-block">
        Back to the list
      </Link>
    </div>
  );
}
