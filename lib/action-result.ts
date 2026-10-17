import { z } from "zod";

/**
 * What a form-handling Server Action returns to the page.
 *
 * `null` is the state before the form has ever been submitted. After that it is either a
 * success message or an error, optionally with one message per field so the form can show
 * it next to the right input.
 */
export type ActionState =
  | { ok: true; message: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> }
  | null;

export function ok(message: string): ActionState {
  return { ok: true, message };
}

export function fail(error: string, fieldErrors?: Record<string, string[] | undefined>): ActionState {
  return { ok: false, error, fieldErrors };
}

/** Turns a failed zod parse into an ActionState the form can display. */
export function invalid(error: z.ZodError): ActionState {
  const flat = z.flattenError(error);
  return fail(flat.formErrors[0] ?? "Please check the form and try again.", flat.fieldErrors as Record<string, string[] | undefined>);
}
