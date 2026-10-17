# Next.js Tutorial

A hands-on guide to Next.js 16, React 19 and TypeScript for someone who knows HTML, CSS and JavaScript. Fifteen lessons, each a page in the app with real code from this project and live demos: routing, Server Components, caching, a Postgres database with Drizzle ORM, Server Functions, authentication (Google and magic links via Auth.js + Nodemailer), API routes, email, git and secrets, and shipping.

## Run it

```bash
npm install
cp .env.example .env.local   # fill in the values (see lesson 1 and lesson 14)
npm run db:push              # create the tables in your Postgres database
npm run dev                  # http://localhost:3000
```

Sign in with any `@example.com` address to test the magic-link flow without sending email: the link is printed in the terminal.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload on port 3000 |
| `npm run build` | Production build (type-checks, prerenders, bundles) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `next typegen && tsc --noEmit` |
| `npm run db:push` | Make the database match `db/schema.ts` |
| `npm run db:studio` | Browse the database in the browser |

## Lessons

1. Setup and project tour
2. TypeScript for JavaScript developers
3. React: components, props and state
4. Routing: pages, layouts and links
5. Server and Client Components
6. Styling, fonts, images and metadata
7. Fetching data, streaming and caching
8. Database with Drizzle ORM
9. Server Functions and forms
10. Authentication: Google and magic links
11. API routes (Route Handlers)
12. Sending email with Nodemailer
13. Putting it together: private notes
14. Git, GitHub and keeping secrets safe
15. Shipping: checks, build and deploy

The lesson list lives in `lib/lessons.ts`; each lesson is `app/lessons/<slug>/page.tsx`.

## Where things are

```
app/          routes (pages, layouts, API route handlers)
actions/      Server Functions ("use server")
components/   React components; components/demos/ are the live examples in the lessons
lib/          server helpers: auth, session, mail, data access layer (lib/dal/)
db/           Drizzle schema and client
types/        TypeScript declarations (Auth.js session shape)
```
