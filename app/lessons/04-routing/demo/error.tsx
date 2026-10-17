"use client"; // error boundaries must be Client Components

/**
 * Catches any error thrown while rendering a page in this folder (or below) and shows this instead.
 * `retry()` tries to render the page again.
 */
export default function PlanetsDemoError({ error, retry }: { error: unknown; retry: () => void }) {
  const message = error instanceof Error ? error.message : "Something went wrong";

  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm dark:border-red-900 dark:bg-red-950/40">
      <p className="font-semibold">The page crashed, but the layout and sidebar did not</p>
      <p className="mt-1">
        This is <code className="font-mono">app/lessons/04-routing/demo/error.tsx</code>. The error message was:{" "}
        <code className="font-mono">{message}</code>
      </p>
      <button type="button" onClick={() => retry()} className="btn btn-outline mt-3">
        Try again
      </button>
    </div>
  );
}
