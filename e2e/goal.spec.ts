import { test, expect } from "@playwright/test";

// Slice 1: a signed-in user creates a Goal and sees it listed in their Vault.
//
// Requires a running, migrated Postgres (npm run db:up && npm run db:migrate).
// Uses a unique email per run so it can be run repeatedly without a reset.
test("create a Goal → appears in the Vault", async ({ page }) => {
  const email = `goal+${Date.now()}@example.com`;
  const password = "password123";

  // Sign up to get a fresh, isolated account.
  await page.goto("/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/dashboard/);

  // Vault starts empty.
  await expect(page.getByText("Your Vault is empty.")).toBeVisible();

  // Create a Goal.
  const title = "Complete a Udemy course";
  await page.getByLabel("New Goal").fill(title);
  await page.getByRole("button", { name: "Add to Vault" }).click();

  // It appears in the Vault list, and the empty-state message is gone.
  await expect(page.getByRole("listitem").filter({ hasText: title })).toBeVisible();
  await expect(page.getByText("Your Vault is empty.")).toBeHidden();

  // It survives a reload (i.e. it was persisted, not just optimistic UI).
  await page.reload();
  await expect(page.getByRole("listitem").filter({ hasText: title })).toBeVisible();
});
