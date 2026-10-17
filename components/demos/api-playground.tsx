"use client";

import { useState } from "react";

type Result = { status: number; body: unknown } | { error: string } | null;

/**
 * Calls our own API routes from the browser with fetch(). This is how a mobile app, a script,
 * or a JavaScript-heavy page would talk to the server when a <form action> is not the right fit.
 */
export function ApiPlayground() {
  const [result, setResult] = useState<Result>(null);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("world");

  async function call(input: string, init?: RequestInit) {
    setBusy(true);
    try {
      const response = await fetch(input, init);
      const body: unknown = await response.json();
      setResult({ status: response.status, body });
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-outline" disabled={busy} onClick={() => call("/api/guestbook")}>
          GET /api/guestbook
        </button>
        <button type="button" className="btn btn-outline" disabled={busy} onClick={() => call("/api/me")}>
          GET /api/me
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={busy}
          onClick={() =>
            call("/api/guestbook", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name: "API playground", message: `Posted with fetch() at ${new Date().toLocaleTimeString()}` }),
            })
          }
        >
          POST /api/guestbook
        </button>
        <button
          type="button"
          className="btn btn-outline"
          disabled={busy}
          onClick={() => call("/api/guestbook", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: "" }) })}
        >
          POST (invalid body)
        </button>
      </div>

      <div className="flex gap-2">
        <input className="field max-w-48" value={name} onChange={(event) => setName(event.target.value)} aria-label="Name for /api/hello" />
        <button type="button" className="btn btn-outline" disabled={busy} onClick={() => call(`/api/hello/${encodeURIComponent(name)}?shout=1`)}>
          GET /api/hello/{name || "…"}?shout=1
        </button>
      </div>

      <pre className="min-h-24 overflow-x-auto rounded-md bg-zinc-100 p-3 font-mono text-xs dark:bg-zinc-900">
        {result === null
          ? "Click a button. The response appears here."
          : "error" in result
            ? `Network error: ${result.error}`
            : `HTTP ${result.status}\n\n${JSON.stringify(result.body, null, 2)}`}
      </pre>
    </div>
  );
}
