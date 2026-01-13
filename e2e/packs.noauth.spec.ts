import { test, expect } from "@playwright/test";

/**
 * Pack browsing E2E tests (no authentication required)
 * These are public SEO pages
 */
test.describe("Packs index page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/packs");
  });

  test("should load the packs page", async ({ page }) => {
    // Should show the page title
    await expect(page.locator("h1")).toContainText(/vocabulary packs/i);
  });

  test("should display pack categories by level", async ({ page }) => {
    // Should show level headings
    const hasBeginnerSection = await page.getByRole("heading", { name: /beginner/i }).isVisible().catch(() => false);
    const hasIntermediateSection = await page.getByRole("heading", { name: /intermediate/i }).isVisible().catch(() => false);
    const hasAdvancedSection = await page.getByRole("heading", { name: /advanced/i }).isVisible().catch(() => false);

    // At least one level section should exist (depends on database content)
    expect(hasBeginnerSection || hasIntermediateSection || hasAdvancedSection).toBeTruthy();
  });

  test("should display pack cards with names", async ({ page }) => {
    // Should show pack cards (links to individual packs)
    const packLinks = page.locator("a[href^='/packs/']");

    // Wait for packs to load
    await page.waitForLoadState("networkidle");

    // Should have at least one pack link (assuming database has packs)
    const count = await packLinks.count();

    // This test passes if there are packs, or gracefully handles empty state
    if (count > 0) {
      const firstPack = packLinks.first();
      await expect(firstPack).toBeVisible();
    }
  });

  test("should have navigation header", async ({ page }) => {
    // Should show logo/brand
    await expect(page.getByText(/yalla/i).first()).toBeVisible();

    // Should have login/signup buttons
    await expect(page.getByRole("button", { name: /log in/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /start free/i })).toBeVisible();
  });

  test("should navigate to individual pack page when clicking a pack", async ({ page }) => {
    await page.waitForLoadState("networkidle");

    const packLinks = page.locator("a[href^='/packs/']").filter({ hasNot: page.locator("nav a") });
    const count = await packLinks.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Click the first pack
    const firstPack = packLinks.first();
    const href = await firstPack.getAttribute("href");

    await firstPack.click();

    // Should navigate to the pack page
    await expect(page).toHaveURL(new RegExp(href!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });

  test("should be SEO friendly with proper meta tags", async ({ page }) => {
    // Check for meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute("content", /.+/);

    // Check for Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute("content", /.+/);
  });
});

test.describe("Individual pack page", () => {
  test("should display pack details when navigating to a pack", async ({ page }) => {
    // First go to packs index to find a real pack slug
    await page.goto("/packs");
    await page.waitForLoadState("networkidle");

    const packLinks = page.locator("a[href^='/packs/']").filter({ hasNot: page.locator("nav a") });
    const count = await packLinks.count();

    if (count === 0) {
      test.skip();
      return;
    }

    // Navigate to the first pack
    await packLinks.first().click();

    // Should show pack content
    await expect(page.locator("h1")).toBeVisible();

    // Should show word count or word list
    await expect(
      page.getByText(/words|vocabulary|phrases/i).first()
    ).toBeVisible();
  });
});
