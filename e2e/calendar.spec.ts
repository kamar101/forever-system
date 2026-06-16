import { test, expect } from "@playwright/test";

// Slice 8: the contribution calendar. A GitHub-style grid of the user's Days.
// A completed Day renders green; every other Day (Pulsed-but-incomplete, or
// never Pulsed) renders empty. Green is uniform regardless of Gear, and there
// is no red or yellow state. Completing today's Assignment turns today's cell
// green.
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

test("a fresh account's calendar shows only empty cells — no green, no red, no yellow", async ({
  page,
}) => {
  await signUpAndGoToDashboard(page, `calendar-empty+${Date.now()}@example.com`);

  const calendar = page.getByRole("region", { name: "Contribution calendar" });
  await expect(calendar).toBeVisible();

  // The full rolling-year grid is present (53 weeks), but nothing is green.
  await expect(calendar.locator(".calendar-cell")).toHaveCount(53 * 7);
  await expect(calendar.locator(".calendar-cell.green")).toHaveCount(0);
});

test("completing today's Assignment turns today's calendar cell green", async ({
  page,
}) => {
  await signUpAndGoToDashboard(page, `calendar-green+${Date.now()}@example.com`);

  // A one-Task Goal so a single Check-in completes the Day.
  await page.getByLabel("New Goal").fill("Learn Spanish");
  await page.getByRole("button", { name: "Add to Vault" }).click();
  const goal = page.getByRole("listitem").filter({ hasText: "Learn Spanish" });
  await goal.getByLabel("New Task").fill("Practice vocab");
  await goal.locator(".task-form").getByRole("combobox").selectOption("1");
  await goal.getByRole("button", { name: "Add Task" }).click();
  await expect(
    goal.getByRole("listitem").filter({ hasText: "Practice vocab" }),
  ).toBeVisible();
  await goal.getByRole("button", { name: "Activate" }).click();

  const calendar = page.getByRole("region", { name: "Contribution calendar" });
  // No green Day yet.
  await expect(calendar.locator(".calendar-cell.green")).toHaveCount(0);

  // Pulse and check in the only item → the Day is green.
  const assignment = page.getByRole("region", { name: "Today's Assignment" });
  await assignment.getByLabel("Worst").check();
  await assignment.getByRole("button", { name: "Take Pulse" }).click();
  await assignment.getByRole("button", { name: "Tick Practice vocab" }).click();
  await expect(assignment.getByText(/Day complete — green/i)).toBeVisible();

  // Exactly one green cell, and it is today's.
  await expect(calendar.locator(".calendar-cell.green")).toHaveCount(1);
  const today = new Date().toISOString().slice(0, 10);
  await expect(calendar.locator(`.calendar-cell.green[title="${today}"]`)).toBeVisible();
});
