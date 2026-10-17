import { Clock } from "@/components/demos/clock";
import { Counter } from "@/components/demos/counter";
import { GreetingInput } from "@/components/demos/greeting-input";
import { ProfileCard } from "@/components/demos/profile-card";
import { TodoList } from "@/components/demos/todo-list";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Demo } from "@/components/lesson/demo";
import { LessonPage } from "@/components/lesson/lesson-page";
import { lessonMetadata } from "@/lib/lessons";

export const metadata = lessonMetadata("03-react");

export default function Lesson() {
  return (
    <LessonPage slug="03-react">
      <h2>JSX: HTML inside JavaScript</h2>
      <p>
        React components return <strong>JSX</strong>, which looks like HTML but is really JavaScript. The differences you
        need to know:
      </p>
      <CodeBlock
        code={`
const name = "Ada";

const element = (
  <section className="card">            {/* class → className (class is reserved in JS) */}
    <h1>Hello, {name}!</h1>              {/* { } = put any JavaScript expression here */}
    <img src="/globe.svg" alt="Globe" /> {/* every tag closes, even <img /> and <br /> */}
    <label htmlFor="email">Email</label> {/* for → htmlFor */}
    <button onClick={() => alert("hi")}>Click</button>   {/* events are camelCase and take a function */}
  </section>
);
`}
      />
      <ul>
        <li>
          A component returns <strong>one</strong> root element. If you need siblings, wrap them in an empty{" "}
          <code>&lt;&gt;...&lt;/&gt;</code> (a fragment).
        </li>
        <li>
          Inline styles are objects: <code>style={"{{ color: 'red' }}"}</code>. In this project we use Tailwind classes
          instead (lesson 6).
        </li>
        <li>
          Comments inside JSX are <code>{"{/* like this */}"}</code>.
        </li>
      </ul>

      <h2>Components and props</h2>
      <p>
        A component is a function whose name starts with a capital letter and that returns JSX. You use it like a tag, and
        the attributes you pass become its <strong>props</strong> object.
      </p>
      <CodeBlock
        filename="components/demos/profile-card.tsx"
        code={`
type ProfileCardProps = { name: string; role: string; skills?: string[] };

export function ProfileCard({ name, role, skills = [] }: ProfileCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-zinc-500">{role}</p>
      {skills.length > 0 ? (
        <ul>
          {skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      ) : (
        <p>No skills listed</p>
      )}
    </div>
  );
}

// Used like this:
<ProfileCard name="Grace Hopper" role="Rear Admiral" skills={["COBOL", "compilers"]} />
`}
      />
      <Demo title="ProfileCard with different props" source="components/demos/profile-card.tsx">
        <div className="grid gap-3 sm:grid-cols-2">
          <ProfileCard name="Grace Hopper" role="Rear Admiral" skills={["COBOL", "compilers", "debugging"]} />
          <ProfileCard name="Your friend" role="Junior developer" />
        </div>
      </Demo>
      <p>Three things in that sample come up in every component you will ever write:</p>
      <ul>
        <li>
          <strong>Lists</strong> are made with <code>.map()</code>, and each item needs a stable <code>key</code> so React
          can tell items apart when the list changes. Use an id, not the array index.
        </li>
        <li>
          <strong>Conditional rendering</strong> is a ternary (<code>cond ? a : b</code>) or <code>cond ? a : null</code>.
          Avoid <code>count &amp;&amp; &lt;p&gt;</code> with numbers: when count is 0 it renders a literal 0.
        </li>
        <li>
          <strong>Props are read-only.</strong> A component never changes what it was given; it asks the parent to.
        </li>
      </ul>

      <h2>State: memory that re-renders</h2>
      <p>
        Props come from outside. <strong>State</strong> is a value a component owns and can change. When state changes,
        React runs the component function again and updates the page to match. That is the whole model: the UI is a
        function of the state.
      </p>
      <CodeBlock
        filename="components/demos/counter.tsx"
        code={`
"use client";                       // state and events only work in Client Components (lesson 5)

import { useState } from "react";

export function Counter({ start = 0 }: { start?: number }) {
  const [count, setCount] = useState(start);   // [current value, function to change it]

  return (
    <div>
      <button onClick={() => setCount(count - 1)}>−</button>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
`}
      />
      <Demo title="Counter" source="components/demos/counter.tsx">
        <Counter start={10} />
      </Demo>
      <p>
        <code>useState</code> is a <strong>hook</strong>: a function that gives a component a React superpower. Hooks start
        with <code>use</code>, and they must be called at the top level of the component, in the same order every time (so
        never inside an <code>if</code> or a loop).
      </p>

      <h3>Controlled inputs</h3>
      <p>
        For form fields, you usually keep the text in state and write it back into the input. Then the state is the single
        source of truth, and you can validate or transform it as the user types.
      </p>
      <CodeBlock
        filename="components/demos/greeting-input.tsx"
        code={`
const [name, setName] = useState("");

<input value={name} onChange={(event) => setName(event.target.value)} />
<p>{name === "" ? "Hello, stranger." : \`Hello, \${name}!\`}</p>
`}
      />
      <Demo title="Controlled input" source="components/demos/greeting-input.tsx">
        <GreetingInput />
      </Demo>

      <h3>State that is a list: never mutate</h3>
      <p>
        React only notices a change when you give it a <em>new</em> value. <code>todos.push(x)</code> changes the array in
        place, so the state looks the same to React and nothing updates. Always build a new array or object:
      </p>
      <CodeBlock
        filename="components/demos/todo-list.tsx"
        code={`
const [todos, setTodos] = useState<Todo[]>([]);

setTodos([...todos, newTodo]);                                               // add
setTodos(todos.filter((todo) => todo.id !== id));                            // remove
setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));   // update one

const remaining = todos.filter((todo) => !todo.done).length;   // derived: computed, not stored
`}
      />
      <Demo title="Todo list" source="components/demos/todo-list.tsx">
        <TodoList />
      </Demo>
      <Callout kind="tip" title="Do not store what you can compute">
        <p>
          <code>remaining</code> above is calculated from <code>todos</code> on every render. Storing it in its own state
          would mean two values that can drift apart. If it can be derived, derive it.
        </p>
      </Callout>

      <h2>Events</h2>
      <p>
        Handlers receive an event object just like <code>addEventListener</code> does. The one habit to build: call{" "}
        <code>event.preventDefault()</code> in <code>onSubmit</code>, or the browser reloads the page.
      </p>
      <CodeBlock
        code={`
function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();
  // ...use the state you already have; no need to read the DOM
}

<form onSubmit={handleSubmit}>...</form>
<button type="button" onClick={() => remove(todo.id)}>remove</button>   // type="button" so it does not submit
`}
      />
      <p>
        You will see fewer <code>onSubmit</code> handlers in the rest of this tutorial than you might expect: Next.js lets a
        form call a function on the server directly (lesson 9).
      </p>

      <h2>Effects: talking to the outside world</h2>
      <p>
        Rendering should be pure: same props and state, same output, no side effects. For timers, subscriptions and browser
        APIs, there is <code>useEffect</code>. It runs <em>after</em> React has updated the page.
      </p>
      <CodeBlock
        filename="components/demos/clock.tsx"
        code={`
const [now, setNow] = useState<Date | null>(null);

useEffect(() => {
  setNow(new Date());
  const timer = setInterval(() => setNow(new Date()), 1000);
  return () => clearInterval(timer);   // cleanup: runs when the component unmounts
}, []);                                // dependency list: [] = run once after the first render
`}
      />
      <Demo title="Clock" source="components/demos/clock.tsx">
        <Clock />
      </Demo>
      <ul>
        <li>
          The second argument lists the values the effect depends on. When any of them changes, the cleanup runs and the
          effect runs again. ESLint warns you if you forget one.
        </li>
        <li>
          Fetching data inside <code>useEffect</code> was common in older React. In Next.js you will fetch on the server
          instead (lesson 7), which is simpler and faster. Reach for effects only for browser-only things.
        </li>
      </ul>

      <h2>Composition and children</h2>
      <p>
        Whatever you put between a component&apos;s opening and closing tags arrives as the <code>children</code> prop.
        That is how layouts, cards, modals and the <code>&lt;Demo&gt;</code> boxes on this page are built.
      </p>
      <CodeBlock
        filename="components/lesson/demo.tsx"
        code={`
export function Demo({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border-2 border-dashed">
      <header>Live demo{title ? \` · \${title}\` : ""}</header>
      <div className="p-4">{children}</div>
    </section>
  );
}

<Demo title="Counter">
  <Counter start={10} />      {/* ← this is \`children\` */}
</Demo>
`}
      />

      <h2>Sharing state between components</h2>
      <p>
        When two components need the same state, move it up to their closest common parent and pass it down as props
        (&quot;lifting state up&quot;). When the parent is far away, React <strong>context</strong> lets a provider make a
        value available to everything inside it. You will meet context in lesson 5.
      </p>

      <h2>Your first try</h2>
      <p>Change the Counter and watch the demo on this page follow:</p>
      <ol>
        <li>
          Open <code>components/demos/counter.tsx</code>.
        </li>
        <li>
          Find <code>setCount(count + 1)</code> and change it to <code>setCount(count + 2)</code>.
        </li>
        <li>Save, scroll up to the Counter demo, and press +. It now counts by two.</li>
      </ol>
      <p>
        <strong>If you want more:</strong> add a &quot;clear completed&quot; button to the todo list. You need{" "}
        <code>todos.filter(...)</code> and <code>setTodos(...)</code>, both already used in that file.
      </p>

      <h2>Key takeaways</h2>
      <ul>
        <li>Components are functions: props in, JSX out. Keep them small and compose them.</li>
        <li>
          State is the memory a component owns; changing it re-renders. Never mutate it, always replace it.
        </li>
        <li>Derive values during render; use effects only for things React cannot see (timers, browser APIs).</li>
        <li>
          Hooks (<code>useState</code>, <code>useEffect</code>, ...) go at the top level of a component, in a fixed order.
        </li>
      </ul>
    </LessonPage>
  );
}
