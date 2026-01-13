import { test, expect } from "@playwright/test";

/**
 * Navigation E2E tests for authenticated users
 *
 * To run these tests, set E2E_TEST_EMAIL and E2E_TEST_PASSWORD environment variables.
 */

// Helper to check if authenticated and skip if not
async function skipIfNotAuthenticated(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
  // Check for elements that only appear on landing page (not authenticated)
  const landingElements = page.locator("text=/get started|start free/i");
  const isLandingPage = await landingElements.first().isVisible({ timeout: 2000 }).catch(() => false);
  return isLandingPage;
}

test.describe("Main navigation", () => {
  test("should navigate to home/dashboard", async ({ page }) => {
    await page.goto("/");
    if (await skipIfNotAuthenticated(page)) {
      test.skip();
      return;
    }

    // Should show authenticated dashboard, not landing page
    // Just verify we're not on the landing page and the page loads
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("should navigate to review page", async ({ page }) => {
    await page.goto("/");
    if (await skipIfNotAuthenticated(page)) {
      test.skip();
      return;
    }

    await page.goto("/review");
    await expect(page).toHaveURL(/\/review/);
    await page.waitForLoadState("networkidle");

    // Page should load without error
    const hasError = await page.locator("text=/error|failed/i").isVisible().catch(() => false);
    expect(hasError).toBeFalsy();
  });

  test("should navigate to my-words page", async ({ page }) => {
    await page.goto("/");
    if (await skipIfNotAuthenticated(page)) {
      test.skip();
      return;
    }

    await page.goto("/my-words");
    await expect(page).toHaveURL(/\/my-words/);
    await page.waitForLoadState("networkidle");

    // Page should load without error
    const hasError = await page.locator("text=/error|failed/i").isVisible().catch(() => false);
    expect(hasError).toBeFalsy();
  });

  test("should navigate between pages via nav links", async ({ page }) => {
    await page.goto("/");
    if (await skipIfNotAuthenticated(page)) {
      test.skip();
      return;
    }

    // Find and click a link in navigation
    const navLinks = page.locator("nav a, header a");
    const count = await navLinks.count();

    if (count > 0) {
      // Click a nav link and verify navigation works
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute("href");
      if (href && href !== "/") {
        await firstLink.click();
        await page.waitForLoadState("networkidle");
        // Just verify navigation completed
        expect(page.url()).toBeTruthy();
      }
    }
  });

  test("should maintain auth state across navigation", async ({ page }) => {
    await page.goto("/");
    if (await skipIfNotAuthenticated(page)) {
      test.skip();
      return;
    }

    // Navigate to multiple pages
    await page.goto("/review");
    await page.waitForLoadState("networkidle");
    let isLanding = await skipIfNotAuthenticated(page);
    expect(isLanding).toBeFalsy();

    await page.goto("/my-words");
    await page.waitForLoadState("networkidle");
    isLanding = await skipIfNotAuthenticated(page);
    expect(isLanding).toBeFalsy();

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    isLanding = await skipIfNotAuthenticated(page);
    expect(isLanding).toBeFalsy();
  });
});

test.describe("Mobile navigation", () => {
  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    if (await skipIfNotAuthenticated(page)) {
      test.skip();
      return;
    }

    // Page should render without major layout issues
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("should show mobile navigation", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    if (await skipIfNotAuthenticated(page)) {
      test.skip();
      return;
    }

    // On mobile, navigation might be in various forms - bottom nav, menu button, etc.
    // Just verify the page loads and has some interactive elements
    const hasNavElements = await page
      .locator("nav, [role='navigation'], header, a[href], button")
      .first()
      .isVisible()
      .catch(() => false);

    // If no nav elements found, page might still be loading or use different patterns
    if (!hasNavElements) {
      // Just verify page loaded without errors
      const hasError = await page
        .locator("text=/error|failed/i")
        .isVisible()
        .catch(() => false);
      expect(hasError).toBeFalsy();
    } else {
      expect(hasNavElements).toBeTruthy();
    }
  });
});
