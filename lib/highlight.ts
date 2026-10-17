import { cacheLife } from "next/cache";
import { codeToHtml, type BundledLanguage } from "shiki";

export type CodeLanguage = BundledLanguage;

/**
 * Syntax-highlights a code sample into HTML (on the server, so no highlighter ships to the browser).
 *
 * Highlighting the same text always gives the same HTML, so the result is cached with the
 * longest lifetime. Lesson 7 covers what 'use cache' and cacheLife do.
 */
export async function highlight(code: string, lang: CodeLanguage): Promise<string> {
  "use cache";
  cacheLife("max");

  return codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
  });
}
