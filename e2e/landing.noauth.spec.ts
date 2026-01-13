import { test, expect } from "@playwright/test";

/**
 * Landing page tests (no authentication required)
 */
test.describe("Landing page", () => {
  test("should display the landing page with hero section", async ({ page }) => {
    await page.goto("/");

    // Check for main heading
    await expect(page.locator("h1")).toBeVisible();

    // Check for CTA buttons
    await expect(
      page.getByRole("button", { name: /get started|sign up|start learning/i }).first()
    ).toBeVisible();
  });

  test("should open auth dialog when clicking CTA", async ({ page }) => {
    await page.goto("/");

    // Click the main CTA
    const ctaButton = page.getByRole("button", { name: /get started|sign up|start learning/i }).first();
    await ctaButton.click();

    // Auth dialog should appear
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");

    // Check for navigation
    const nav = page.locator("nav, header");
    await expect(nav).toBeVisible();
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Page should still be functional
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("Public pack pages", () => {
  test("should display pack listing page", async ({ page }) => {
    await page.goto("/packs");

    // Should show pack listing
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("About page", () => {
  test("should display about page", async ({ page }) => {
    await page.goto("/about");

    // Should load without errors
    await expect(page.locator("body")).toBeVisible();
  });
});
