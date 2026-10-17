// The one list every part of the tutorial reads from: the home page, the sidebar,
// the prev/next links and each lesson's title.

export type Lesson = {
  slug: string;
  title: string;
  /** One sentence shown on the home page and under the lesson title. */
  summary: string;
};

export const lessons: readonly Lesson[] = [
  { slug: "01-setup", title: "Setup and project tour", summary: "What Next.js, React and TypeScript are, how to run this project, and what every file in it is for." },
  { slug: "02-typescript", title: "TypeScript for JavaScript developers", summary: "The 20% of TypeScript you will use 80% of the time: types, objects, unions, functions and inference." },
  { slug: "03-react", title: "React: components, props and state", summary: "JSX, components, props, lists, events, state and effects, with live examples you can poke at." },
  { slug: "04-routing", title: "Routing: pages, layouts and links", summary: "Folders become URLs. Pages, nested layouts, dynamic segments, loading and error states." },
  { slug: "05-server-and-client", title: "Server and Client Components", summary: "The most important idea in modern Next.js: where your code runs, and how to decide." },
  { slug: "06-styling", title: "Styling, fonts, images and metadata", summary: "Tailwind CSS, CSS Modules, next/font, next/image and the <head> of your pages." },
  { slug: "07-data-and-caching", title: "Fetching data, streaming and caching", summary: "Async components, Suspense, and the 'use cache' directive with cacheLife and cacheTag." },
  { slug: "08-database", title: "Database with Drizzle ORM", summary: "Define tables in TypeScript, push them to Postgres, and query them with full type safety." },
  { slug: "09-server-functions", title: "Server Functions and forms", summary: "Handle form submissions on the server with 'use server', validate with zod, update the UI." },
  { slug: "10-auth", title: "Authentication: Google and magic links", summary: "Auth.js with the Drizzle adapter: sign in with Google or an emailed link, protect pages." },
  { slug: "11-api-routes", title: "API routes (Route Handlers)", summary: "When you need a real HTTP endpoint: route.ts files, Request/Response, JSON and status codes." },
  { slug: "12-email", title: "Sending email with Nodemailer", summary: "SMTP, transporters, templates, and a safe way to test email in development." },
  { slug: "13-putting-it-together", title: "Putting it together: private notes", summary: "A full feature: database table, data access layer, authorization, forms and a dynamic route." },
  { slug: "14-git-and-secrets", title: "Git, GitHub and keeping secrets safe", summary: "The everyday git workflow, pushing to GitHub, and making sure API keys never leave your machine." },
  { slug: "15-shipping", title: "Shipping: checks, build and deploy", summary: "Lint, typecheck and build before you ship, where to deploy, and what to learn next." },
];

export function getLesson(slug: string): Lesson {
  const lesson = lessons.find((item) => item.slug === slug);
  if (!lesson) throw new Error(`Unknown lesson: ${slug}`);
  return lesson;
}

export function lessonNumber(slug: string): number {
  return lessons.findIndex((item) => item.slug === slug) + 1;
}

export function lessonHref(slug: string): string {
  return `/lessons/${slug}`;
}

/** `export const metadata = lessonMetadata("01-setup")` in a lesson page sets the tab title. */
export function lessonMetadata(slug: string) {
  const lesson = getLesson(slug);
  return { title: `${lessonNumber(slug)}. ${lesson.title}`, description: lesson.summary };
}
