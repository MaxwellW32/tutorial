"use client";

import type { ComponentProps, ReactNode } from "react";
import { useFormStatus } from "react-dom";

/**
 * A submit button that knows when its parent <form> is busy.
 *
 * `useFormStatus()` only works in a component rendered INSIDE the form, which is why this is
 * its own small Client Component instead of a plain <button> in the page.
 */
export function SubmitButton({
  children,
  pendingLabel,
  className = "btn",
  ...props
}: ComponentProps<"button"> & { pendingLabel?: ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending || props.disabled} {...props}>
      {pending && pendingLabel ? pendingLabel : children}
    </button>
  );
}
