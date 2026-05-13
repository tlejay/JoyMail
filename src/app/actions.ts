"use server";

import { signOut, signIn } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/sign-in" });
}

export async function switchAccountAction() {
  await signIn("google", {
    redirectTo: "/",
  });
}
