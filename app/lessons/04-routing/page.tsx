import Link from "next/link";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Demo } from "@/components/lesson/demo";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("04-routing");

export default function Lesson() {
  return (
    <LessonPage slug="04-routing">
      <h2>Folders are URLs</h2>
      <p>
        There is no router configuration file. Inside <code>app/</code>, every folder is a URL segment, and a folder becomes
        a real page the moment it contains a <code>page.tsx</code>.
      </p>
      <CodeBlock
        lang="bash"
        code={`
app/page.tsx                               →  /
app/login/page.tsx                         →  /login
app/login/check-email/page.tsx             →  /login/check-email
app/lessons/04-routing/page.tsx            →  /lessons/04-routing        (this page)
app/lessons/04-routing/demo/[slug]/page.tsx →  /lessons/04-routing/demo/earth, /…/mars, …
`}
      />
      <CodeBlock
        filename="app/lessons/04-routing/demo/page.tsx (simplified)"
        code={`
// A page is just a component that is the default export of page.tsx
export default function PlanetsPage() {
  return <h1>Planets</h1>;
}
`}
      />
      <p>
        Files that are not <code>page.tsx</code> (or one of the other special names below) are ignored by the router, so
        you can keep helper files next to the page that uses them.
      </p>

      <h2>Layouts: shared UI that stays put</h2>
      <p>
        A <code>layout.tsx</code> wraps every page in its folder <em>and below</em>. It receives those pages as{" "}
        <code>children</code>. Layouts nest: the root layout wraps the lessons layout, which wraps this page.
      </p>
      <CodeBlock
        filename="app/lessons/layout.tsx (simplified)"
        code={`
export default function LessonsLayout({ children }: LayoutProps<"/lessons">) {
  return (
    <div className="flex">
      <aside>
        <LessonNav />          {/* the sidebar on the left of this page */}
      </aside>
      <main>{children}</main>  {/* ← the current lesson goes here */}
    </div>
  );
}
`}
      />
      <p>
        When you click from one lesson to the next, only <code>children</code> changes. The layout is not re-rendered, so
        the sidebar keeps its scroll position and any state it has. The root layout (<code>app/layout.tsx</code>) is the
        only one that renders <code>&lt;html&gt;</code> and <code>&lt;body&gt;</code>.
      </p>

      <h2>Linking</h2>
      <p>
        Use <code>&lt;Link&gt;</code> from <code>next/link</code> instead of <code>&lt;a&gt;</code> for internal links. It
        renders a normal anchor tag, but when it scrolls into view Next.js prefetches the destination, and clicking it swaps
        the page content without a full reload.
      </p>
      <CodeBlock
        code={`
import Link from "next/link";

<Link href="/lessons/04-routing/demo">All planets</Link>
<Link href={\`/lessons/04-routing/demo/\${planet.slug}\`}>{planet.name}</Link>
<a href="https://react.dev">External sites still use a plain anchor</a>
`}
      />
      <p>
        To navigate from code (after a form submits, say), use the <code>useRouter()</code> hook in a Client Component, or{" "}
        <code>redirect()</code> on the server. To know which link is active, use <code>usePathname()</code>: that is how
        the sidebar highlights the current lesson (<code>components/lesson/lesson-nav.tsx</code>).
      </p>

      <h2>Dynamic segments</h2>
      <p>
        Square brackets make a folder match <em>any</em> value: <code>[slug]</code>. The matched value arrives in the{" "}
        <code>params</code> prop. In this version of Next.js <code>params</code> is a <strong>Promise</strong>, so you{" "}
        <code>await</code> it.
      </p>
      <CodeBlock
        filename="app/lessons/04-routing/demo/[slug]/page.tsx"
        code={`
import { notFound } from "next/navigation";
import { getPlanet, planets } from "@/lib/planets";

// Tell Next.js which slugs exist so it can prerender them at build time (optional but fast).
export function generateStaticParams() {
  return planets.map((planet) => ({ slug: planet.slug }));
}

// PageProps<"/the/route"> is generated for you: params is typed as { slug: string }.
export default async function PlanetPage({ params }: PageProps<"/lessons/04-routing/demo/[slug]">) {
  const { slug } = await params;
  const planet = getPlanet(slug);
  if (!planet) notFound();          // renders the nearest not-found.tsx with a 404 status

  return <h1>{planet.name}</h1>;
}
`}
      />
      <ul>
        <li>
          <code>[...slug]</code> catches every segment after it (<code>/docs/a/b/c</code> → <code>{"['a','b','c']"}</code>
          ). <code>[[...slug]]</code> also matches the folder itself with no extra segments.
        </li>
        <li>
          <code>PageProps</code> and <code>LayoutProps</code> are global types: no import needed. They are generated by{" "}
          <code>next dev</code>, <code>next build</code> or <code>npm run typecheck</code>.
        </li>
      </ul>

      <h2>Search params</h2>
      <p>
        <code>?sort=desc</code> arrives through the <code>searchParams</code> prop, also a Promise. Search params are only
        known when a request comes in, so the part of the page that reads them must be inside <code>&lt;Suspense&gt;</code>{" "}
        (lesson 7 explains the rule; for now, copy the pattern).
      </p>
      <CodeBlock
        filename="app/lessons/04-routing/demo/page.tsx"
        code={`
import { Suspense } from "react";

export default function PlanetsPage({ searchParams }: PageProps<"/lessons/04-routing/demo">) {
  return (
    <>
      <h1>Planets</h1>                                 {/* static: in the HTML immediately */}
      <Suspense fallback={<p>Loading…</p>}>
        <PlanetList searchParams={searchParams} />     {/* dynamic: streams in */}
      </Suspense>
    </>
  );
}

async function PlanetList({ searchParams }: Pick<PageProps<"/lessons/04-routing/demo">, "searchParams">) {
  const { sort } = await searchParams;
  const sorted = [...planets].sort((a, b) => (sort === "desc" ? b.order - a.order : a.order - b.order));
  return <ul>{sorted.map((planet) => <li key={planet.slug}>{planet.name}</li>)}</ul>;
}
`}
      />

      <h2>The special files</h2>
      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>page.tsx</code>
            </td>
            <td>The UI for a URL. Makes the folder public.</td>
          </tr>
          <tr>
            <td>
              <code>layout.tsx</code>
            </td>
            <td>Shared UI around the pages below it. Keeps state across navigations.</td>
          </tr>
          <tr>
            <td>
              <code>loading.tsx</code>
            </td>
            <td>Shown instantly while the page below is still rendering on the server (a Suspense boundary around the page).</td>
          </tr>
          <tr>
            <td>
              <code>error.tsx</code>
            </td>
            <td>
              Catches errors thrown while rendering the pages below it and shows a fallback with a <code>retry()</code>{" "}
              function. Must be a Client Component.
            </td>
          </tr>
          <tr>
            <td>
              <code>not-found.tsx</code>
            </td>
            <td>
              Shown when <code>notFound()</code> is called below it, or for unknown URLs (the root one).
            </td>
          </tr>
          <tr>
            <td>
              <code>route.ts</code>
            </td>
            <td>An HTTP endpoint instead of a page (lesson 11).</td>
          </tr>
          <tr>
            <td>
              <code>(group)/</code>
            </td>
            <td>
              Parentheses = organisation only, not part of the URL. <code>app/(marketing)/about/page.tsx</code> is still{" "}
              <code>/about</code>. Lets different sections have different layouts.
            </td>
          </tr>
          <tr>
            <td>
              <code>_private/</code>
            </td>
            <td>An underscore opts a folder out of routing entirely. Good for colocated components.</td>
          </tr>
        </tbody>
      </table>
      <CodeBlock
        filename="app/lessons/04-routing/demo/error.tsx"
        code={`
"use client"; // error boundaries must be Client Components

export default function DemoError({ error, retry }: { error: unknown; retry: () => void }) {
  const message = error instanceof Error ? error.message : "Something went wrong";
  return (
    <div role="alert">
      <p>{message}</p>
      <button onClick={() => retry()}>Try again</button>
    </div>
  );
}
`}
      />

      <Demo title="All of the above, live" source="app/lessons/04-routing/demo/">
        <p className="mb-3 text-sm">
          The demo folder has its own layout with a small nav, a list page that reads <code>?sort=</code>, a dynamic{" "}
          <code>[slug]</code> page, a <code>not-found.tsx</code> and an <code>error.tsx</code>. Watch the URL bar as you
          click around, then open the files.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/lessons/04-routing/demo" className="btn no-underline">
            Open the planets demo →
          </Link>
          <Link href="/lessons/04-routing/demo/pluto" className="btn btn-outline no-underline">
            /demo/pluto (404)
          </Link>
          <Link href="/lessons/04-routing/demo/boom?crash=1" className="btn btn-outline no-underline">
            /demo/boom?crash=1 (error)
          </Link>
        </div>
      </Demo>

      <Callout kind="note" title="Middleware is now called proxy">
        <p>
          If you read older tutorials you will see <code>middleware.ts</code>: code that runs before every request to
          rewrite, redirect or add headers. In Next.js 16 that file is <code>proxy.ts</code> at the project root and exports
          a <code>proxy()</code> function. It is for quick checks (redirect signed-out users away from <code>/app</code>),
          not for data fetching. This project does not need one.
        </p>
      </Callout>

      <h2>Your first try</h2>
      <p>Make a brand-new page in three steps:</p>
      <ol>
        <li>
          Create a folder <code>app/hello</code>.
        </li>
        <li>
          Inside it, create <code>page.tsx</code> containing:
          <CodeBlock
            filename="app/hello/page.tsx"
            code={`
export default function HelloPage() {
  return <h1>Hello from my first page</h1>;
}
`}
          />
        </li>
        <li>
          Visit <a href="http://localhost:3000/hello">http://localhost:3000/hello</a>. No configuration, no registration:
          the folder is the URL.
        </li>
      </ol>
      <p>
        <strong>If you want more:</strong> add a planet to <code>lib/planets.ts</code> and check that its page already
        exists at <code>/lessons/04-routing/demo/&lt;its-slug&gt;</code> without you creating a file.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>
          Folder = URL segment, <code>page.tsx</code> = the page, <code>layout.tsx</code> = shared frame that persists.
        </li>
        <li>
          <code>[slug]</code> folders capture URL values; <code>params</code> and <code>searchParams</code> are Promises.
        </li>
        <li>
          <code>loading</code>, <code>error</code> and <code>not-found</code> files give each section of your app its own
          loading, error and 404 UI.
        </li>
      </ul>
    </LessonPage>
  );
}
