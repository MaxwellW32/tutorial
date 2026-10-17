import { Suspense } from "react";
import { NotesPanel } from "@/components/demos/notes-panel";
import { SessionStatusSkeleton } from "@/components/demos/session-status";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Demo } from "@/components/lesson/demo";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("13-putting-it-together");

export default function Lesson() {
  return (
    <LessonPage slug="13-putting-it-together">
      <p>
        Everything so far, in one feature: <strong>private notes</strong>. Each note belongs to one user; nobody else can
        list, open or delete it. Here is the feature, then the five files that make it, in the order you would write them.
      </p>
      <Demo title="Private notes" source="components/demos/notes-panel.tsx">
        <Suspense fallback={<SessionStatusSkeleton />}>
          <NotesPanel />
        </Suspense>
      </Demo>

      <h2>1. The table (lesson 8)</h2>
      <CodeBlock
        filename="db/schema.ts"
        code={`
export const notes = pgTable("notes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
}, (t) => [index("notes_user_idx").on(t.userId, t.createdAt.desc())]);
`}
      />
      <p>
        <code>userId</code> is the whole security model. Every query below includes it. Then <code>npm run db:push</code>.
      </p>

      <h2>2. The data access layer (lesson 8)</h2>
      <CodeBlock
        filename="lib/dal/notes.ts"
        code={`
import "server-only";

export async function listNotes(userId: string) {
  return db.select().from(notes).where(eq(notes.userId, userId)).orderBy(desc(notes.createdAt));
}

export async function getNote(userId: string, id: string) {
  const [note] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, userId)));
  return note ?? null;     // not found and not yours look the same: there is nothing to learn from the difference
}

export async function createNote(userId: string, input: { title: string; body: string }) { … }
export async function deleteNote(userId: string, id: string) { … }   // WHERE id = $1 AND user_id = $2
`}
      />
      <Callout kind="note" title="Authorisation is a WHERE clause">
        <p>
          There is no separate &quot;check permission&quot; step that could be forgotten. A function that takes{" "}
          <code>userId</code> and puts it in the query cannot return someone else&apos;s row. Clarity scales the same idea
          up: every DAL function takes a <code>Viewer</code> and filters by <code>orgId</code>, so one organisation can never
          see another&apos;s data.
        </p>
      </Callout>

      <h2>3. The actions (lessons 9 and 10)</h2>
      <CodeBlock
        filename="actions/notes.ts"
        code={`
"use server";

export async function createNoteAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser();                                            // who?
  const parsed = noteSchema.safeParse({ title: formData.get("title"), body: formData.get("body") });   // valid?
  if (!parsed.success) return invalid(parsed.error);
  await createNote(user.id, parsed.data);                                      // do it, scoped to the user
  refresh();                                                                   // per-user data is not cached: just re-render
  return ok("Note saved.");
}

export async function deleteNoteAction(formData: FormData) {
  const user = await requireUser();
  await deleteNote(user.id, String(formData.get("id") ?? ""));                 // cannot delete what is not yours
  const redirectTo = formData.get("redirectTo");
  if (typeof redirectTo === "string") redirect(safePath(redirectTo, "/"));    // from the detail page: go back to the list
  refresh();
}
`}
      />

      <h2>4. The UI (lessons 3, 5 and 9)</h2>
      <p>
        One Server Component reads the session and the notes and renders the list; one Client Component owns the form.
        The delete button is a tiny form per row with a hidden input.
      </p>
      <CodeBlock
        filename="components/demos/notes-panel.tsx (simplified)"
        code={`
export async function NotesPanel() {
  const user = await getSessionUser();
  if (user === null) return <SessionStatus />;              // the "sign in to try this" prompt

  const notes = await listNotes(user.id);
  return (
    <>
      <NotesForm />                                         {/* "use client" + useActionState(createNoteAction) */}
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <Link href={\`/lessons/13-putting-it-together/notes/\${note.id}\`}>{note.title}</Link>
            <form action={deleteNoteAction}>
              <input type="hidden" name="id" value={note.id} />
              <button>delete</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
`}
      />

      <h2>5. The detail page (lesson 4)</h2>
      <p>
        Click a note title above: it opens <code>/lessons/13-putting-it-together/notes/&lt;id&gt;</code>, a dynamic route.
        Paste that URL into another browser where you are signed in as someone else and you get a 404, because{" "}
        <code>getNote</code> never finds it.
      </p>
      <CodeBlock
        filename="app/lessons/13-putting-it-together/notes/[id]/page.tsx"
        code={`
async function NoteDetail({ params }: Pick<PageProps<"/lessons/13-putting-it-together/notes/[id]">, "params">) {
  const user = await requireUser();            // signed out → /login
  const { id } = await params;
  const note = await getNote(user.id, id);
  if (note === null) notFound();               // not yours or does not exist → the not-found.tsx next to this file

  return (
    <article>
      <h1>{note.title}</h1>
      <p>{note.body}</p>
      <form action={deleteNoteAction}>
        <input type="hidden" name="id" value={note.id} />
        <input type="hidden" name="redirectTo" value="/lessons/13-putting-it-together" />
        <button>Delete</button>
      </form>
    </article>
  );
}

export default function NotePage({ params }: PageProps<"/lessons/13-putting-it-together/notes/[id]">) {
  return (
    <Suspense fallback={<p>Loading note…</p>}>
      <NoteDetail params={params} />
    </Suspense>
  );
}
`}
      />

      <h2>What a production version adds</h2>
      <p>This is the same shape Clarity uses, scaled up. The additions you would make for a real product:</p>
      <ul>
        <li>
          <strong>A Viewer, not just a user id</strong>: who they are, which organisation they are acting in, and their
          roles. Every DAL function takes it.
        </li>
        <li>
          <strong>Permission predicates</strong> as pure functions (<code>canEditNote(viewer, note)</code>) in one file,
          unit-tested, used by queries, actions and the UI alike.
        </li>
        <li>
          <strong>One helper for every action</strong> (<code>runAction</code>) that does the zod parse, catches guard
          errors, logs the rest, and always returns a user-safe <code>ActionResult</code>.
        </li>
        <li>
          <strong>Transactions and history</strong>: a change and its audit row are written together or not at all.
        </li>
        <li>
          <strong>Test personas and scripts</strong> so a flow can be proven in a real browser before it is called done.
        </li>
      </ul>

      <h2>Your first try</h2>
      <p>Use the feature, then trace one click through the code:</p>
      <ol>
        <li>Add two notes in the demo above. Click a title: that is the dynamic route. Delete one from its page.</li>
        <li>
          Open <code>actions/notes.ts</code> and read <code>deleteNoteAction</code> top to bottom. Each line is one step of
          the skeleton from lesson 9.
        </li>
        <li>
          Open <code>lib/dal/notes.ts</code> and find <code>userId</code> in every <code>where(...)</code>. That is the
          whole reason nobody else can touch your notes.
        </li>
      </ol>
      <p>
        <strong>If you want more:</strong> sign in as a different <code>@example.com</code> user in a private browser
        window, paste the URL of one of your notes, and get the 404. Then try adding a <code>pinned</code> column and a pin
        button: schema, DAL, action, UI, in that order.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>Schema → DAL → actions → UI → routes. The same order every time.</li>
        <li>Scope every query by the user (or organisation) and you cannot leak data by accident.</li>
        <li>Actions re-check the session; pages re-check the session; the browser is never trusted.</li>
      </ul>
    </LessonPage>
  );
}
