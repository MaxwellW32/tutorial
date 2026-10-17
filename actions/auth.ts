"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut } from "@/lib/auth";
import { safePath } from "@/lib/safe-path";

const AFTER_LOGIN = "/account";

/** Magic link: validate the address, have Auth.js email a one-time link, then show "check your email". */
export async function signInWithEmail(formData: FormData): Promise<void> {
  const redirectTo = safePath(formData.get("redirectTo"), AFTER_LOGIN);
  const email = z.email().safeParse(String(formData.get("email") ?? "").trim().toLowerCase());
  if (!email.success) redirect("/login?error=EmailInvalid");

  let next: string;
  try {
    // redirect: false → Auth.js returns the URL it *would* redirect to instead of throwing.
    next = await signIn("nodemailer", { email: email.data, redirectTo, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) redirect(`/login?error=${error.type}`);
    throw error;
  }

  const error = new URL(next, "http://localhost").searchParams.get("error");
  if (error) redirect(`/login?error=${error}`);
  redirect("/login/check-email");
}

/** Google: Auth.js answers with a redirect to accounts.google.com. `redirect()` throws, so we let it through. */
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const redirectTo = safePath(formData.get("redirectTo"), AFTER_LOGIN);
  try {
    await signIn("google", { redirectTo });
  } catch (error) {
    if (error instanceof AuthError) redirect(`/login?error=${error.type}`);
    throw error; // the redirect "error" Next.js uses for control flow must keep bubbling up
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
