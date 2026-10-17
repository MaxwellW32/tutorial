import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("01-setup");

export default function Lesson() {
  return (
    <LessonPage slug="01-setup">
      <Callout kind="tip" title="How to read this tutorial">
        <p>
          You do not need to memorise anything. Read each lesson once, do the one small activity at the end, and move on.
          The ideas repeat in later lessons, and you can always come back. If a section feels heavy, skip it; it will
          still be here when you need it.
        </p>
      </Callout>

      <h2>Three tools, one job</h2>
      <p>
        You already know HTML, CSS and JavaScript. Everything in this tutorial is built on top of them, in three layers:
      </p>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>What it is</th>
            <th>What it gives you</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>TypeScript</strong>
            </td>
            <td>JavaScript plus type annotations. It is compiled back into plain JavaScript before it runs.</td>
            <td>The editor tells you about mistakes while you type, instead of the browser telling you at runtime.</td>
          </tr>
          <tr>
            <td>
              <strong>React</strong>
            </td>
            <td>A library for building user interfaces out of components: functions that return HTML-like markup.</td>
            <td>You describe what the page should look like for some data; React updates the page when the data changes.</td>
          </tr>
          <tr>
            <td>
              <strong>Next.js</strong>
            </td>
            <td>A framework around React. It adds routing, a server, a build step, image and font tools, and more.</td>
            <td>Full-stack apps in one project: pages, API endpoints, database access and auth all live together.</td>
          </tr>
        </tbody>
      </table>
      <p>
        The rest of this guide goes through them in that order. Lesson 2 is TypeScript, lesson 3 is React, and from lesson 4
        onwards it is Next.js and the libraries that plug into it.
      </p>

      <h2>Run the project</h2>
      <p>You need Node.js 20 or newer and a code editor (VS Code is assumed below). Then, in a terminal:</p>
      <CodeBlock
        lang="bash"
        code={`
# 1. Install the dependencies listed in package.json into node_modules/
npm install

# 2. Create your local settings file (never committed to git, see lesson 14)
cp .env.example .env.local      # then fill in the values

# 3. Create the database tables described in db/schema.ts
npm run db:push

# 4. Start the development server
npm run dev
`}
      />
      <p>
        Open <a href="http://localhost:3000">http://localhost:3000</a>. The dev server watches your files: save a change and
        the page updates without a reload. Errors show up in the browser and in the terminal.
      </p>

      <Callout kind="tip" title="Use Workspace Version">
        <p>
          In VS Code, open any <code>.tsx</code> file, press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>, run{" "}
          <em>TypeScript: Select TypeScript Version</em> and pick <em>Use Workspace Version</em>. That turns on the Next.js
          TypeScript plugin, which knows about things like Server Components. The ESLint and Tailwind CSS IntelliSense
          extensions are worth installing too.
        </p>
      </Callout>

      <h2>Project tour</h2>
      <p>Here is every folder in this project and what belongs in it. Open them side by side with this page.</p>
      <CodeBlock
        lang="bash"
        code={`
tutorial/
├── app/                  # ROUTES. Each folder is a URL; page.tsx is what the URL shows.
│   ├── layout.tsx        #   wraps every page (<html>, <body>, fonts, global CSS)
│   ├── page.tsx          #   the home page  →  /
│   ├── globals.css       #   Tailwind + a few global styles
│   ├── lessons/          #   /lessons/01-setup, /lessons/02-typescript, ...
│   ├── login/            #   /login and /login/check-email
│   ├── account/          #   /account (needs sign-in)
│   └── api/              #   HTTP endpoints: /api/guestbook, /api/me, /api/auth/*
├── components/           # React components used by pages (UI only, no routes)
├── lib/                  # Server-side helpers: auth, session, mail, data access
├── db/                   # Database: schema.ts (tables) and index.ts (the client)
├── actions/              # Server Functions: code the browser can call to change data
├── types/                # Extra TypeScript declarations
├── public/               # Static files served as-is: /next.svg, /globe.svg ...
├── .env.local            # Secrets and settings for YOUR machine (git-ignored)
├── .env.example          # Same variable names, no values (committed)
├── next.config.ts        # Next.js settings
├── drizzle.config.ts     # Where drizzle-kit finds the schema and the database
├── tsconfig.json         # TypeScript settings ("@/..." means "from the project root")
├── eslint.config.mjs     # Lint rules
└── package.json          # Dependencies and the npm scripts below
`}
      />

      <h3>The npm scripts</h3>
      <table>
        <thead>
          <tr>
            <th>Command</th>
            <th>What it does</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>npm run dev</code>
            </td>
            <td>Development server with hot reload on port 3000.</td>
          </tr>
          <tr>
            <td>
              <code>npm run build</code>
            </td>
            <td>Production build: type-checks, prerenders pages, bundles JavaScript into <code>.next/</code>.</td>
          </tr>
          <tr>
            <td>
              <code>npm start</code>
            </td>
            <td>Serves the production build. This is what runs on a real server.</td>
          </tr>
          <tr>
            <td>
              <code>npm run lint</code>
            </td>
            <td>Runs ESLint: catches unused variables, missing hook dependencies, and other slips.</td>
          </tr>
          <tr>
            <td>
              <code>npm run typecheck</code>
            </td>
            <td>Generates route types, then runs the TypeScript compiler without emitting files.</td>
          </tr>
          <tr>
            <td>
              <code>npm run db:push</code>
            </td>
            <td>Makes the database match <code>db/schema.ts</code>.</td>
          </tr>
          <tr>
            <td>
              <code>npm run db:studio</code>
            </td>
            <td>Opens a browser UI to look at your tables and rows.</td>
          </tr>
        </tbody>
      </table>

      <h2>How a request becomes a page</h2>
      <ol>
        <li>
          The browser asks for <code>/lessons/01-setup</code>.
        </li>
        <li>
          Next.js finds <code>app/lessons/01-setup/page.tsx</code> and every <code>layout.tsx</code> above it.
        </li>
        <li>
          It runs those components <strong>on the server</strong> and produces HTML.
        </li>
        <li>
          The browser shows the HTML right away, then loads a small amount of JavaScript to make the interactive parts work.
        </li>
      </ol>
      <p>
        Most of what makes Next.js different from plain React is in step 3. Your components can talk to the database, read
        cookies and use secret keys, because they run on your server. Lesson 5 is all about that.
      </p>

      <h2>The one import rule you need today</h2>
      <p>
        Paths that start with <code>@/</code> point at the project root, so <code>@/components/demos/counter</code> is{" "}
        <code>components/demos/counter.tsx</code> no matter which file you are in. That is set up in{" "}
        <code>tsconfig.json</code> under <code>paths</code>.
      </p>
      <CodeBlock
        filename="any file"
        code={`
import { Counter } from "@/components/demos/counter"; // absolute: from the project root
import { helper } from "./helper";                     // relative: next to this file
`}
      />

      <h2>Your first try</h2>
      <p>Nothing to build yet. Just prove to yourself that the edit-save-look loop works:</p>
      <ol>
        <li>
          Open <code>app/page.tsx</code> in VS Code.
        </li>
        <li>
          Find the line <em>Everything you need to know, in one place.</em> and change it to anything you like.
        </li>
        <li>Save. The browser tab with the home page updates on its own.</li>
      </ol>
      <p>That is the whole loop you will use for everything else: edit, save, look.</p>
      <p>
        <strong>If you want more:</strong> delete a closing <code>&lt;/div&gt;</code> on purpose, read the error the dev
        server shows, and put it back. Errors are normal; reading them is the skill.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>TypeScript is JavaScript with types. React builds UIs from components. Next.js wraps React into a full-stack framework.</li>
        <li>
          The <code>app/</code> folder is the URL structure. Everything else is organised however you like.
        </li>
        <li>
          Secrets live in <code>.env.local</code>, which is never committed.
        </li>
      </ul>
    </LessonPage>
  );
}
