import { Counter } from "@/components/demos/counter";
import { Expander } from "@/components/demos/expander";
import { ServerInfo } from "@/components/demos/server-info";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Demo } from "@/components/lesson/demo";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("05-server-and-client");

export default function Lesson() {
  return (
    <LessonPage slug="05-server-and-client">
      <h2>Two places code can run</h2>
      <p>
        In classic React, every component ran in the browser. In Next.js there are two kinds of component, and the default
        is the new one:
      </p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Server Component (default)</th>
            <th>Client Component (&quot;use client&quot;)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Runs</td>
            <td>On the server only. Its code is never sent to the browser.</td>
            <td>On the server for the first HTML, then again in the browser.</td>
          </tr>
          <tr>
            <td>Can</td>
            <td>
              Be <code>async</code>, query the database, read files, use secrets, read cookies.
            </td>
            <td>
              Use <code>useState</code>, <code>useEffect</code>, event handlers, <code>window</code>, browser APIs.
            </td>
          </tr>
          <tr>
            <td>Cannot</td>
            <td>Use hooks or event handlers. No state, no onClick.</td>
            <td>Touch the database or secrets. Be async.</td>
          </tr>
          <tr>
            <td>Good for</td>
            <td>Pages, layouts, lists of data, anything that only displays.</td>
            <td>Forms, buttons, menus, anything interactive.</td>
          </tr>
        </tbody>
      </table>

      <Demo title="A Server Component" source="components/demos/server-info.tsx">
        <ServerInfo />
      </Demo>
      <CodeBlock
        filename="components/demos/server-info.tsx"
        code={`
import os from "node:os";                 // a Node.js module — impossible in a browser

export function ServerInfo() {
  const facts = [
    ["Node.js version", process.version],
    ["DATABASE_URL is set", process.env.DATABASE_URL ? "yes" : "no"],   // the value never leaves the server
    ["typeof window", typeof window],      // "undefined" — there is no browser here
  ];
  return <dl>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
`}
      />
      <p>
        View the page source in your browser: the facts are there as plain text. The code that produced them, and the
        environment variables it could see, are not.
      </p>

      <h2>&quot;use client&quot; draws the line</h2>
      <p>
        Put <code>&quot;use client&quot;</code> as the first line of a file and every component in it becomes a Client
        Component. The file is bundled and shipped to the browser, along with everything it imports.
      </p>
      <CodeBlock
        filename="components/demos/counter.tsx"
        code={`
"use client";

import { useState } from "react";

export function Counter({ start = 0 }: { start?: number }) {
  const [count, setCount] = useState(start);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
`}
      />
      <Demo title="A Client Component" source="components/demos/counter.tsx">
        <Counter />
      </Demo>
      <ul>
        <li>
          You only mark the <strong>entry point</strong>. A component imported by a Client Component is automatically part
          of the client bundle; it does not need its own directive.
        </li>
        <li>
          Keep the directive as low in the tree as possible. A page should stay a Server Component and render a small{" "}
          <code>&lt;SearchBox /&gt;</code> that is a Client Component, not the other way round.
        </li>
        <li>
          A component with no hooks, no handlers and no browser APIs (like <code>ProfileCard</code> from lesson 3) does not
          need the directive and works in both worlds.
        </li>
      </ul>

      <h2>Passing data across the line</h2>
      <p>
        A Server Component can render a Client Component and give it props, but the props travel over the network, so they
        must be <strong>serialisable</strong>: strings, numbers, booleans, arrays, plain objects, Dates. Not functions, not
        class instances, not database clients.
      </p>
      <CodeBlock
        code={`
// Server Component (a page)
import { Counter } from "@/components/demos/counter";
import { db } from "@/db";

export default async function Page() {
  const rows = await db.select().from(guestbook);          // ✓ server work
  return <Counter start={rows.length} />;                   // ✓ a number travels fine
  // return <Counter onChange={() => {}} />;                // ✗ functions cannot be serialised…
  // …except Server Functions (lesson 9), which are the one kind of function you CAN pass down.
}
`}
      />

      <h2>Server inside client: the children trick</h2>
      <p>
        A Client Component cannot <em>import</em> a Server Component (importing would pull it into the browser bundle).
        But it can <em>receive</em> one as <code>children</code>. The server renders it first and hands over the result.
      </p>
      <CodeBlock
        filename="components/demos/expander.tsx"
        code={`
"use client";

export function Expander({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(!open)}>{label}</button>
      {open ? children : null}        {/* children was rendered on the server already */}
    </div>
  );
}

// In a Server Component:
<Expander label="Show server facts">
  <ServerInfo />                     {/* ← Server Component as children: allowed */}
</Expander>
`}
      />
      <Demo title="Client wrapper, server children" source="components/demos/expander.tsx">
        <Expander label="Show server facts (click)">
          <ServerInfo />
        </Expander>
      </Demo>

      <h2>Context providers</h2>
      <p>
        React context (theme, current user, a toast system) needs a provider component, and providers use hooks, so they
        are Client Components. The pattern is the same trick: a client provider that accepts <code>children</code>, rendered
        from the root layout.
      </p>
      <CodeBlock
        filename="components/theme-provider.tsx (example)"
        code={`
"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

const ThemeContext = createContext<"light" | "dark">("light");

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<"light" | "dark">("light");
  return <ThemeContext value={theme}>{children}</ThemeContext>;
}

export const useTheme = () => useContext(ThemeContext);

// app/layout.tsx (a Server Component) can still render it:
// <ThemeProvider>{children}</ThemeProvider>
`}
      />

      <h2>Keeping server code on the server</h2>
      <p>
        A file like <code>lib/dal/notes.ts</code> imports the database. If someone imported it into a Client Component by
        mistake, the build would try to bundle Postgres for the browser. One line prevents that:
      </p>
      <CodeBlock
        filename="lib/dal/notes.ts"
        code={`
import "server-only";   // importing this file from a Client Component is now a build error
`}
      />
      <p>
        Secrets get the same protection from a naming rule: only environment variables that start with{" "}
        <code>NEXT_PUBLIC_</code> are available in the browser. Everything else, like <code>DATABASE_URL</code>, is{" "}
        <code>undefined</code> there. Lesson 14 comes back to this.
      </p>

      <h2>What actually happens on a page load</h2>
      <ol>
        <li>The server runs the Server Components and renders the Client Components too, producing HTML.</li>
        <li>The browser shows that HTML immediately. Nothing is clickable yet.</li>
        <li>
          The JavaScript for the Client Components arrives, and React <strong>hydrates</strong>: it attaches the event
          handlers to the HTML that is already there.
        </li>
        <li>From then on, Client Components re-render in the browser like normal React.</li>
      </ol>
      <Callout kind="warning" title="Hydration mismatch">
        <p>
          Because Client Components render once on the server and once in the browser, both runs must produce the same
          HTML. Rendering <code>new Date()</code> or <code>Math.random()</code> directly breaks that rule and you get a
          &quot;hydration mismatch&quot; warning. That is why the Clock in lesson 3 starts with <code>null</code> and only
          sets the time inside <code>useEffect</code>, which runs in the browser only.
        </p>
      </Callout>

      <h2>Your first try</h2>
      <p>Add a fact only the server could know:</p>
      <ol>
        <li>
          Open <code>components/demos/server-info.tsx</code>.
        </li>
        <li>
          Add one more line to the <code>facts</code> list:{" "}
          <code>[&quot;Project folder&quot;, process.cwd()],</code>
        </li>
        <li>
          Save and look at the first demo on this page. The folder your server runs in is there, and a browser could
          never have produced it.
        </li>
      </ol>
      <p>
        <strong>If you want more:</strong> add <code>const [x, setX] = useState(0)</code> to that same file (no
        &quot;use client&quot;) and read the error Next.js shows. It tells you exactly what the rule is.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>Everything is a Server Component until you write &quot;use client&quot;. Start there.</li>
        <li>Client Components are for interactivity; they get data as serialisable props.</li>
        <li>
          Pass Server Components into Client Components as <code>children</code>; never import them there.
        </li>
        <li>
          <code>import &quot;server-only&quot;</code> and the <code>NEXT_PUBLIC_</code> rule keep secrets off the client.
        </li>
      </ul>
    </LessonPage>
  );
}
