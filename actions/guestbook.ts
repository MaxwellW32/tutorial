"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { invalid, ok, type ActionState } from "@/lib/action-result";
import { addGuestbookEntry, GUESTBOOK_TAG } from "@/lib/dal/guestbook";

// What a valid submission looks like. zod checks the shape AND gives us clean TypeScript types.
const schema = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(40, "40 characters max"),
  message: z.string().trim().min(1, "Write something").max(280, "280 characters max"),
});

/**
 * Called by <form action={...}> through useActionState, so the first argument is the previous
 * state (unused here) and the second is the submitted FormData.
 *
 * Anyone can POST to a Server Action directly, not just through our form, so it validates
 * everything itself and never trusts the browser.
 */
export async function postToGuestbook(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = schema.safeParse({ name: formData.get("name"), message: formData.get("message") });
  if (!parsed.success) return invalid(parsed.error);

  await addGuestbookEntry(parsed.data);

  // The list is cached (lib/dal/guestbook.ts). Expire it so this request's re-render shows the new entry.
  updateTag(GUESTBOOK_TAG);
  return ok("Posted! Your message is at the top of the list.");
}
