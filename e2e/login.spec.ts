import { test, expect } from "@playwright/test";

/**
 * Login flow. Registers a fresh user first (login needs an existing
 * account), then exercises the actual login form end to end.
 */
async function registerFreshUser(page: import("@playwright/test").Page) {
  const unique = Date.now() + Math.floor(Math.random() * 1000);
  const email = `e2e-login-${unique}@example.com`;
  const username = `e2e_login_${unique}`;
  const password = "Test1234!Aa";

  await page.goto("/register");
  await page.getByPlaceholder("Иван").fill("Тест");
  await page.getByPlaceholder("ivan_dev").fill(username);
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.getByPlaceholder("Минимум 8 символов").fill(password);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Зарегистрироваться" }).click();
  await expect(page).toHaveURL(/\/(onboarding|dashboard)/, { timeout: 10_000 });

  return { email, password };
}

test.describe("Login", () => {
  test("an existing user can log in and reach the app", async ({ page }) => {
    const { email, password } = await registerFreshUser(page);

    // Log out (clear cookies simulates a fresh session) then log back in.
    await page.context().clearCookies();
    await page.goto("/login");

    await page.getByPlaceholder("you@example.com").fill(email);
    await page.getByPlaceholder("••••••••").fill(password);
    await page.getByRole("button", { name: "Войти" }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test("shows an error toast for wrong credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("you@example.com").fill("nobody-e2e@example.com");
    await page.getByPlaceholder("••••••••").fill("WrongPassword1!");
    await page.getByRole("button", { name: "Войти" }).click();

    await expect(page.getByText(/Неверный email или пароль/i)).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });

  test("an unauthenticated visitor is redirected away from protected pages", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
});
