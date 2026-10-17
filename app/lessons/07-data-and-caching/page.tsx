import { Suspense } from "react";
import { refreshQuote } from "@/actions/cache-demo";
import { CachedQuote } from "@/components/demos/data/cached-quote";
import { SlowTime } from "@/components/demos/data/slow-time";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Demo } from "@/components/lesson/demo";
import { LessonPage } from "@/components/lesson/lesson-page";
import { SubmitButton } from "@/components/submit-button";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("07-data-and-caching");

export default function Lesson() {
  return (
    <LessonPage slug="07-data-and-caching">
      <h2>Fetch where you render</h2>
      <p>
        A Server Component can be <code>async</code>, so it can <code>await</code> data and render it in one go. No{" "}
        <code>useEffect</code>, no loading flags, no API round trip from the browser.
      </p>
      <CodeBlock
        filename="components/demos/guestbook-list.tsx (simplified)"
        code={`
import { getCachedGuestbook } from "@/lib/dal/guestbook";

export async function GuestbookList() {
  const entries = await getCachedGuestbook();           // a database query (lesson 8)
  return <ul>{entries.map((entry) => <li key={entry.id}>{entry.message}</li>)}</ul>;
}
`}
      />
      <p>
        <code>fetch()</code> works the same way for external APIs. The question Next.js makes you answer is not{" "}
        <em>how</em> to fetch but <em>when</em>: at build time, once and cached, or on every request?
      </p>

      <h2>The static shell</h2>
      <p>
        This project has <code>cacheComponents: true</code> in <code>next.config.ts</code>. With it on, Next.js prerenders
        every page into a <strong>static shell</strong> at build time, served instantly from a CDN or disk. Anything that
        cannot be known at build time is left as a hole that fills in at request time. Three things make a hole:
      </p>
      <ol>
        <li>
          <strong>Request data</strong>: <code>cookies()</code>, <code>headers()</code>, <code>searchParams</code>,
          dynamic <code>params</code>. (The session is cookies, so anything showing the user is request data.)
        </li>
        <li>
          <strong>Uncached async work</strong>: a database query or <code>fetch</code> without <code>&quot;use cache&quot;</code>.
        </li>
        <li>
          <strong>Non-deterministic values</strong>: <code>Math.random()</code>, <code>new Date()</code>. Call{" "}
          <code>await connection()</code> first to say &quot;this is per request&quot;, or cache the result.
        </li>
      </ol>
      <p>
        The rule that follows: <strong>every hole must be inside a <code>&lt;Suspense&gt;</code> boundary</strong>, so the
        shell has a placeholder to show while it streams in. Forget the boundary and the dev server tells you exactly which
        component to wrap.
      </p>

      <h2>Streaming with Suspense</h2>
      <CodeBlock
        filename="components/demos/data/slow-time.tsx"
        code={`
import { connection } from "next/server";

export async function SlowTime({ delayMs = 1500 }) {
  await connection();                                   // per-request from here on
  await new Promise((resolve) => setTimeout(resolve, delayMs));   // pretend the database is slow
  return <p>The server says it is {new Date().toISOString()}</p>;
}

// In the page:
<Suspense fallback={<p>Loading…</p>}>
  <SlowTime />
</Suspense>
`}
      />
      <Demo title="Streaming" source="components/demos/data/slow-time.tsx">
        <p className="mb-3 text-sm">
          Reload this page. Everything above appears immediately; this box shows its fallback, then the real content streams
          in 1.5 seconds later. The HTML keeps arriving over the same response.
        </p>
        <Suspense fallback={<p className="animate-pulse text-sm text-zinc-500">Asking the slow server…</p>}>
          <SlowTime />
        </Suspense>
      </Demo>
      <p>
        A <code>loading.tsx</code> file does the same thing for a whole page: Next.js wraps the page in a Suspense boundary
        with your loading UI as the fallback. Put the boundary as close to the slow part as you can, so the rest of the
        page is not held hostage.
      </p>

      <h2>Caching with &quot;use cache&quot;</h2>
      <p>
        Data that is the same for everyone and does not change every second should be cached. Add{" "}
        <code>&quot;use cache&quot;</code> as the first line of an async function or component, give it a lifetime with{" "}
        <code>cacheLife</code>, and optionally a label with <code>cacheTag</code> so you can clear it on demand.
      </p>
      <CodeBlock
        filename="components/demos/data/cached-quote.tsx"
        code={`
import { cacheLife, cacheTag } from "next/cache";

export async function CachedQuote() {
  "use cache";
  cacheLife("minutes");     // fresh for 1 minute, then re-rendered in the background
  cacheTag(QUOTE_TAG);      // so an action can throw it away early

  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];   // runs once per cache entry
  return <blockquote>“{quote}” — rendered at {new Date().toLocaleTimeString()}</blockquote>;
}
`}
      />
      <CodeBlock
        filename="actions/cache-demo.ts"
        code={`
"use server";
import { updateTag } from "next/cache";

export async function refreshQuote() {
  updateTag(QUOTE_TAG);     // expire now; this request re-renders with a fresh entry
}
`}
      />
      <Demo title="A cached component" source="components/demos/data/cached-quote.tsx">
        <CachedQuote />
        <form action={refreshQuote} className="mt-4">
          <SubmitButton className="btn btn-outline" pendingLabel="Refreshing…">
            Refresh the cache (updateTag)
          </SubmitButton>
        </form>
      </Demo>
      <p>
        Reload a few times: the quote and its timestamp do not change, because the cached output is reused. Press the button
        and both change at once. Cached results are part of the static shell, so they need no Suspense boundary.
      </p>

      <Callout kind="note" title="Skip on first read">
        <p>
          The two tables below are a reference for when you need to pick a lifetime or clear a cache. On a first pass, the
          idea to keep is: shared data gets <code>&quot;use cache&quot;</code>, and an action that changes it calls{" "}
          <code>updateTag</code>.
        </p>
      </Callout>

      <h3>cacheLife profiles</h3>
      <table>
        <thead>
          <tr>
            <th>Profile</th>
            <th>Serve stale for</th>
            <th>Re-render after</th>
            <th>Use for</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>seconds</code>
            </td>
            <td>30 s</td>
            <td>1 s</td>
            <td>Live-ish counters (too short to prerender)</td>
          </tr>
          <tr>
            <td>
              <code>minutes</code>
            </td>
            <td>5 min</td>
            <td>1 min</td>
            <td>Feeds, dashboards</td>
          </tr>
          <tr>
            <td>
              <code>hours</code>
            </td>
            <td>5 min</td>
            <td>1 h</td>
            <td>Lists that change a few times a day</td>
          </tr>
          <tr>
            <td>
              <code>days</code> / <code>max</code>
            </td>
            <td>5 min</td>
            <td>1 day / 30 days</td>
            <td>Content you invalidate by tag when it changes (CMS pages, highlighted code)</td>
          </tr>
        </tbody>
      </table>

      <h3>Invalidating on demand</h3>
      <table>
        <thead>
          <tr>
            <th>Call</th>
            <th>Where</th>
            <th>Effect</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>updateTag(tag)</code>
            </td>
            <td>Server Actions only</td>
            <td>Expire immediately; the user sees their own change in the same round trip.</td>
          </tr>
          <tr>
            <td>
              <code>revalidateTag(tag, &quot;max&quot;)</code>
            </td>
            <td>Actions and Route Handlers</td>
            <td>Mark stale; serve the old value while a fresh one renders in the background.</td>
          </tr>
          <tr>
            <td>
              <code>revalidatePath(&quot;/path&quot;)</code>
            </td>
            <td>Actions and Route Handlers</td>
            <td>Everything cached for that URL.</td>
          </tr>
          <tr>
            <td>
              <code>refresh()</code>
            </td>
            <td>Server Actions only</td>
            <td>Re-render the current page without touching the cache (for uncached, per-user data).</td>
          </tr>
        </tbody>
      </table>

      <h2>What should be cached?</h2>
      <ul>
        <li>
          <strong>Yes:</strong> public data shared by everyone. The guestbook list, a product catalogue, blog posts,
          highlighted code samples (<code>lib/highlight.ts</code> uses <code>cacheLife(&quot;max&quot;)</code>).
        </li>
        <li>
          <strong>No:</strong> anything per-user or that must be fresh: the session, a user&apos;s notes, a bank balance.
          Read it at request time inside Suspense. Clarity&apos;s rule is &quot;never cache live work data&quot;.
        </li>
        <li>
          <strong>Never inside &quot;use cache&quot;:</strong> <code>cookies()</code> or <code>headers()</code>. Read them
          outside and pass the value in as an argument; it becomes part of the cache key.
        </li>
      </ul>
      <Callout kind="warning" title="Cache keys are the arguments">
        <p>
          A cached function is keyed by its arguments (and any variables it closes over). <code>getNotes(userId)</code>{" "}
          cached per user is fine. <code>getNotes()</code> that reads the user from a cookie inside the cache is a bug that
          shows one person&apos;s notes to everyone.
        </p>
      </Callout>

      <h2>Two small habits</h2>
      <CodeBlock
        filename="components/demos/db-stats.tsx"
        code={`
// 1. Independent queries: start them all, then await together. Sequential awaits add up.
const [users, entries, notes] = await Promise.all([countUsers(), countEntries(), countNotes()]);
`}
      />
      <CodeBlock
        filename="lib/session.ts"
        code={`
// 2. Dedupe within one request with React.cache: five components call getSessionUser(), one query runs.
import { cache } from "react";

export const getSessionUser = cache(async () => {
  const session = await auth();
  return session?.user ?? null;
});
`}
      />

      <h2>Fetching in the browser</h2>
      <p>
        Sometimes the browser has to ask for data after the page loaded: search-as-you-type, infinite scroll, polling. Then
        a Client Component calls <code>fetch()</code> against a Route Handler (lesson 11). It is the exception, not the
        default: if the server could have rendered it, let it.
      </p>

      <h2>Your first try</h2>
      <p>Make the slow part slower and watch the fast parts not care:</p>
      <ol>
        <li>
          Open <code>components/demos/data/slow-time.tsx</code>.
        </li>
        <li>
          Change <code>delayMs = 1500</code> to <code>delayMs = 4000</code>.
        </li>
        <li>
          Save and reload this page. Everything appears at once, except the streaming demo, which shows its placeholder for
          four seconds. Put it back to 1500.
        </li>
      </ol>
      <p>
        <strong>If you want more:</strong> in <code>app/lessons/07-data-and-caching/page.tsx</code>, remove the{" "}
        <code>&lt;Suspense&gt;</code> around <code>&lt;SlowTime /&gt;</code> and read what the dev overlay says. Then put
        it back.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>Fetch inside async Server Components. The hard question is when, not how.</li>
        <li>Request data, uncached reads and random values are holes in the static shell: wrap them in Suspense.</li>
        <li>
          <code>&quot;use cache&quot;</code> + <code>cacheLife</code> + <code>cacheTag</code> for shared data;{" "}
          <code>updateTag</code> after a mutation.
        </li>
        <li>Per-user data stays uncached and streams in.</li>
      </ul>
    </LessonPage>
  );
}
