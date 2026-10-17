import { getCachedGuestbook } from "@/lib/dal/guestbook";

// A fixed format, so the server and the browser agree on the text.
// (A "3 minutes ago" label would need Date.now() during render, and the current time is not
// allowed in a prerendered component: it would be frozen into the page at build time.)
const format = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

/**
 * A Server Component that reads from the database through the cached DAL function.
 * Because the read is cached, this renders into the static page and needs no <Suspense>.
 */
export async function GuestbookList() {
  const entries = await getCachedGuestbook();

  if (entries.length === 0) {
    return <p className="text-sm text-zinc-500">Nothing here yet. Be the first!</p>;
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {entries.map((entry) => (
        <li key={entry.id} className="py-2.5 text-sm">
          <p>{entry.message}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            — {entry.name}, {format.format(entry.createdAt)} UTC
          </p>
        </li>
      ))}
    </ul>
  );
}
