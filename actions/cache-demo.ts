"use server";

import { updateTag } from "next/cache";
import { QUOTE_TAG } from "@/lib/cache-tags";

/** Throws away the cached quote. The page re-renders in the same round trip and picks a new one. */
export async function refreshQuote(): Promise<void> {
  updateTag(QUOTE_TAG);
}
