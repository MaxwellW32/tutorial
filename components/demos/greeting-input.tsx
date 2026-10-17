"use client";

import { useState } from "react";

/** A "controlled" input: React state is the single source of truth for what the box shows. */
export function GreetingInput() {
  const [name, setName] = useState("");

  return (
    <div className="grid gap-2">
      <input className="field" value={name} onChange={(event) => setName(event.target.value)} placeholder="Type your name" />
      <p className="text-sm">{name.trim() === "" ? "Hello, stranger." : `Hello, ${name.trim()}! That is ${name.trim().length} letters.`}</p>
    </div>
  );
}
