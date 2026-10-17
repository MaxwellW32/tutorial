import { connection } from "next/server";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Pretends to be a slow data source. `await connection()` tells Next.js "this must run on
 * every request" (otherwise the time would be frozen into the prerendered page at build time).
 *
 * Because it is slow and per-request, the page wraps it in <Suspense>: the rest of the page
 * shows immediately and this part streams in when it is ready.
 */
export async function SlowTime({ delayMs = 1500 }: { delayMs?: number }) {
  await connection();
  await sleep(delayMs);
  const now = new Date();

  return (
    <p className="text-sm">
      The server says it is <span className="font-mono">{now.toISOString()}</span> and this took{" "}
      <span className="font-mono">{delayMs}ms</span> to arrive.
    </p>
  );
}
