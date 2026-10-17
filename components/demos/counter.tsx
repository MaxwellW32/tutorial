"use client";

import { useState } from "react";

/**
 * The classic. `useState` gives the component a piece of memory that survives re-renders;
 * calling the setter tells React to re-render with the new value.
 */
export function Counter({ start = 0 }: { start?: number }) {
  const [count, setCount] = useState(start);

  return (
    <div className="flex items-center gap-3">
      <button type="button" className="btn btn-outline" onClick={() => setCount(count - 1)} aria-label="Decrease">
        −
      </button>
      <span className="min-w-10 text-center font-mono text-lg tabular-nums">{count}</span>
      <button type="button" className="btn btn-outline" onClick={() => setCount(count + 1)} aria-label="Increase">
        +
      </button>
      <button type="button" className="btn btn-outline" onClick={() => setCount(start)}>
        Reset
      </button>
    </div>
  );
}
