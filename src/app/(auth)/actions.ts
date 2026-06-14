"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { credentialsSchema } from "@/lib/validation";

export type AuthFormState = { error: string } | undefined;

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Enter a valid email and password (8+ characters)." };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
    return undefined;
  } catch (error) {
    // signIn throws a redirect on success — let it propagate.
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}

export async function signUpAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid email or password.",
    };
  }

  const { email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists." };
  }

  await prisma.user.create({
    data: { email, passwordHash: await hashPassword(password) },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    return undefined;
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (error instanceof AuthError) {
      // Account was created; just send them to sign in manually.
      return { error: "Account created, but sign-in failed. Please sign in." };
    }
    throw error;
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/sign-in" });
}
