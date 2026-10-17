import { GuestbookForm } from "@/components/demos/guestbook-form";
import { GuestbookList } from "@/components/demos/guestbook-list";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Demo } from "@/components/lesson/demo";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("09-server-functions");

export default function Lesson() {
  return (
    <LessonPage slug="09-server-functions">
      <h2>Changing data without an API</h2>
      <p>
        Reading data happens in Server Components. Changing it happens in <strong>Server Functions</strong>: async functions
        marked <code>&quot;use server&quot;</code> that run on the server but can be called from a form or a button in the
        browser. Next.js turns the call into a POST request for you. When used with a form they are also called{" "}
        <strong>Server Actions</strong>.
      </p>
      <CodeBlock
        code={`
// The old way: three files and a lot of plumbing
// 1. an API route that parses JSON   2. a fetch() call with headers   3. state for loading and errors

// The new way: one function, one form
<form action={postToGuestbook}>…</form>
`}
      />

      <h2>The action</h2>
      <CodeBlock
        filename="actions/guestbook.ts"
        code={`
"use server";                                     // every export in this file runs on the server

import { updateTag } from "next/cache";
import { z } from "zod";
import { invalid, ok, type ActionState } from "@/lib/action-result";
import { addGuestbookEntry, GUESTBOOK_TAG } from "@/lib/dal/guestbook";

const schema = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(40, "40 characters max"),
  message: z.string().trim().min(1, "Write something").max(280, "280 characters max"),
});

export async function postToGuestbook(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({ name: formData.get("name"), message: formData.get("message") });
  if (!parsed.success) return invalid(parsed.error);     // { ok: false, error, fieldErrors }

  await addGuestbookEntry(parsed.data);                  // parsed.data is typed: { name: string; message: string }
  updateTag(GUESTBOOK_TAG);                              // the cached list is stale now
  return ok("Posted! Your message is at the top of the list.");
}
`}
      />
      <ol>
        <li>
          <strong>FormData in.</strong> Field names come from the <code>name</code> attributes of the inputs.
        </li>
        <li>
          <strong>Validate with zod.</strong> <code>safeParse</code> never throws; it returns either{" "}
          <code>{"{ success: true, data }"}</code> or the errors. The messages you write are what the user sees.
        </li>
        <li>
          <strong>Do the work</strong> through the DAL (lesson 8).
        </li>
        <li>
          <strong>Update the cache</strong>, then <strong>return a plain object</strong> for the form to display.
        </li>
      </ol>

      <h2>The form</h2>
      <CodeBlock
        filename="components/demos/guestbook-form.tsx"
        code={`
"use client";

import { useActionState } from "react";
import { postToGuestbook } from "@/actions/guestbook";

export function GuestbookForm() {
  const [state, formAction, pending] = useActionState(postToGuestbook, null);
  const fieldErrors = state?.ok === false ? state.fieldErrors : undefined;

  return (
    <form action={formAction}>
      <input name="name" required />
      {fieldErrors?.name ? <span>{fieldErrors.name[0]}</span> : null}

      <textarea name="message" required />
      {fieldErrors?.message ? <span>{fieldErrors.message[0]}</span> : null}

      <button type="submit" disabled={pending}>{pending ? "Posting…" : "Post"}</button>
      {state?.ok === true ? <span>{state.message}</span> : null}
      {state?.ok === false ? <span>{state.error}</span> : null}
    </form>
  );
}
`}
      />
      <p>
        <code>useActionState</code> wires the three things a form needs: the last result (<code>state</code>), the function
        to give the form (<code>formAction</code>), and whether it is in flight (<code>pending</code>). Because the action
        takes <code>(previousState, formData)</code>, the hook can pass the last result back in.
      </p>
      <Demo title="Guestbook" source="actions/guestbook.ts · lib/dal/guestbook.ts">
        <div className="grid gap-6 md:grid-cols-2">
          <GuestbookForm />
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Latest entries (cached)</p>
            <GuestbookList />
          </div>
        </div>
      </Demo>
      <p>
        Try submitting an empty message, then a real one. Notice that the list on the right updates in the same round trip
        as the submit: the action called <code>updateTag</code>, so Next.js re-rendered the page and sent the new HTML
        back together with the action result.
      </p>

      <h3>Two more hooks</h3>
      <ul>
        <li>
          <code>useFormStatus()</code> gives <code>pending</code> to any component <em>inside</em> a form. That is how{" "}
          <code>components/submit-button.tsx</code> works, and why the login page can use a Server Component form with a
          busy button.
        </li>
        <li>
          <code>useOptimistic()</code> shows the expected result before the server answers (a like count going up
          instantly). Use it once the basics feel comfortable.
        </li>
      </ul>

      <h2>Progressive enhancement, for free</h2>
      <p>
        A <code>&lt;form action={"{serverFunction}"}&gt;</code> rendered by a Server Component works before any
        JavaScript loads, and even with JavaScript disabled: the browser does a normal form POST and Next.js runs the
        action. Once JavaScript is there, the same form submits without a page reload.
      </p>

      <Callout kind="note" title="Skip on first read">
        <p>
          The next two sections (extra arguments, and what to call after a mutation) are reference material. Lesson 13 uses
          them with a worked example; come back here when you get there.
        </p>
      </Callout>

      <h2>Passing extra arguments</h2>
      <CodeBlock
        code={`
// 1. Hidden inputs (visible in the HTML, fine for ids and paths):
<form action={deleteNoteAction}>
  <input type="hidden" name="id" value={note.id} />
  <button>Delete</button>
</form>

// 2. bind(): the value is encrypted into the action reference, not visible in the page
const deleteThisNote = deleteNoteAction.bind(null, note.id);
<form action={deleteThisNote}>…</form>

// 3. Not a form at all: call it from an event handler, inside a transition
const [pending, startTransition] = useTransition();
<button onClick={() => startTransition(() => likePost(post.id))}>Like</button>
`}
      />

      <h2>After the mutation</h2>
      <p>An action that only returns a value does not re-render anything. To update what the user sees, call one of:</p>
      <table>
        <thead>
          <tr>
            <th>Call</th>
            <th>When</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>updateTag(tag)</code>
            </td>
            <td>The changed data is cached with that tag (the guestbook).</td>
          </tr>
          <tr>
            <td>
              <code>revalidatePath(&quot;/path&quot;)</code>
            </td>
            <td>Simpler than tagging when one URL is affected.</td>
          </tr>
          <tr>
            <td>
              <code>refresh()</code>
            </td>
            <td>The data is not cached (per-user notes); just re-render the current page.</td>
          </tr>
          <tr>
            <td>
              <code>redirect(&quot;/somewhere&quot;)</code>
            </td>
            <td>Go to another page afterwards (sign-in, &quot;create then view&quot;). It throws, so put it last.</td>
          </tr>
        </tbody>
      </table>

      <Callout kind="warning" title="Actions are public endpoints">
        <p>
          Anyone can POST to a Server Action with any arguments, without ever opening your form. So inside every action:
          validate the input, check who is signed in (lesson 10), check they are allowed to touch that specific row, and
          return only what the UI needs, never raw database rows. A page-level check does not protect the action.
        </p>
      </Callout>

      <h2>The action skeleton</h2>
      <p>
        Every action from here on has the same shape. Learn it once and you can read every action in a codebase like
        Clarity, where it is enforced by a helper called <code>runAction</code>:
      </p>
      <CodeBlock
        lang="ts"
        code={`
export async function doTheThing(previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse(…);        // 1. validate
  if (!parsed.success) return invalid(parsed.error);
  const user = await requireUser();          // 2. who is asking? (redirects if nobody)
  const row = await getRow(user.id, id);     // 3. load the row scoped to the user; null = not yours
  if (!row) return fail("That doesn't exist, or you can't see it.");
  await updateRow(user.id, id, parsed.data); // 4. the change (a transaction if several writes)
  refresh();                                 // 5. update the UI
  return ok("Saved.");                       // 6. a plain result for the form
}
`}
      />

      <h2>Your first try</h2>
      <p>Post a message, then change the rule that checks it:</p>
      <ol>
        <li>Post something in the guestbook above. It appears on the right straight away.</li>
        <li>
          Open <code>actions/guestbook.ts</code> and change <code>.max(280, &quot;280 characters max&quot;)</code> to{" "}
          <code>.max(20, &quot;Keep it under 20 characters&quot;)</code>.
        </li>
        <li>
          Save, then post a long message. Your own error text appears under the field. That message travelled from the
          server to the form through the returned object. Put 280 back.
        </li>
      </ol>
      <p>
        <strong>If you want more:</strong> remove the <code>updateTag(...)</code> line, post again, and notice the new entry
        is saved but not shown (the cached list did not know). Put it back.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>
          A Server Function is an async function with <code>&quot;use server&quot;</code>; a form can call it directly.
        </li>
        <li>
          Validate with zod, return a plain result object, and show it with <code>useActionState</code>.
        </li>
        <li>
          After writing, call <code>updateTag</code> / <code>revalidatePath</code> / <code>refresh</code> /{" "}
          <code>redirect</code> so the UI follows.
        </li>
        <li>Treat every action as a public endpoint: validate and authorise inside it.</li>
      </ul>
    </LessonPage>
  );
}
