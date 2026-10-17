import { ApiPlayground } from "@/components/demos/api-playground";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Demo } from "@/components/lesson/demo";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("11-api-routes");

export default function Lesson() {
  return (
    <LessonPage slug="11-api-routes">
      <h2>When you need a real HTTP endpoint</h2>
      <p>
        Server Functions cover forms and buttons inside your own app. A <strong>Route Handler</strong> is for everything
        else that speaks HTTP: a mobile app, a webhook from Stripe, a script, another service, or a Client Component that
        polls for data. It is a file named <code>route.ts</code> that exports functions named after HTTP methods.
      </p>
      <table>
        <thead>
          <tr>
            <th>Need</th>
            <th>Use</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>A form or button in this app changes data</td>
            <td>Server Function (lesson 9)</td>
          </tr>
          <tr>
            <td>Another program needs to read or write your data</td>
            <td>Route Handler</td>
          </tr>
          <tr>
            <td>The browser needs data after the page loaded (search, polling)</td>
            <td>Route Handler + fetch()</td>
          </tr>
          <tr>
            <td>Auth.js callbacks, file downloads, webhooks</td>
            <td>Route Handler</td>
          </tr>
        </tbody>
      </table>

      <h2>GET and POST</h2>
      <CodeBlock
        filename="app/api/guestbook/route.ts"
        code={`
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { addGuestbookEntry, GUESTBOOK_TAG, listGuestbookEntries } from "@/lib/dal/guestbook";

/** GET /api/guestbook */
export async function GET() {
  const entries = await listGuestbookEntries();
  return NextResponse.json({ entries });                // 200 with a JSON body
}

const schema = z.object({ name: z.string().trim().min(1).max(40), message: z.string().trim().min(1).max(280) });

/** POST /api/guestbook  body: { name, message } */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();                        // throws on malformed JSON
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", fields: z.flattenError(parsed.error).fieldErrors }, { status: 400 });
  }

  const entry = await addGuestbookEntry(parsed.data);
  revalidateTag(GUESTBOOK_TAG, "max");                 // the lesson-9 list is cached; mark it stale
  return NextResponse.json({ entry }, { status: 201 }); // 201 Created
}
`}
      />
      <ul>
        <li>
          <code>Request</code> and <code>Response</code> are the web standard objects, the same ones <code>fetch()</code>{" "}
          uses. <code>NextResponse.json()</code> is a shortcut for a JSON response with the right header.
        </li>
        <li>
          Status codes are the contract: <strong>200</strong> ok, <strong>201</strong> created, <strong>400</strong> bad
          input, <strong>401</strong> not signed in, <strong>403</strong> not allowed, <strong>404</strong> not found,{" "}
          <strong>500</strong> our bug.
        </li>
        <li>
          Validation is the same zod schema idea as in actions. The body is <code>unknown</code> until it passes.
        </li>
        <li>
          A <code>route.ts</code> and a <code>page.tsx</code> cannot share a folder; the convention is to keep endpoints
          under <code>app/api/</code>.
        </li>
      </ul>

      <h2>Dynamic segments and the query string</h2>
      <CodeBlock
        filename="app/api/hello/[name]/route.ts"
        code={`
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest, context: RouteContext<"/api/hello/[name]">) {
  const { name } = await context.params;                          // typed from the folder name
  const shout = request.nextUrl.searchParams.get("shout") === "1"; // ?shout=1
  const greeting = \`Hello, \${name}!\`;
  return NextResponse.json({ greeting: shout ? greeting.toUpperCase() : greeting });
}
`}
      />

      <h2>Authentication in a Route Handler</h2>
      <p>
        The browser sends cookies with every same-site <code>fetch()</code>, so the session helper from lesson 10 works
        unchanged:
      </p>
      <CodeBlock
        filename="app/api/me/route.ts"
        code={`
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";

export async function GET() {
  const user = await getSessionUser();
  if (user === null) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  return NextResponse.json({ user });
}
`}
      />
      <p>
        For callers that are not a browser (a script, another server), you would check an API key from a header instead:{" "}
        <code>request.headers.get(&quot;authorization&quot;)</code> compared against a secret from <code>.env.local</code>.
      </p>

      <h2>Calling it from the browser</h2>
      <CodeBlock
        filename="components/demos/api-playground.tsx (simplified)"
        code={`
"use client";

const response = await fetch("/api/guestbook", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "API playground", message: "Posted with fetch()" }),
});
const data = await response.json();
if (!response.ok) console.error(data.error);
`}
      />
      <Demo title="API playground" source="components/demos/api-playground.tsx">
        <ApiPlayground />
      </Demo>
      <p>
        The same endpoints work from a terminal, which is how you test an API without a UI:
      </p>
      <CodeBlock
        lang="bash"
        code={`
curl http://localhost:3000/api/hello/ada?shout=1
curl http://localhost:3000/api/guestbook
curl -X POST http://localhost:3000/api/guestbook -H "Content-Type: application/json" -d '{"name":"curl","message":"hi"}'
curl -i http://localhost:3000/api/me         # 401 without the cookie
`}
      />

      <Callout kind="note" title="GET handlers and the static shell">
        <p>
          With Cache Components on, a <code>GET</code> handler that reads no request data and no uncached source is
          prerendered at build time like a page. Ours query the database, so they run per request. If you want a cached
          JSON endpoint, call a <code>&quot;use cache&quot;</code> function from it.
        </p>
      </Callout>

      <h2>Your first try</h2>
      <p>Change what an endpoint says:</p>
      <ol>
        <li>Press every button in the playground above once and read the responses.</li>
        <li>
          Open <code>app/api/hello/[name]/route.ts</code> and change <code>Hello, ${"{name}"}!</code> to{" "}
          <code>Hi there, ${"{name}"}!</code>.
        </li>
        <li>Save and press the hello button again. Then open the same URL directly in a new browser tab.</li>
      </ol>
      <p>
        <strong>If you want more:</strong> make that route answer with status 400 when the name is longer than 20
        characters. The <code>POST</code> handler in <code>app/api/guestbook/route.ts</code> shows how to return an error
        status.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>
          <code>route.ts</code> + exported <code>GET</code>/<code>POST</code>/… = an HTTP endpoint using standard Request
          and Response.
        </li>
        <li>Validate the body, return JSON with the right status code, reuse the same DAL and session helpers.</li>
        <li>Reach for them when something other than your own forms needs to talk to the server.</li>
      </ul>
    </LessonPage>
  );
}
