import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");

/**
 * Authentication setup for E2E tests.
 *
 * This logs in using test credentials and saves the auth state
 * for reuse across all tests.
 *
 * Required environment variables:
 * - E2E_TEST_EMAIL: Test account email
 * - E2E_TEST_PASSWORD: Test account password
 *
 * To create a test account:
 * 1. Sign up on the app with a test email
 * 2. Set the env vars in .env.local or CI secrets
 */
setup("authenticate", async ({ page }) => {
  const testEmail = process.env.E2E_TEST_EMAIL;
  const testPassword = process.env.E2E_TEST_PASSWORD;

  if (!testEmail || !testPassword) {
    console.log(
      "E2E_TEST_EMAIL and E2E_TEST_PASSWORD not set. Creating placeholder auth file."
    );
    console.log("To run authenticated tests, set these environment variables.");

    // Create empty auth state so tests can still run (they'll fail on auth-required pages)
    await page.context().storageState({ path: authFile });
    return;
  }

  // Go to the landing page
  await page.goto("/");

  // Click a CTA to open the auth dialog
  const signupButton = page.getByRole("button", { name: /get started|sign up|start learning/i }).first();

  if (await signupButton.isVisible()) {
    await signupButton.click();
  } else {
    // Try clicking the nav sign in button
    await page.getByRole("button", { name: /sign in/i }).first().click();
  }

  // Wait for auth dialog to appear
  await expect(page.getByRole("dialog")).toBeVisible();

  // Fill in email
  await page.getByLabel(/email/i).fill(testEmail);
  await page.getByRole("button", { name: /continue/i }).click();

  // Fill in password
  await page.getByLabel(/password/i).fill(testPassword);
  await page.getByRole("button", { name: /continue/i }).click();

  // Wait for successful login - should redirect or close dialog
  await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });

  // Verify we're logged in by checking for authenticated UI elements
  await expect(
    page.getByText(/review|my words|dashboard/i).first()
  ).toBeVisible({ timeout: 10000 });

  // Save the auth state
  await page.context().storageState({ path: authFile });
});
