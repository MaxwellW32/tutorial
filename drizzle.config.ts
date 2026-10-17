import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs outside of Next.js, so it does not load .env.local on its own.
dotenv.config({ path: [".env.local", ".env"], quiet: true });

export default defineConfig({
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
});
