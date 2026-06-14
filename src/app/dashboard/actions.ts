"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  goalSchema,
  taskSchema,
  taskDescriptionSchema,
  taskGearSchema,
} from "@/lib/validation";
import { canActivateGoal, MAX_ACTIVE_GOALS } from "@/domain/goal";

// Shared shape for form-bound server actions driven by useActionState.
export type FormState = { error: string } | { ok: true } | undefined;
// Kept for the existing Goal form's import name.
export type GoalFormState = FormState;
export type TaskFormState = FormState;

async function currentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

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

// Add a Task (the atomic unit of work) to a Goal, tagged with a Gear (1–4).
export async function createTaskAction(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const userId = await currentUserId();
  if (!userId) return { error: "You must be signed in." };

  const goalId = formData.get("goalId");
  if (typeof goalId !== "string" || goalId === "") {
    return { error: "Missing Goal." };
  }

  const parsed = taskSchema.safeParse({
    description: formData.get("description"),
    gear: formData.get("gear"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid Task." };
  }

  // Only attach the Task if the Goal belongs to the signed-in user.
  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId },
    select: { id: true },
  });
  if (!goal) return { error: "Goal not found." };

  await prisma.task.create({
    data: {
      goalId: goal.id,
      description: parsed.data.description,
      gear: parsed.data.gear,
    },
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

// Edit a Task's description. Scoped to the owner via the Goal relation.
export async function updateTaskDescriptionAction(
  _prev: TaskFormState,
  formData: FormData,
): Promise<TaskFormState> {
  const userId = await currentUserId();
  if (!userId) return { error: "You must be signed in." };

  const taskId = formData.get("taskId");
  if (typeof taskId !== "string" || taskId === "") {
    return { error: "Missing Task." };
  }

  const parsed = taskDescriptionSchema.safeParse({
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid Task." };
  }

  const { count } = await prisma.task.updateMany({
    where: { id: taskId, goal: { userId } },
    data: { description: parsed.data.description },
  });
  if (count === 0) return { error: "Task not found." };

  revalidatePath("/dashboard");
  return { ok: true };
}

// Change a Task's Gear. A plain form action — no state to surface.
export async function updateTaskGearAction(formData: FormData): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;

  const taskId = formData.get("taskId");
  if (typeof taskId !== "string" || taskId === "") return;

  const parsed = taskGearSchema.safeParse({ gear: formData.get("gear") });
  if (!parsed.success) return;

  await prisma.task.updateMany({
    where: { id: taskId, goal: { userId } },
    data: { gear: parsed.data.gear },
  });

  revalidatePath("/dashboard");
}

// Delete a Task. A plain form action — no state to surface.
export async function deleteTaskAction(formData: FormData): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;

  const taskId = formData.get("taskId");
  if (typeof taskId !== "string" || taskId === "") return;

  await prisma.task.deleteMany({
    where: { id: taskId, goal: { userId } },
  });

  revalidatePath("/dashboard");
}

// Activate a Goal: move it from the Vault to Active Goals, assigning the next
// available rank. Blocked if the Goal lacks a Gear-1 Task or the cap is reached.
export async function activateGoalAction(formData: FormData): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;

  const goalId = formData.get("goalId");
  if (typeof goalId !== "string" || goalId === "") return;

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId, status: "vault" },
    include: { tasks: { select: { gear: true } } },
  });
  if (!goal) return;
  if (!canActivateGoal(goal)) return;

  const activeCount = await prisma.goal.count({ where: { userId, status: "active" } });
  if (activeCount >= MAX_ACTIVE_GOALS) return;

  await prisma.goal.update({
    where: { id: goalId },
    data: { status: "active", rank: activeCount + 1 },
  });

  revalidatePath("/dashboard");
}

// Deactivate a Goal: move it back to the Vault and compact the remaining ranks.
export async function deactivateGoalAction(formData: FormData): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;

  const goalId = formData.get("goalId");
  if (typeof goalId !== "string" || goalId === "") return;

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId, status: "active" },
    select: { id: true, rank: true },
  });
  if (!goal || goal.rank === null) return;

  const vacatedRank = goal.rank;

  await prisma.$transaction([
    prisma.goal.update({ where: { id: goalId }, data: { status: "vault", rank: null } }),
    prisma.goal.updateMany({
      where: { userId, status: "active", rank: { gt: vacatedRank } },
      data: { rank: { decrement: 1 } },
    }),
  ]);

  revalidatePath("/dashboard");
}

// Swap this Active Goal's rank with the one ranked immediately above it.
export async function moveGoalRankUpAction(formData: FormData): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;

  const goalId = formData.get("goalId");
  if (typeof goalId !== "string" || goalId === "") return;

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId, status: "active" },
    select: { id: true, rank: true },
  });
  if (!goal || goal.rank === null || goal.rank <= 1) return;

  const above = await prisma.goal.findFirst({
    where: { userId, status: "active", rank: goal.rank - 1 },
    select: { id: true },
  });
  if (!above) return;

  await prisma.$transaction([
    prisma.goal.update({ where: { id: goalId }, data: { rank: goal.rank - 1 } }),
    prisma.goal.update({ where: { id: above.id }, data: { rank: goal.rank } }),
  ]);

  revalidatePath("/dashboard");
}

// Swap this Active Goal's rank with the one ranked immediately below it.
export async function moveGoalRankDownAction(formData: FormData): Promise<void> {
  const userId = await currentUserId();
  if (!userId) return;

  const goalId = formData.get("goalId");
  if (typeof goalId !== "string" || goalId === "") return;

  const goal = await prisma.goal.findFirst({
    where: { id: goalId, userId, status: "active" },
    select: { id: true, rank: true },
  });
  if (!goal || goal.rank === null) return;

  const below = await prisma.goal.findFirst({
    where: { userId, status: "active", rank: goal.rank + 1 },
    select: { id: true },
  });
  if (!below) return;

  await prisma.$transaction([
    prisma.goal.update({ where: { id: goalId }, data: { rank: goal.rank + 1 } }),
    prisma.goal.update({ where: { id: below.id }, data: { rank: goal.rank } }),
  ]);

  revalidatePath("/dashboard");
}
