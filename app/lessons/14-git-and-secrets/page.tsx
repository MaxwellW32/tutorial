import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("14-git-and-secrets");

export default function Lesson() {
  return (
    <LessonPage slug="14-git-and-secrets">
      <h2>Git in four places</h2>
      <p>
        Git tracks the history of your files. Every change moves through four places, and almost every command is about
        moving things between them:
      </p>
      <ol>
        <li>
          <strong>Working tree</strong>: the files on disk, as you edit them.
        </li>
        <li>
          <strong>Staging area</strong>: the changes you have marked to go into the next commit (<code>git add</code>).
        </li>
        <li>
          <strong>Commits</strong>: permanent snapshots with a message, forming a history (<code>git commit</code>).
        </li>
        <li>
          <strong>Remote</strong>: a copy of that history on GitHub (<code>git push</code> / <code>git pull</code>).
        </li>
      </ol>

      <h2>The everyday loop</h2>
      <CodeBlock
        lang="bash"
        code={`
git status                      # what changed? ALWAYS run this before committing
git diff                        # the actual line changes
git add app/lessons/14-git-and-secrets/page.tsx   # stage one file…
git add .                       # …or everything that changed (check status first!)
git commit -m "Add lesson 14 on git and secrets"
git log --oneline               # the history, one line per commit
`}
      />
      <p>
        Commit small and often: one logical change per commit, with a message that says what it does in the imperative
        (&quot;Add&quot;, &quot;Fix&quot;, &quot;Rename&quot;). Future you will search this log.
      </p>

      <h2>Branches</h2>
      <p>
        A branch is a separate line of history. Work on a branch, keep <code>main</code> always working, merge when done.
      </p>
      <CodeBlock
        lang="bash"
        code={`
git switch -c add-pinned-notes  # create a branch and move to it
# ...edit, add, commit...
git switch main                 # go back
git merge add-pinned-notes      # bring the branch's commits into main
git branch -d add-pinned-notes  # delete the branch once merged
`}
      />

      <h2>GitHub</h2>
      <CodeBlock
        lang="bash"
        code={`
# Once, for a new project (create an empty repository on github.com first, no README):
git remote add origin git@github.com:YOUR-NAME/tutorial.git
git push -u origin main         # -u remembers the remote, so later it is just "git push"

# Every day:
git pull                        # fetch and merge what others pushed
git push                        # publish your commits

# Someone else's project:
git clone git@github.com:THEM/project.git
`}
      />
      <p>
        On a team you push a branch and open a <strong>pull request</strong>: a page on GitHub showing the diff, where
        others comment and approve before it is merged into <code>main</code>. The <code>gh</code> command line tool can do
        it from the terminal: <code>gh pr create</code>.
      </p>
      <Callout kind="tip" title="SSH keys">
        <p>
          GitHub does not accept passwords on the command line. Generate a key once with{" "}
          <code>ssh-keygen -t ed25519</code> and add the public half to GitHub → Settings → SSH keys. Then the{" "}
          <code>git@github.com:</code> URLs just work.
        </p>
      </Callout>

      <h2>Secrets: the rules</h2>
      <p>
        A <strong>secret</strong> is anything that lets someone act as you: database passwords, <code>AUTH_SECRET</code>,
        the Google client secret, the SMTP password, API keys. Leaking one is not a bug you fix next week; bots scan
        GitHub for them within minutes.
      </p>
      <ol>
        <li>
          <strong>Secrets live in <code>.env.local</code> and nowhere else.</strong> That file is listed in{" "}
          <code>.gitignore</code> (as <code>.env*</code>), so git refuses to track it.
        </li>
        <li>
          <strong><code>.env.example</code> is committed</strong> and lists every variable name with no values. A new
          developer copies it and fills it in. Keep it up to date when you add a variable.
        </li>
        <li>
          <strong>Only the server reads them.</strong> <code>process.env.X</code> is <code>undefined</code> in browser
          code unless X starts with <code>NEXT_PUBLIC_</code>. So never name a secret <code>NEXT_PUBLIC_</code>anything,
          and never pass one as a prop to a Client Component.
        </li>
        <li>
          <strong><code>import &quot;server-only&quot;</code></strong> in files that read secrets or talk to the
          database, so importing them from the client is a build error instead of a leak.
        </li>
        <li>
          <strong>Never paste secrets into chat, issues, screenshots or AI tools.</strong> This project&apos;s{" "}
          <code>.claude/settings.json</code> tells Claude Code it may not read <code>.env*</code> files at all.
        </li>
      </ol>
      <CodeBlock
        filename=".gitignore (excerpt)"
        lang="bash"
        code={`
# env files (can opt-in for committing if needed)
.env*
`}
      />
      <CodeBlock
        filename=".env.example"
        lang="dotenv"
        code={`
AUTH_URL="http://localhost:3000"
AUTH_SECRET=
DATABASE_URL=postgres://user:password@host:5432/database
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
SMTP_HOST=smtp.example.com
SMTP_PORT=465
EMAIL=you@example.com
EMAIL_PASS=
`}
      />

      <h3>Check before you push</h3>
      <CodeBlock
        lang="bash"
        code={`
git status                       # is .env.local listed? It must NOT be.
git diff --cached                # read what is staged; look for anything that resembles a key
git log -p -S "AUTH_SECRET="     # search the whole history for a string
`}
      />

      <h3>If a secret leaks anyway</h3>
      <ol>
        <li>
          <strong>Rotate it first.</strong> Make a new one at the provider (Google Console, your email host, the database)
          and update <code>.env.local</code>. The old value is now worthless.
        </li>
        <li>
          Then clean up: deleting the file in a new commit is <em>not</em> enough, the old commit still contains it. Rewriting
          history is possible (<code>git filter-repo</code>) but step 1 is what actually protects you.
        </li>
        <li>GitHub emails you when it spots a known key format in a public repo. Treat that email as step 1, now.</li>
      </ol>

      <h2>Secrets in production</h2>
      <p>
        The server needs the same variables, but you never copy <code>.env.local</code> through git. Each host has a
        place for them:
      </p>
      <ul>
        <li>
          <strong>Vercel</strong>: Project → Settings → Environment Variables (separate values for preview and production).
        </li>
        <li>
          <strong>Your own VPS</strong>: an <code>.env.local</code> created by hand on the server, readable only by the
          user that runs the app.
        </li>
        <li>
          <strong>GitHub Actions</strong>: Repository → Settings → Secrets, referenced as{" "}
          <code>${"{{ secrets.DATABASE_URL }}"}</code> in the workflow.
        </li>
      </ul>
      <p>
        Use different values per environment: a leaked staging key should not open production.
      </p>

      <h2>A few more git habits</h2>
      <ul>
        <li>
          <code>git stash</code> parks uncommitted changes so you can switch branches; <code>git stash pop</code> brings
          them back.
        </li>
        <li>
          <code>git restore file</code> throws away uncommitted changes to one file; <code>git restore --staged file</code>{" "}
          un-stages it.
        </li>
        <li>
          Commit generated files? <code>node_modules/</code> and <code>.next/</code> no (ignored); <code>package-lock.json</code>{" "}
          yes (it pins exact versions for everyone).
        </li>
        <li>
          Never <code>git push --force</code> to a shared branch; it rewrites history others have.
        </li>
      </ul>

      <h2>Your first try</h2>
      <p>Make one commit, safely:</p>
      <ol>
        <li>
          Run <code>git status</code>. Confirm <code>.env.local</code> is <em>not</em> in the list. (Run{" "}
          <code>git check-ignore -v .env.local</code> to see the rule that hides it.)
        </li>
        <li>
          Run <code>git add .</code> and then <code>git status</code> again: the files you changed in earlier lessons are
          now green, staged.
        </li>
        <li>
          Run <code>git commit -m &quot;My first commit&quot;</code>, then <code>git log --oneline</code> to see it.
        </li>
      </ol>
      <p>
        <strong>If you want more:</strong> create an empty repository on GitHub, run the two <code>git remote add</code>{" "}
        and <code>git push -u</code> commands above, then open <code>.env.example</code> on GitHub and confirm it has no
        values in it.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>status → add → commit → push. Small commits, clear messages, work on branches.</li>
        <li>
          Secrets live in <code>.env.local</code> only; <code>.env.example</code> documents the names.
        </li>
        <li>
          <code>NEXT_PUBLIC_</code> means public. <code>server-only</code> keeps server code off the client.
        </li>
        <li>Leaked? Rotate first, clean up second.</li>
      </ul>
    </LessonPage>
  );
}
