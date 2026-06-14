import { test, expect } from "@playwright/test";

// Slice 3: a signed-in user can activate Goals (moving them from the Vault to
// Active Goals), set their priority ranking, and deactivate them back.
//
// Requires a running, migrated Postgres (npm run db:up && npm run db:migrate).
// Uses a unique email per run so it can be run repeatedly without a reset.

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

async function addGoalWithGear1Task(
  page: Parameters<Parameters<typeof test>[1]>[0],
  title: string,
) {
  await page.getByLabel("New Goal").fill(title);
  await page.getByRole("button", { name: "Add to Vault" }).click();
  const goal = page.getByRole("listitem").filter({ hasText: title });
  await expect(goal).toBeVisible();
  // Add a Gear-1 (worst-day safety net) Task.
  await goal.getByLabel("New Task").fill("Do the minimum");
  await goal.getByRole("combobox", { name: "Gear" }).selectOption("1");
  await goal.getByRole("button", { name: "Add Task" }).click();
  await expect(goal.getByRole("listitem").filter({ hasText: "Do the minimum" })).toBeVisible();
}

test("cannot activate a Goal without a Gear-1 Task", async ({ page }) => {
  const email = `activate-block+${Date.now()}@example.com`;
  await signUpAndGoToDashboard(page, email);

  // Create a Goal with only a Gear-4 Task (no safety net).
  await page.getByLabel("New Goal").fill("Learn Spanish");
  await page.getByRole("button", { name: "Add to Vault" }).click();
  const goal = page.getByRole("listitem").filter({ hasText: "Learn Spanish" });
  await goal.getByLabel("New Task").fill("Study vocab for 30 min");
  await goal.getByRole("button", { name: "Add Task" }).click();
  await expect(goal.getByRole("listitem").filter({ hasText: "Study vocab for 30 min" })).toBeVisible();

  // The Activate button should be disabled or absent, and a hint message shown.
  await expect(goal.getByRole("button", { name: "Activate" })).toBeDisabled();
  await expect(goal.getByText(/Gear.?1 task/i)).toBeVisible();
});

test("activate a Goal → appears in Active Goals; deactivate → returns to Vault", async ({
  page,
}) => {
  const email = `activate-flow+${Date.now()}@example.com`;
  await signUpAndGoToDashboard(page, email);

  await addGoalWithGear1Task(page, "Complete a Udemy course");

  // Active Goals section starts empty.
  const activeSection = page.getByRole("region", { name: "Active Goals" });
  await expect(activeSection.getByText("No active Goals yet.")).toBeVisible();

  // Activate the Goal.
  const vaultGoal = page.getByRole("listitem").filter({ hasText: "Complete a Udemy course" });
  await vaultGoal.getByRole("button", { name: "Activate" }).click();

  // It moves to Active Goals and the Vault becomes empty.
  const activeGoal = activeSection.getByRole("listitem").filter({
    hasText: "Complete a Udemy course",
  });
  await expect(activeGoal).toBeVisible();
  await expect(activeGoal.getByText("#1")).toBeVisible();
  await expect(page.getByText("Your Vault is empty.")).toBeVisible();

  // Deactivate → back to Vault.
  await activeGoal.getByRole("button", { name: "Deactivate" }).click();
  await expect(page.getByRole("listitem").filter({ hasText: "Complete a Udemy course" })).toBeVisible();
  await expect(activeSection.getByText("No active Goals yet.")).toBeVisible();

  // Persisted across reload.
  await page.reload();
  await expect(page.getByRole("listitem").filter({ hasText: "Complete a Udemy course" })).toBeVisible();
  await expect(activeSection.getByText("No active Goals yet.")).toBeVisible();
});

test("cannot activate more than 5 Active Goals", async ({ page }) => {
  const email = `activate-cap+${Date.now()}@example.com`;
  await signUpAndGoToDashboard(page, email);

  // Create and activate 5 Goals.
  for (let i = 1; i <= 5; i++) {
    await addGoalWithGear1Task(page, `Goal ${i}`);
    const goal = page.getByRole("listitem").filter({ hasText: `Goal ${i}` }).first();
    await goal.getByRole("button", { name: "Activate" }).click();
    await expect(
      page.getByRole("region", { name: "Active Goals" }).getByRole("listitem").filter({ hasText: `Goal ${i}` }),
    ).toBeVisible();
  }

  // Add a 6th Goal with a Gear-1 Task — its Activate button should be disabled.
  await addGoalWithGear1Task(page, "Goal 6");
  const goal6 = page.getByRole("listitem").filter({ hasText: "Goal 6" }).first();
  await expect(goal6.getByRole("button", { name: "Activate" })).toBeDisabled();
  await expect(goal6.getByText(/active goal/i)).toBeVisible();
});

test("re-order Active Goals with Move Up / Move Down", async ({ page }) => {
  const email = `reorder+${Date.now()}@example.com`;
  await signUpAndGoToDashboard(page, email);

  // Activate two Goals in order: Alpha (#1), Beta (#2).
  await addGoalWithGear1Task(page, "Alpha");
  await page
    .getByRole("listitem")
    .filter({ hasText: "Alpha" })
    .getByRole("button", { name: "Activate" })
    .click();

  await addGoalWithGear1Task(page, "Beta");
  await page
    .getByRole("listitem")
    .filter({ hasText: "Beta" })
    .getByRole("button", { name: "Activate" })
    .click();

  const activeSection = page.getByRole("region", { name: "Active Goals" });
  const alpha = activeSection.getByRole("listitem").filter({ hasText: "Alpha" });
  const beta = activeSection.getByRole("listitem").filter({ hasText: "Beta" });

  await expect(alpha.getByText("#1")).toBeVisible();
  await expect(beta.getByText("#2")).toBeVisible();

  // Move Beta up → Beta becomes #1, Alpha becomes #2.
  await beta.getByRole("button", { name: "Move Up" }).click();
  await expect(beta.getByText("#1")).toBeVisible();
  await expect(alpha.getByText("#2")).toBeVisible();

  // Move Alpha down → same effect (Alpha from #2 → #2, no-op if already last).
  // Move Beta down → Beta returns to #2.
  await beta.getByRole("button", { name: "Move Down" }).click();
  await expect(alpha.getByText("#1")).toBeVisible();
  await expect(beta.getByText("#2")).toBeVisible();

  // Persisted across reload.
  await page.reload();
  const alphaR = activeSection.getByRole("listitem").filter({ hasText: "Alpha" });
  const betaR = activeSection.getByRole("listitem").filter({ hasText: "Beta" });
  await expect(alphaR.getByText("#1")).toBeVisible();
  await expect(betaR.getByText("#2")).toBeVisible();
});
