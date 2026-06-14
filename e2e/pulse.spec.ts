import { test, expect } from "@playwright/test";

// Slice 4: a user with an Active Goal can take a Pulse (declare Capacity) and
// receive a snapshotted Assignment showing their Tasks at that Gear.
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
  // Scope gear select to the task-form (.task-form) to avoid matching gear
  // selects on already-added task items.
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

test("cannot Pulse without an Active Goal", async ({ page }) => {
  const email = `pulse-no-goal+${Date.now()}@example.com`;
  await signUpAndGoToDashboard(page, email);

  const assignmentSection = page.getByRole("region", {
    name: "Today's Assignment",
  });
  await expect(
    assignmentSection.getByText(/Activate a Goal first/i),
  ).toBeVisible();
  await expect(
    assignmentSection.getByRole("button", { name: "Take Pulse" }),
  ).not.toBeVisible();
});

test("taking a Pulse shows the Assignment's Tasks at the selected Gear", async ({
  page,
}) => {
  const email = `pulse-basic+${Date.now()}@example.com`;
  await signUpAndGoToDashboard(page, email);

  // Create a Goal with tasks at multiple Gears and activate it.
  await addGoalWithTasks(page, "Complete a Udemy course", [
    { description: "Watch 30 min of video", gear: "4" },
    { description: "Read the summary notes", gear: "3" },
    { description: "Skim one chapter", gear: "2" },
    { description: "Open the app", gear: "1" },
  ]);
  await page
    .getByRole("listitem")
    .filter({ hasText: "Complete a Udemy course" })
    .getByRole("button", { name: "Activate" })
    .click();

  // Take a Pulse with "Good" capacity → Gear 4.
  const assignmentSection = page.getByRole("region", {
    name: "Today's Assignment",
  });
  await assignmentSection.getByLabel("Good").check();
  await assignmentSection.getByRole("button", { name: "Take Pulse" }).click();

  // Only the Gear-4 task should appear.
  await expect(
    assignmentSection.getByText("Watch 30 min of video"),
  ).toBeVisible();
  await expect(
    assignmentSection.getByText("Read the summary notes"),
  ).not.toBeVisible();
  await expect(assignmentSection.getByText("G4")).toBeVisible();
  await expect(assignmentSection.locator("strong", { hasText: "Good" })).toBeVisible();
});

test("Assignment is snapshotted — editing a Task after the Pulse does not change it", async ({
  page,
}) => {
  const email = `pulse-snapshot+${Date.now()}@example.com`;
  await signUpAndGoToDashboard(page, email);

  await addGoalWithTasks(page, "Learn Spanish", [
    { description: "Practice vocab", gear: "1" },
  ]);
  await page
    .getByRole("listitem")
    .filter({ hasText: "Learn Spanish" })
    .getByRole("button", { name: "Activate" })
    .click();

  // Pulse with Worst capacity → Gear 1.
  const assignmentSection = page.getByRole("region", {
    name: "Today's Assignment",
  });
  await assignmentSection.getByLabel("Worst").check();
  await assignmentSection.getByRole("button", { name: "Take Pulse" }).click();
  await expect(assignmentSection.getByText("Practice vocab")).toBeVisible();

  // Edit the task description via the Active Goal card (click Edit first, then fill).
  const activeSection = page.getByRole("region", { name: "Active Goals" });
  const taskItem = activeSection.getByRole("listitem").filter({ hasText: "Practice vocab" });
  await taskItem.getByRole("button", { name: "Edit" }).click();
  await taskItem.getByLabel("Task description").fill("Practice vocabulary flashcards");
  await taskItem.getByRole("button", { name: "Save" }).click();
  await expect(
    activeSection.getByText("Practice vocabulary flashcards", { exact: true }),
  ).toBeVisible();

  // The snapshotted Assignment still shows the original description.
  await expect(assignmentSection.getByText("Practice vocab")).toBeVisible();
  await expect(
    assignmentSection.getByText("Practice vocabulary flashcards"),
  ).not.toBeVisible();
});

test("re-Pulsing replaces today's Assignment", async ({ page }) => {
  const email = `pulse-repulse+${Date.now()}@example.com`;
  await signUpAndGoToDashboard(page, email);

  await addGoalWithTasks(page, "Run a 5K", [
    { description: "Run 5K at full pace", gear: "4" },
    { description: "Jog for 20 min", gear: "3" },
    { description: "Walk briskly for 10 min", gear: "1" },
  ]);
  await page
    .getByRole("listitem")
    .filter({ hasText: "Run a 5K" })
    .getByRole("button", { name: "Activate" })
    .click();

  const assignmentSection = page.getByRole("region", {
    name: "Today's Assignment",
  });

  // First Pulse: Good → Gear 4.
  await assignmentSection.getByLabel("Good").check();
  await assignmentSection.getByRole("button", { name: "Take Pulse" }).click();
  await expect(assignmentSection.getByText("Run 5K at full pace")).toBeVisible();

  // Re-Pulse with Worst → Gear 1 replaces the Assignment.
  // The re-pulse toggle is a <details><summary> element, not a button.
  await assignmentSection.locator("summary", { hasText: "Re-Pulse" }).click();
  await assignmentSection.getByLabel("Worst").check();
  await assignmentSection.getByRole("button", { name: "Take Pulse" }).click();

  await expect(
    assignmentSection.getByText("Walk briskly for 10 min"),
  ).toBeVisible();
  await expect(
    assignmentSection.getByText("Run 5K at full pace"),
  ).not.toBeVisible();
});
