import { Suspense } from "react";
import { DbStats } from "@/components/demos/db-stats";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Demo } from "@/components/lesson/demo";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("08-database");

export default function Lesson() {
  return (
    <LessonPage slug="08-database">
      <h2>Postgres in one paragraph</h2>
      <p>
        A relational database stores data in <strong>tables</strong> (like spreadsheets): each <strong>row</strong> is one
        thing, each <strong>column</strong> is one fact about it, and every row has a <strong>primary key</strong> that
        identifies it. A column can point at a row in another table (a <strong>foreign key</strong>): a note has a{" "}
        <code>user_id</code> that must match a user. PostgreSQL is the open-source database this project talks to, running
        on the server named in <code>DATABASE_URL</code>.
      </p>

      <h2>Drizzle: SQL that TypeScript understands</h2>
      <p>
        An ORM lets you write queries in your language instead of raw SQL strings. Drizzle keeps the shape of SQL (
        <code>select().from().where()</code>) but checks every table and column name at compile time, and infers the type
        of every result. Typo a column and the editor underlines it.
      </p>

      <h2>1. The connection</h2>
      <CodeBlock
        filename="db/index.ts"
        code={`
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });   // a few reusable connections

export const db = drizzle(pool, { schema });
`}
      />
      <p>
        The real file also parks the pool on <code>globalThis</code> so that hot reloading in development does not open a
        new pool on every file save. Open it and read the comment.
      </p>

      <h2>2. The schema</h2>
      <p>
        Tables are declared once, in TypeScript. This is the single source of truth: Drizzle creates the SQL from it, and
        the types from it.
      </p>
      <CodeBlock
        filename="db/schema.ts"
        code={`
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const notes = pgTable(
  "notes",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),  // foreign key
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("notes_user_idx").on(t.userId, t.createdAt.desc())],   // speeds up "this user's notes, newest first"
);

export type Note = typeof notes.$inferSelect;      // { id: string; userId: string; title: string; body: string; createdAt: Date; … }
export type NewNote = typeof notes.$inferInsert;   // the same, but columns with defaults are optional
`}
      />
      <ul>
        <li>
          <code>onDelete: &quot;cascade&quot;</code>: deleting a user deletes their notes. The database enforces it, so no
          code path can forget.
        </li>
        <li>
          Column names are <code>snake_case</code> in SQL and <code>camelCase</code> in TypeScript. You only ever type the
          camelCase one.
        </li>
        <li>
          An <strong>index</strong> is a lookup structure for a query you run a lot. Add one for the real queries, not for
          every column.
        </li>
      </ul>

      <h2>3. Push the schema to the database</h2>
      <CodeBlock
        lang="bash"
        code={`
npm run db:push     # drizzle-kit compares db/schema.ts with the database and applies the difference
npm run db:studio   # a browser UI to browse and edit rows
`}
      />
      <CodeBlock
        filename="drizzle.config.ts"
        lang="ts"
        code={`
import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: [".env.local", ".env"], quiet: true });   // drizzle-kit does not read .env.local by itself

export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
`}
      />
      <Callout kind="note" title="push vs migrations">
        <p>
          <code>db:push</code> is the simple workflow: edit the schema, push, done. Once a project has real data, keep
          changes additive (new tables, new nullable columns) so a push never has to drop anything. Larger teams generate
          migration files instead (<code>drizzle-kit generate</code>) so every change is reviewed and versioned.
        </p>
      </Callout>

      <h2>4. Queries</h2>
      <CodeBlock
        filename="lib/dal/notes.ts"
        code={`
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notes } from "@/db/schema";

// SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC
export async function listNotes(userId: string) {
  return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt));
}

// SELECT * FROM notes WHERE id = $1 AND user_id = $2
export async function getNote(userId: string, id: string) {
  const [note] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
  return note ?? null;
}

// INSERT INTO notes (user_id, title, body) VALUES (...) RETURNING *
export async function createNote(userId: string, input: { title: string; body: string }) {
  const [note] = await db.insert(notes).values({ userId, ...input }).returning();
  return note;
}

// DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id
export async function deleteNote(userId: string, id: string) {
  const deleted = await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, userId))).returning({ id: notes.id });
  return deleted.length > 0;
}
`}
      />
      <p>A few more shapes you will reach for:</p>
      <CodeBlock
        code={`
import { count, ilike, sql } from "drizzle-orm";

await db.update(notes).set({ title, updatedAt: new Date() }).where(eq(notes.id, id));   // UPDATE
await db.select({ value: count() }).from(notes);                                        // SELECT count(*)
await db.select().from(notes).where(ilike(notes.title, \`%\${query}%\`)).limit(20);       // case-insensitive search
await db.query.notes.findMany({ where: eq(notes.userId, userId), limit: 10 });          // the relational query API

// Several writes that must succeed or fail together:
await db.transaction(async (tx) => {
  const [note] = await tx.insert(notes).values({ userId, title, body }).returning();
  await tx.insert(activity).values({ noteId: note.id, kind: "created" });
});
`}
      />
      <Demo title="Live row counts" source="components/demos/db-stats.tsx">
        <Suspense fallback={<p className="animate-pulse text-sm text-zinc-500">Counting rows…</p>}>
          <DbStats />
        </Suspense>
      </Demo>
      <p>
        These counts are read fresh on every request (an uncached query, so the demo is wrapped in Suspense). Post in the
        guestbook in lesson 9 or sign in, come back, and watch them change.
      </p>

      <h2>5. Keep queries in one place</h2>
      <p>
        Every query in this project lives in <code>lib/dal/</code> (data access layer), one file per table, and the file
        starts with <code>import &quot;server-only&quot;</code>. Pages, actions and API routes call these functions. The
        benefits compound: one place to add an authorization rule, one place to look when a query is slow, and no chance of
        a database import sneaking into browser code.
      </p>
      <Callout kind="tip" title="SQL injection is not your problem here">
        <p>
          Every value you pass (<code>userId</code>, a search string) is sent to Postgres as a parameter, never pasted into
          the query text. Only the <code>sql`...`</code> escape hatch can get you in trouble, and it also parameterises{" "}
          <code>${"{values}"}</code>.
        </p>
      </Callout>

      <h2>Your first try</h2>
      <p>Look at the real tables, no code needed:</p>
      <ol>
        <li>
          In a second terminal, run <code>npm run db:studio</code> and open the link it prints.
        </li>
        <li>
          Click the <code>guestbook</code> table. The columns are exactly the ones in <code>db/schema.ts</code>: open that
          file next to it and compare.
        </li>
        <li>
          Click <code>users</code>. If you have signed in already, you are in there.
        </li>
      </ol>
      <p>
        <strong>If you want more:</strong> add a <code>pinned</code> column to <code>notes</code> in the schema (
        <code>boolean(&quot;pinned&quot;).notNull().default(false)</code>, importing <code>boolean</code> from{" "}
        <code>drizzle-orm/pg-core</code>), run <code>npm run db:push</code>, and watch it appear in studio.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>
          <code>db/schema.ts</code> is the truth: <code>db:push</code> makes the database match it, and{" "}
          <code>$inferSelect</code> gives you the row type.
        </li>
        <li>Drizzle queries read like SQL and are type-checked.</li>
        <li>Put every query in a server-only DAL file, with the user id in the WHERE clause.</li>
      </ul>
    </LessonPage>
  );
}
