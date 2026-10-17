import { handlers } from "@/lib/auth";

// Auth.js needs several URLs: /api/auth/signin, /api/auth/callback/google, /api/auth/signout, ...
// `[...nextauth]` is a catch-all segment, so this one file answers all of them.
export const { GET, POST } = handlers;
