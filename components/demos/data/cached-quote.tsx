import { cacheLife, cacheTag } from "next/cache";
import { QUOTE_TAG } from "@/lib/cache-tags";

const QUOTES = [
  "Make it work, make it right, make it fast.",
  "Premature optimization is the root of all evil.",
  "Programs must be written for people to read, and only incidentally for machines to execute.",
  "Simplicity is prerequisite for reliability.",
  "The best code is no code at all.",
  "First, solve the problem. Then, write the code.",
];

/** A random quote. Normally a component must not do this during render; inside "use cache" it is fine, because it runs once. */
function pickRandomQuote(): string {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

/**
 * A cached Server Component. The random pick and the timestamp happen ONCE, then the rendered
 * output is reused for every visitor until the entry expires (cacheLife) or is thrown away on
 * demand (updateTag with QUOTE_TAG).
 */
export async function CachedQuote() {
  "use cache";
  cacheLife("minutes"); // fresh for 1 minute, then re-rendered in the background
  cacheTag(QUOTE_TAG);

  const quote = pickRandomQuote();
  const renderedAt = new Date();

  return (
    <blockquote className="text-sm">
      <p className="text-base">“{quote}”</p>
      <footer className="mt-2 text-xs text-zinc-500">
        Picked and rendered at <span className="font-mono">{renderedAt.toLocaleTimeString("en-GB")}</span> · reload the page:
        it stays the same until the cache is refreshed
      </footer>
    </blockquote>
  );
}
