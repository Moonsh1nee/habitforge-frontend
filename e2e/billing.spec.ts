import { test, expect } from "@playwright/test";

/**
 * Billing/upgrade flow. Stripe checkout isn't wired up yet (see
 * src/app/(app)/upgrade/page.tsx — "coming soon" toast), so this covers what
 * actually exists today: an authenticated user reaching /upgrade, seeing
 * accurate Free vs Pro plans, and the upgrade CTA firing without crashing.
 * Update this test alongside the real Stripe Checkout integration.
 */
async function registerFreshUser(page: import("@playwright/test").Page) {
  const unique = Date.now() + Math.floor(Math.random() * 1000);
  const email = `e2e-billing-${unique}@example.com`;
  const username = `e2e_billing_${unique}`;
  const password = "Test1234!Aa";

  await page.goto("/register");
  await page.getByPlaceholder("Иван").fill("Тест");
  await page.getByPlaceholder("ivan_dev").fill(username);
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Минимум 8 символов").fill(password);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Зарегистрироваться" }).click();
  await expect(page).toHaveURL(/\/(onboarding|dashboard)/, { timeout: 10_000 });
}

test.describe("Billing / upgrade", () => {
  test("an authenticated user can view pricing and the upgrade CTA responds", async ({ page }) => {
    await registerFreshUser(page);

    await page.goto("/upgrade");
    await expect(page.getByText("Разблокируй весь потенциал")).toBeVisible();
    await expect(page.getByText("499₽")).toBeVisible();

    await page.getByRole("button", { name: /Upgrade|Оформить|Начать с Pro/i }).click();

    // Stripe checkout isn't live yet — the button currently shows this toast.
    // When real Stripe Checkout ships, replace this assertion with a check
    // for the redirect to Stripe's hosted checkout page.
    await expect(page.getByText(/Оплата через Stripe скоро будет доступна/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  test("unauthenticated visitors are redirected to login before reaching /upgrade", async ({
    page,
  }) => {
    await page.context().clearCookies();
    await page.goto("/upgrade");
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
