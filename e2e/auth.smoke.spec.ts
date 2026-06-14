import { test, expect } from "@playwright/test";

// Smoke test: a new user signs up, lands on the empty dashboard, signs out,
// signs back in, and an unauthenticated visit is redirected to sign-in.
//
// Requires a running, migrated Postgres (npm run db:up && npm run db:migrate).
// Uses a unique email per run so it can be run repeatedly without a reset.
test("sign up → empty dashboard → sign out → sign in", async ({ page }) => {
  const email = `smoke+${Date.now()}@example.com`;
  const password = "password123";

  // Unauthenticated users are redirected to sign-in.
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/sign-in/);

  // Sign up.
  await page.goto("/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();

  // Land on the empty dashboard, scoped to this account.
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("heading", { name: "Your Day" })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  await expect(page.getByText("Your Vault is empty.")).toBeVisible();

  // Sign out → back to sign-in.
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in/);

  // Sign back in.
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Your Vault is empty.")).toBeVisible();
});
