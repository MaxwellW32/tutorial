"use client";

import { useState, type FormEvent } from "react";

type Todo = { id: number; text: string; done: boolean };

/** State that is a list: never mutate the array, always make a new one with map/filter/spread. */
export function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: "Read lesson 3", done: true },
    { id: 2, text: "Add a todo below", done: false },
  ]);
  const [text, setText] = useState("");

  function addTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); // stop the browser from reloading the page
    const trimmed = text.trim();
    if (trimmed === "") return;
    setTodos([...todos, { id: Date.now(), text: trimmed, done: false }]);
    setText("");
  }

  function toggle(id: number) {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)));
  }

  function remove(id: number) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  const remaining = todos.filter((todo) => !todo.done).length;

  return (
    <div className="grid gap-3">
      <form onSubmit={addTodo} className="flex gap-2">
        <input className="field" value={text} onChange={(event) => setText(event.target.value)} placeholder="What needs doing?" />
        <button type="submit" className="btn">
          Add
        </button>
      </form>

      <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center gap-3 py-2 text-sm">
            <input type="checkbox" checked={todo.done} onChange={() => toggle(todo.id)} className="size-4" />
            <span className={todo.done ? "flex-1 text-zinc-400 line-through" : "flex-1"}>{todo.text}</span>
            <button type="button" onClick={() => remove(todo.id)} className="text-xs text-zinc-500 hover:text-red-600">
              remove
            </button>
          </li>
        ))}
      </ul>

      <p className="text-xs text-zinc-500">
        {remaining === 0 ? "All done!" : `${remaining} left`} · this list lives in memory and resets on reload
      </p>
    </div>
  );
}
