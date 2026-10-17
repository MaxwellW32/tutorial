import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("15-shipping");

export default function Lesson() {
  return (
    <LessonPage slug="15-shipping">
      <h2>Before you call anything done</h2>
      <p>Four commands, in this order, all exiting without errors. Make it a reflex.</p>
      <CodeBlock
        lang="bash"
        code={`
npm run lint        # ESLint: unused imports, missing hook deps, accessibility slips
npm run typecheck   # next typegen + tsc: every type in the project
npm run build       # the production build: prerenders pages, catches Suspense/cache mistakes
npm start           # serve the build on :3000 and click through it yourself
`}
      />
      <p>
        The build output lists every route and whether it was prerendered (static) or left for request time. Read it: a page
        you expected to be static that shows up as dynamic usually means a missing <code>&quot;use cache&quot;</code> or a
        session read outside Suspense.
      </p>
      <Callout kind="note" title="Development vs production">
        <p>
          <code>npm run dev</code> is forgiving: it compiles on demand, re-runs cached functions freely and shows rich
          error overlays. <code>npm run build</code> is strict and is what your users get. A thing that only works in dev is
          not finished.
        </p>
      </Callout>

      <h2>What changes in production</h2>
      <ul>
        <li>
          <code>NODE_ENV</code> is <code>production</code>: the console mail fallback is off, error pages hide details, React
          skips its development checks.
        </li>
        <li>
          Environment variables come from the host (lesson 14), with <code>AUTH_URL</code> set to the real domain and the
          Google redirect URI updated to match: <code>https://your-domain.com/api/auth/callback/google</code>.
        </li>
        <li>
          <code>AUTH_SECRET</code>, the database and the SMTP account should be different from the ones on your laptop.
        </li>
        <li>
          <code>npm run db:push</code> runs against the production database once per deploy that changed the schema.
        </li>
      </ul>

      <h2>Your first try</h2>
      <p>Run the four checks on this very project:</p>
      <ol>
        <li>
          Stop the dev server (<kbd>Ctrl</kbd>+<kbd>C</kbd>) and run <code>npm run lint</code>, then{" "}
          <code>npm run typecheck</code>. Both should finish quietly.
        </li>
        <li>
          Run <code>npm run build</code>. Read the list of routes at the end: a circle means static, an{" "}
          <code>f</code> means rendered per request.
        </li>
        <li>
          Run <code>npm start</code> and open <a href="http://localhost:3000">http://localhost:3000</a>. This is the
          production build, exactly what a server would run.
        </li>
      </ol>

      <Callout kind="note" title="Skip on first read">
        <p>
          The deployment options below are here for when you have something to put online. Nothing in them is needed to
          finish the tutorial.
        </p>
      </Callout>

      <h2>Where to deploy</h2>
      <h3>Vercel (easiest)</h3>
      <p>
        Vercel makes Next.js. Connect the GitHub repository, add the environment variables, and every push to{" "}
        <code>main</code> deploys; every pull request gets a preview URL. You still need a Postgres host (Neon, Supabase,
        Railway or your own) and an SMTP account.
      </p>

      <h3>Your own server (VPS)</h3>
      <p>
        A small Linux box with Node.js 22+, Postgres and a process manager. This is how Clarity runs. The whole deploy is a
        script:
      </p>
      <CodeBlock
        filename="deploy.sh"
        lang="bash"
        code={`
#!/usr/bin/env bash
set -euo pipefail
cd /srv/tutorial
git pull                                  # the code
npm ci                                    # exact versions from package-lock.json
npm run build                             # the production build
pm2 startOrRestart ecosystem.config.js    # restart the running process
`}
      />
      <CodeBlock
        filename="ecosystem.config.js"
        lang="js"
        code={`
module.exports = {
  apps: [
    {
      name: "tutorial",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: { NODE_ENV: "production" },
      max_memory_restart: "512M",
      min_uptime: "10s",
      restart_delay: 2000,
    },
  ],
};
`}
      />
      <p>
        A reverse proxy (Caddy or nginx) in front handles HTTPS and forwards <code>your-domain.com</code> to port 3000.{" "}
        <code>.env.local</code> is created by hand on the server. Backups are a <code>pg_dump</code> on a cron job.
      </p>

      <h3>Docker</h3>
      <p>
        Set <code>output: &quot;standalone&quot;</code> in <code>next.config.ts</code> and the build produces a folder
        with only what the server needs; copy it into a small Node image. Useful when the host wants a container.
      </p>

      <h2>After it is live</h2>
      <ul>
        <li>
          <strong>Logs</strong>: <code>pm2 logs</code> or the host&apos;s dashboard. Log one line per event with context
          (<code>notes.created</code>, user id, note id), not prose.
        </li>
        <li>
          <strong>Errors</strong>: wire <code>error.tsx</code> and <code>global-error.tsx</code> to an error service once
          you have real users.
        </li>
        <li>
          <strong>Updates</strong>: <code>npm outdated</code> monthly; read the Next.js upgrade guide in{" "}
          <code>node_modules/next/dist/docs/</code> before a major bump.
        </li>
      </ul>

      <h2>What to learn next</h2>
      <p>You now know the whole shape of a full-stack Next.js app. The next step is depth, in roughly this order:</p>
      <ol>
        <li>
          <strong>Read Clarity</strong> (the reference project): <code>lib/viewer.ts</code>, <code>lib/permissions.ts</code>
          , <code>actions/tasks.ts</code>, <code>db/schema.ts</code>. It is this tutorial&apos;s patterns with organisations,
          roles, history and tests.
        </li>
        <li>
          <strong>Testing</strong>: <code>vitest</code> for pure functions (permissions, formatting), and a headless browser
          script that signs in and clicks through a flow.
        </li>
        <li>
          <strong>UI components</strong>: shadcn/ui on Radix for dialogs, menus and selects that are accessible out of the
          box.
        </li>
        <li>
          <strong>Optimistic UI and transitions</strong>: <code>useOptimistic</code>, <code>useTransition</code>, view
          transitions.
        </li>
      </ol>
      <p>Reference material worth bookmarking:</p>
      <ul>
        <li>
          The Next.js docs for <em>this exact version</em>: <code>node_modules/next/dist/docs/</code> (the online docs may
          describe a newer or older release).
        </li>
        <li>
          <a href="https://react.dev/learn">react.dev/learn</a> for React, and{" "}
          <a href="https://www.typescriptlang.org/docs/handbook/">the TypeScript handbook</a>.
        </li>
        <li>
          <a href="https://orm.drizzle.team/docs">orm.drizzle.team</a>, <a href="https://authjs.dev">authjs.dev</a>,{" "}
          <a href="https://nodemailer.com">nodemailer.com</a>, <a href="https://zod.dev">zod.dev</a>,{" "}
          <a href="https://tailwindcss.com/docs">tailwindcss.com</a>.
        </li>
      </ul>

      <h2>Project ideas</h2>
      <ul>
        <li>A bookmarks manager: per-user links with tags, search (<code>ilike</code>), and a public share page.</li>
        <li>A small blog with an admin area: posts in Postgres, cached public pages invalidated by tag on publish.</li>
        <li>An event sign-up: public form, confirmation email with <code>after()</code>, an admin list, CSV export via a Route Handler.</li>
      </ul>

      <h2>The checklist</h2>
      <ul>
        <li>lint, typecheck, build, start: all green.</li>
        <li>Every action validates input and checks the session.</li>
        <li>Every query is scoped by user (or organisation).</li>
        <li>Secrets only in <code>.env.local</code> and the host; <code>.env.example</code> up to date.</li>
        <li>Clicked through the real thing, signed in, on a phone-sized window too.</li>
      </ul>
    </LessonPage>
  );
}
