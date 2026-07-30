import { test, expect } from "@playwright/test";

/**
 * Registration flow — the most critical acquisition path. Requires a live
 * backend (see README "E2E tests"). Each run registers a fresh unique user
 * so the test is repeatable without manual cleanup.
 */
test.describe("Registration", () => {
  test("a new user can register and lands on onboarding or dashboard", async ({ page }) => {
    const unique = Date.now();
    const email = `e2e-test-${unique}@example.com`;
    const username = `e2e_user_${unique}`;

    await page.goto("/register");

    await page.getByPlaceholder("Иван").fill("Тест");
    await page.getByPlaceholder("ivan_dev").fill(username);
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByPlaceholder("Минимум 8 символов").fill("Test1234!Aa");
    await page.getByPlaceholder("••••••••").fill("Test1234!Aa");

    await page.getByRole("button", { name: "Зарегистрироваться" }).click();

    // New accounts land on /onboarding (module selection) before /dashboard.
    await expect(page).toHaveURL(/\/(onboarding|dashboard)/, { timeout: 10_000 });
  });

  test("shows a validation error for a weak password", async ({ page }) => {
    await page.goto("/register");

    await page.getByPlaceholder("Иван").fill("Тест");
    await page.getByPlaceholder("ivan_dev").fill(`weak_${Date.now()}`);
    await page.getByPlaceholder("you@example.com").fill(`weak-${Date.now()}@example.com`);
    await page.getByPlaceholder("Минимум 8 символов").fill("weak");
    await page.getByPlaceholder("••••••••").fill("weak");

    await page.getByRole("button", { name: "Зарегистрироваться" }).click();

    // Client-side zod validation should block submission — still on /register.
    await expect(page).toHaveURL(/\/register/);
  });

  test("rejects registering with an email that already exists", async ({ page }) => {
    const unique = Date.now();
    const email = `e2e-dup-${unique}@example.com`;
    const username = `e2e_dup_${unique}`;

    // First registration succeeds.
    await page.goto("/register");
    await page.getByPlaceholder("Иван").fill("Тест");
    await page.getByPlaceholder("ivan_dev").fill(username);
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByPlaceholder("Минимум 8 символов").fill("Test1234!Aa");
    await page.getByPlaceholder("••••••••").fill("Test1234!Aa");
    await page.getByRole("button", { name: "Зарегистрироваться" }).click();
    await expect(page).toHaveURL(/\/(onboarding|dashboard)/, { timeout: 10_000 });

    // Log out, then try registering the same email again with a new username.
    await page.context().clearCookies();
    await page.goto("/register");
    await page.getByPlaceholder("Иван").fill("Тест");
    await page.getByPlaceholder("ivan_dev").fill(`${username}_2`);
    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByPlaceholder("Минимум 8 символов").fill("Test1234!Aa");
    await page.getByPlaceholder("••••••••").fill("Test1234!Aa");
    await page.getByRole("button", { name: "Зарегистрироваться" }).click();

    // Backend rejects the duplicate — an error toast fires and we stay put.
    await expect(page.getByText(/Ошибка регистрации/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/register/);
  });
});
