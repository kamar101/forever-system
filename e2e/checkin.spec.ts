import { test, expect } from "@playwright/test";

// Slice 6: a user ticks the Tasks in today's Assignment as done (Check-in). The
// Day turns green only once every item is completed, and reverts if an item is
// unticked. Completion lives on the snapshotted Assignment item (ADR-0004), so
// editing or deleting the underlying Task never rewrites a past Day.
//
// Requires a running, migrated Postgres (npm run db:up && npm run db:migrate).

async function signUpAndGoToDashboard(
  page: Parameters<Parameters<typeof test>[1]>[0],
  email: string,
) {
  await page.goto("/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function addGoalWithTasks(
  page: Parameters<Parameters<typeof test>[1]>[0],
  title: string,
  tasks: { description: string; gear: string }[],
) {
  await page.getByLabel("New Goal").fill(title);
  await page.getByRole("button", { name: "Add to Vault" }).click();
  const goal = page.getByRole("listitem").filter({ hasText: title });
  await expect(goal).toBeVisible();
  const taskForm = goal.locator(".task-form");
  for (const task of tasks) {
    await goal.getByLabel("New Task").fill(task.description);
    await taskForm.getByRole("combobox").selectOption(task.gear);
    await goal.getByRole("button", { name: "Add Task" }).click();
    await expect(
      goal.getByRole("listitem").filter({ hasText: task.description }),
    ).toBeVisible();
  }
}

async function activate(
  page: Parameters<Parameters<typeof test>[1]>[0],
  title: string,
) {
  await page
    .getByRole("listitem")
    .filter({ hasText: title })
    .getByRole("button", { name: "Activate" })
    .click();
}

test("the Day turns green only when every Assignment item is ticked", async ({
  page,
}) => {
  const email = `checkin-green+${Date.now()}@example.com`;
  await signUpAndGoToDashboard(page, email);

  // Two tasks at the same Gear so a single tick leaves the Day partial.
  await addGoalWithTasks(page, "Ship the feature", [
    { description: "Write the code", gear: "4" },
    { description: "Write the tests", gear: "4" },
    // Gear-1 safety net so the Goal can be activated; absent from a Good→Gear-4
    // Assignment, so it does not affect the green logic under test.
    { description: "Open the editor", gear: "1" },
  ]);
  await activate(page, "Ship the feature");

  const assignment = page.getByRole("region", { name: "Today's Assignment" });
  await assignment.getByLabel("Good").check();
  await assignment.getByRole("button", { name: "Take Pulse" }).click();
  await expect(assignment.getByText("Write the code")).toBeVisible();

  // No green Day before any Check-in.
  await expect(assignment.getByText(/Day complete — green/i)).not.toBeVisible();

  // Tick the first item — still partial, not green.
  await assignment.getByRole("button", { name: "Tick Write the code" }).click();
  await expect(assignment.getByText(/Day complete — green/i)).not.toBeVisible();

  // Tick the second item — now every item is done, so the Day is green.
  await assignment
    .getByRole("button", { name: "Tick Write the tests" })
    .click();
  await expect(assignment.getByText(/Day complete — green/i)).toBeVisible();

  // Untick one item — the Day reverts to not-green.
  await assignment
    .getByRole("button", { name: "Untick Write the code" })
    .click();
  await expect(assignment.getByText(/Day complete — green/i)).not.toBeVisible();
});

test("a green Day survives deleting the underlying Task (ADR-0004 snapshot)", async ({
  page,
}) => {
  const email = `checkin-snapshot+${Date.now()}@example.com`;
  await signUpAndGoToDashboard(page, email);

  await addGoalWithTasks(page, "Learn Spanish", [
    { description: "Practice vocab", gear: "1" },
  ]);
  await activate(page, "Learn Spanish");

  const assignment = page.getByRole("region", { name: "Today's Assignment" });
  await assignment.getByLabel("Worst").check();
  await assignment.getByRole("button", { name: "Take Pulse" }).click();
  await expect(assignment.getByText("Practice vocab")).toBeVisible();

  // Check in: tick the only item → Day is green.
  await assignment.getByRole("button", { name: "Tick Practice vocab" }).click();
  await expect(assignment.getByText(/Day complete — green/i)).toBeVisible();

  // Delete the underlying Task from the Active Goal card.
  const activeSection = page.getByRole("region", { name: "Active Goals" });
  await activeSection
    .getByRole("listitem")
    .filter({ hasText: "Practice vocab" })
    .getByRole("button", { name: "Delete Task" })
    .click();
  await expect(
    activeSection.getByText("Practice vocab", { exact: true }),
  ).not.toBeVisible();

  // The snapshotted Assignment item and the green Day both persist unchanged.
  await expect(assignment.getByText("Practice vocab")).toBeVisible();
  await expect(assignment.getByText(/Day complete — green/i)).toBeVisible();
});
