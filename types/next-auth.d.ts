import type { DefaultSession } from "next-auth";

// Tell TypeScript what OUR session.user looks like (it matches the `session` callback in lib/auth.ts).
// Without this, `session.user.id` would be a type error, because the default Session has no id.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    } & DefaultSession["user"];
  }
}
