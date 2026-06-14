"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/validation";

export type GoalFormState = { error: string } | { ok: true } | undefined;

export async function createGoalAction(
  _prev: GoalFormState,
  formData: FormData,
): Promise<GoalFormState> {
  const session = await auth();
  if (!session?.user) return { error: "You must be signed in." };

  const parsed = goalSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid title." };
  }

  // Goals are created dormant in the Vault and scoped to the signed-in user.
  await prisma.goal.create({
    data: { userId: session.user.id, title: parsed.data.title },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}
