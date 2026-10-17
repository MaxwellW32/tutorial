import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { mailFrom, smtpConfig } from "@/lib/mail/config";
import { sendMail } from "@/lib/mail/send";
import { magicLinkEmail } from "@/lib/mail/templates";

// Auth.js (the npm package is still called `next-auth`), configured in one place.
//
//   handlers → GET/POST route handlers mounted at /api/auth/*  (app/api/auth/[...nextauth]/route.ts)
//   auth     → read the current session on the server
//   signIn   → start a sign-in (we call it from a Server Action)
//   signOut  → end the session (also from a Server Action)
//
// AUTH_SECRET, AUTH_URL and AUTH_TRUST_HOST are picked up from .env.local automatically.
export const { handlers, auth, signIn, signOut } = NextAuth({
  // Users, accounts, sessions and verification tokens live in our own Postgres tables.
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  // "database" sessions: the browser cookie only holds a random token; the real data is in
  // the sessions table. Signing someone out everywhere is just deleting their rows.
  session: { strategy: "database" },
  providers: [
    // 1. Google OAuth. The redirect URI registered in Google Cloud must be
    //    <AUTH_URL>/api/auth/callback/google  →  http://localhost:3000/api/auth/callback/google
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    // 2. Magic link by email. Auth.js creates a one-time token and asks us to deliver the link.
    //    It goes through lib/mail so that in development it can be printed to the terminal.
    Nodemailer({
      server: smtpConfig,
      from: mailFrom,
      async sendVerificationRequest({ identifier, url }) {
        await sendMail(magicLinkEmail({ to: identifier, url }));
      },
    }),
  ],
  // Use our own pages instead of the built-in Auth.js ones.
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
    error: "/login",
  },
  callbacks: {
    // With database sessions Auth.js hands us the whole users row. Pass on only what pages need.
    session({ session, user }) {
      return {
        expires: session.expires,
        user: { id: user.id, name: user.name ?? null, email: user.email, image: user.image ?? null },
      };
    },
  },
});
