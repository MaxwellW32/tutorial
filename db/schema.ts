import type { AdapterAccountType } from "@auth/core/adapters";
import { index, integer, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core";

// Every table is defined once, here, in TypeScript. Drizzle turns these objects into
// SQL (`npm run db:push`) AND into types (`typeof users.$inferSelect`), so the database
// and your code can never disagree about what a row looks like.

// Small helpers so each table does not repeat the same columns.
const id = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());
const createdAt = () => timestamp("created_at", { withTimezone: true, mode: "date" }).notNull().defaultNow();
const tstz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

// --- Auth.js tables -----------------------------------------------------------
// Exactly the shape @auth/drizzle-adapter expects. Auth.js reads and writes these for you.

export const users = pgTable("users", {
  id: id(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: tstz("email_verified"),
  image: text("image"),
  createdAt: createdAt(),
});

/** One row per external login (e.g. Google) linked to a user. */
export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] }), index("accounts_user_idx").on(t.userId)],
);

/** One row per signed-in browser. The cookie only holds the sessionToken. */
export const sessions = pgTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expires: tstz("expires").notNull(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

/** Magic-link tokens: created when the email is sent, deleted when the link is used. */
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: tstz("expires").notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// --- Tutorial tables ------------------------------------------------------------

/** Lesson 9: anyone can post, no sign-in needed. */
export const guestbook = pgTable("guestbook", {
  id: id(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  createdAt: createdAt(),
});

/** Lesson 13: private notes that belong to exactly one user. */
export const notes = pgTable(
  "notes",
  {
    id: id(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull().defaultNow(),
  },
  (t) => [index("notes_user_idx").on(t.userId, t.createdAt.desc())],
);

// --- Row types -------------------------------------------------------------------
// `$inferSelect` is the shape of a row you read back; `$inferInsert` is what an insert needs.

export type User = typeof users.$inferSelect;
export type GuestbookEntry = typeof guestbook.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
