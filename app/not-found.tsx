import Link from "next/link";

// Shown for any URL that does not match a route (and whenever code calls notFound()).
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-mono text-sm text-zinc-500">404</p>
      <h1 className="text-2xl font-semibold">That page does not exist</h1>
      <Link href="/" className="btn btn-outline no-underline">
        Back to the overview
      </Link>
    </div>
  );
}
