/**
 * A same-site path to send someone to after sign-in, or the fallback.
 *
 * Rejects absolute URLs ("https://evil.com") and protocol-relative ones ("//evil.com"), so a
 * crafted link can never bounce a user to another site after they log in.
 */
export function safePath(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}
