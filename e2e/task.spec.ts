import { test, expect } from "@playwright/test";

// Slice 2: a signed-in user adds Tasks (each carrying a Gear) to a Goal, edits a
// Task's description, changes its Gear, and deletes a Task.
//
// Requires a running, migrated Postgres (npm run db:up && npm run db:migrate).
// Uses a unique email per run so it can be run repeatedly without a reset.
test("add, edit, re-gear and delete Tasks on a Goal", async ({ page }) => {
  const email = `task+${Date.now()}@example.com`;
  const password = "password123";

  // Fresh account + a Goal to hang Tasks on.
  await page.goto("/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  await page.getByLabel("New Goal").fill("Complete a Udemy course");
  await page.getByRole("button", { name: "Add to Vault" }).click();

  const goal = page.getByRole("listitem").filter({ hasText: "Complete a Udemy course" });
  await expect(goal).toBeVisible();
  await expect(goal.getByText("No Tasks yet.")).toBeVisible();

  // Add a Task at Gear 4 (the default).
  await goal.getByLabel("New Task").fill("Watch 30 min of the course");
  await goal.getByRole("button", { name: "Add Task" }).click();

  const task = goal.getByRole("listitem").filter({ hasText: "Watch 30 min of the course" });
  await expect(task).toBeVisible();
  // It lands under the Gear 4 heading.
  await expect(goal.getByRole("heading", { name: /Gear 4/ })).toBeVisible();

  // Edit the Task's description. Scope to the Goal: while editing, the old text
  // moves into an input value and the description span disappears.
  await goal.getByRole("button", { name: "Edit" }).click();
  await goal.getByLabel("Task description").fill("Watch 45 min of the course");
  await goal.getByRole("button", { name: "Save" }).click();
  await expect(
    goal.getByRole("listitem").filter({ hasText: "Watch 45 min of the course" }),
  ).toBeVisible();

  // Change the Task's Gear from 4 to 1 — it moves under the Gear 1 heading.
  const moved = goal.getByRole("listitem").filter({ hasText: "Watch 45 min of the course" });
  await moved.getByRole("combobox").selectOption("1");
  await expect(goal.getByRole("heading", { name: /Gear 1/ })).toBeVisible();
  await expect(goal.getByRole("heading", { name: /Gear 4/ })).toBeHidden();

  // The change survives a reload (persisted, not optimistic).
  await page.reload();
  const reloaded = page
    .getByRole("listitem")
    .filter({ hasText: "Complete a Udemy course" })
    .getByRole("listitem")
    .filter({ hasText: "Watch 45 min of the course" });
  await expect(reloaded.getByRole("combobox")).toHaveValue("1");

  // Delete the Task — the Goal returns to its empty-Task state.
  const goalAfterReload = page
    .getByRole("listitem")
    .filter({ hasText: "Complete a Udemy course" });
  await reloaded.getByRole("button", { name: "Delete Task" }).click();
  await expect(goalAfterReload.getByText("No Tasks yet.")).toBeVisible();
  await expect(goalAfterReload.getByRole("heading", { name: /Gear 1/ })).toBeHidden();
});
