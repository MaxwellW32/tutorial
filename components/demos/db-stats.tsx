import { count } from "drizzle-orm";
import { connection } from "next/server";
import { db } from "@/db";
import { guestbook, notes, users } from "@/db/schema";

/**
 * Live row counts. Uncached on purpose so you can watch them change as you use the other lessons.
 * (An uncached database read is request-time work, so the page wraps this in <Suspense>.)
 */
export async function DbStats() {
  await connection();
  const [[userRow], [guestbookRow], [noteRow]] = await Promise.all([
    db.select({ value: count() }).from(users),
    db.select({ value: count() }).from(guestbook),
    db.select({ value: count() }).from(notes),
  ]);

  const rows = [
    ["users", userRow.value],
    ["guestbook", guestbookRow.value],
    ["notes", noteRow.value],
  ] as const;

  return (
    <table className="text-sm">
      <thead>
        <tr>
          <th>Table</th>
          <th>Rows</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([table, value]) => (
          <tr key={table}>
            <td className="font-mono text-xs">{table}</td>
            <td className="tabular-nums">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
