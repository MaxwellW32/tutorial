import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("02-typescript");

export default function Lesson() {
  return (
    <LessonPage slug="02-typescript">
      <h2>Why bother with types?</h2>
      <p>
        In JavaScript this runs, and then explodes at 2am when <code>user</code> happens to be <code>undefined</code>:
      </p>
      <CodeBlock
        lang="ts"
        code={`
function greet(user) {
  return "Hello " + user.name.toUpperCase();
}
greet(undefined); // TypeError: Cannot read properties of undefined (reading 'name')
`}
      />
      <p>
        In TypeScript you say what <code>user</code> is, and the editor refuses the bad call before you even save:
      </p>
      <CodeBlock
        lang="ts"
        code={`
type User = { name: string };

function greet(user: User) {
  return "Hello " + user.name.toUpperCase();
}
greet(undefined); // ✗ Argument of type 'undefined' is not assignable to parameter of type 'User'
`}
      />
      <p>
        Types never reach the browser. The compiler checks them, then strips them out and ships plain JavaScript. They cost
        you nothing at runtime; they only cost you a little typing, and they pay it back in autocomplete.
      </p>

      <h2>Inference: you write fewer types than you think</h2>
      <p>
        TypeScript works out most types on its own. You mostly annotate <strong>function parameters</strong>, because those
        are the one place it cannot guess.
      </p>
      <CodeBlock
        lang="ts"
        code={`
let count = 0;            // inferred: number
const title = "Hello";    // inferred: "Hello" (a const can only ever be that string)
const tags = ["a", "b"];  // inferred: string[]

count = "five";           // ✗ Type 'string' is not assignable to type 'number'

function double(n: number) {   // parameter needs a type...
  return n * 2;                // ...the return type (number) is inferred
}
`}
      />

      <h2>Objects: describe the shape once</h2>
      <CodeBlock
        lang="ts"
        code={`
type Planet = {
  name: string;
  order: number;
  moons?: number;         // ? = optional; reading it gives number | undefined
  readonly slug: string;  // readonly = cannot be reassigned after creation
};

const earth: Planet = { name: "Earth", order: 3, slug: "earth" };
earth.moons;            // number | undefined
earth.slug = "terra";   // ✗ Cannot assign to 'slug' because it is a read-only property
`}
      />
      <Callout kind="note" title="type vs interface">
        <p>
          You will also see <code>interface Planet {"{ ... }"}</code>. For describing object shapes the two are nearly
          interchangeable. This project uses <code>type</code> everywhere except where a library asks for an interface (see{" "}
          <code>types/next-auth.d.ts</code>).
        </p>
      </Callout>

      <h2>Arrays, promises and other containers</h2>
      <p>
        A type can be wrapped in another: <code>string[]</code> is an array of strings, <code>Promise&lt;Planet&gt;</code> is
        a promise that resolves to a Planet. The angle brackets are called <strong>generics</strong>: the container is
        generic, you fill in what it holds.
      </p>
      <CodeBlock
        lang="ts"
        code={`
const names: string[] = ["Mercury", "Venus"];
const byOrder: Record<number, Planet> = {};          // an object whose keys are numbers and values are Planets

async function loadPlanets(): Promise<Planet[]> {    // async functions always return a Promise
  const res = await fetch("/api/planets");
  return res.json();
}

const planets = await loadPlanets();                 // Planet[] — the await unwraps the Promise
`}
      />

      <h2>Unions: this OR that</h2>
      <p>
        <code>|</code> means &quot;one of these&quot;. It is how TypeScript handles values that might be missing, and small sets of
        allowed strings (which replace a lot of enums and magic constants).
      </p>
      <CodeBlock
        lang="ts"
        code={`
type Status = "draft" | "published" | "archived";   // only these three strings are allowed

function label(status: Status) {
  if (status === "draft") return "Draft";
  if (status === "published") return "Live";
  return "Archived";       // TypeScript knows only "archived" is left here
}

label("deleted");          // ✗ Argument of type '"deleted"' is not assignable to parameter of type 'Status'

function initials(name: string | null) {
  // name.slice(0, 1)     ✗ 'name' is possibly 'null'
  if (name === null) return "?";
  return name.slice(0, 1); // ✓ inside the if, name is narrowed to string
}
`}
      />
      <p>
        That second example is called <strong>narrowing</strong>: an <code>if</code>, <code>typeof</code>,{" "}
        <code>instanceof</code> or <code>in</code> check removes options from a union, and TypeScript follows along. You
        will see it constantly in this project: <code>if (user === null) redirect(&quot;/login&quot;)</code>, and after that
        line <code>user</code> is no longer nullable.
      </p>

      <h2>Functions</h2>
      <CodeBlock
        lang="ts"
        code={`
// Parameters typed, return type inferred (string)
function slugify(text: string, separator = "-") {
  return text.toLowerCase().trim().replaceAll(/\\s+/g, separator);
}

// Arrow function with an explicit return type (handy for exported helpers)
const isAdult = (age: number): boolean => age >= 18;

// A function type: "something that takes a Planet and returns nothing"
type PlanetHandler = (planet: Planet) => void;

function forEachPlanet(planets: Planet[], handle: PlanetHandler) {
  for (const planet of planets) handle(planet);
}
`}
      />

      <h2>unknown, any, and as</h2>
      <ul>
        <li>
          <code>any</code> turns the type checker off for that value. Avoid it; it hides exactly the bugs you wanted caught.
        </li>
        <li>
          <code>unknown</code> is the safe version: &quot;I do not know what this is yet&quot;. You must narrow it before using it.
          That is what <code>catch (error)</code> and <code>await request.json()</code> give you.
        </li>
        <li>
          <code>value as Type</code> tells TypeScript to trust you. Use it rarely; a wrong <code>as</code> is a lie that
          compiles.
        </li>
      </ul>
      <CodeBlock
        lang="ts"
        code={`
try {
  await riskyThing();
} catch (error) {                       // error: unknown
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
}
`}
      />

      <h2>Types from the libraries you use</h2>
      <p>
        You rarely write types for data you did not invent. Libraries ship their own, and some of them even derive types
        from your code:
      </p>
      <CodeBlock
        lang="ts"
        code={`
// Drizzle: the table definition IS the type (lesson 8)
import { notes } from "@/db/schema";
type Note = typeof notes.$inferSelect;        // { id: string; userId: string; title: string; ... }

// zod: the validation schema IS the type (lesson 9)
import { z } from "zod";
const schema = z.object({ title: z.string().min(1), body: z.string() });
type Input = z.infer<typeof schema>;          // { title: string; body: string }

// Next.js: route types are generated for you (lesson 4)
export default async function Page(props: PageProps<"/lessons/04-routing/demo/[slug]">) {
  const { slug } = await props.params;        // slug: string, and TypeScript knows the name
}
`}
      />

      <h2>Typing React components</h2>
      <p>A component is a function, and its props are its one parameter. Describe them inline or with a named type:</p>
      <CodeBlock
        filename="components/demos/profile-card.tsx"
        code={`
import type { ReactNode } from "react";

type ProfileCardProps = {
  name: string;
  role: string;
  skills?: string[];        // optional
  children?: ReactNode;     // "anything React can render" — the type for children
};

export function ProfileCard({ name, role, skills = [], children }: ProfileCardProps) {
  return <div>…</div>;
}

<ProfileCard name="Ada" role="Engineer" />              // ✓
<ProfileCard name="Ada" />                               // ✗ Property 'role' is missing
<ProfileCard name="Ada" role="Engineer" skills="all" />  // ✗ Type 'string' is not assignable to type 'string[]'
`}
      />

      <h2>Utility types you will meet</h2>
      <Callout kind="note" title="Skip on first read">
        <p>
          This table is a reference for later, when you see one of these in a file and wonder what it means. You do not
          need any of them to finish this tutorial.
        </p>
      </Callout>
      <table>
        <thead>
          <tr>
            <th>Written as</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>typeof value</code>
            </td>
            <td>The type of an existing variable (not the runtime typeof).</td>
          </tr>
          <tr>
            <td>
              <code>keyof T</code>
            </td>
            <td>A union of the property names of T.</td>
          </tr>
          <tr>
            <td>
              <code>Partial&lt;T&gt;</code>
            </td>
            <td>T with every property optional.</td>
          </tr>
          <tr>
            <td>
              <code>Pick&lt;T, &quot;a&quot; | &quot;b&quot;&gt;</code>
            </td>
            <td>Only those properties of T.</td>
          </tr>
          <tr>
            <td>
              <code>Record&lt;K, V&gt;</code>
            </td>
            <td>An object with keys K and values V.</td>
          </tr>
          <tr>
            <td>
              <code>Awaited&lt;T&gt;</code>
            </td>
            <td>What a Promise resolves to.</td>
          </tr>
          <tr>
            <td>
              <code>ReturnType&lt;typeof fn&gt;</code>
            </td>
            <td>What a function returns.</td>
          </tr>
          <tr>
            <td>
              <code>as const</code>
            </td>
            <td>Freeze a literal so its exact values become the type (great for lists of options).</td>
          </tr>
        </tbody>
      </table>

      <h2>Reading an error</h2>
      <p>TypeScript errors look scary and are almost always one of three things:</p>
      <ol>
        <li>
          <strong>Type X is not assignable to type Y</strong>: you passed the wrong shape. Look at what Y expects.
        </li>
        <li>
          <strong>Property Z does not exist on type X</strong>: a typo, or you forgot to narrow a union / check for null.
        </li>
        <li>
          <strong>Object is possibly null / undefined</strong>: add an <code>if</code>, a <code>?.</code>, or a{" "}
          <code>??</code> default.
        </li>
      </ol>
      <Callout kind="tip">
        <p>
          Hover over anything in VS Code to see its type. When a type is long, it is still just nested objects, unions and
          arrays. Read it from the outside in.
        </p>
      </Callout>

      <h2>Your first try</h2>
      <p>Make TypeScript complain, then make it happy again:</p>
      <ol>
        <li>
          Open <code>lib/planets.ts</code>.
        </li>
        <li>
          In the <code>planets</code> list, change Earth&apos;s <code>order: 3</code> to <code>order: &quot;three&quot;</code>.
        </li>
        <li>
          A red underline appears. Hover it and read the message: a string is not assignable to a number.
        </li>
        <li>Put the 3 back. The underline disappears.</li>
      </ol>
      <p>
        That is TypeScript doing its job. You will see that exact message many times, and now you know what it means.
      </p>
      <p>
        <strong>If you want more:</strong> add <code>moons: number</code> to the <code>Planet</code> type and watch every
        planet turn red until you give each one a <code>moons</code> value. Then change it to <code>moons?: number</code>{" "}
        and see why the errors go away.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>Annotate function parameters and exported shapes; let inference handle the rest.</li>
        <li>
          <code>|</code> unions plus narrowing with <code>if</code> cover most real-world typing.
        </li>
        <li>
          Prefer <code>unknown</code> over <code>any</code>, and treat <code>as</code> as a last resort.
        </li>
        <li>Libraries like Drizzle, zod and Next.js generate types from your own code: you get safety for free.</li>
      </ul>
    </LessonPage>
  );
}
