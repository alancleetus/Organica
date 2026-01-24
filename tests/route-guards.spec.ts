import { test, expect } from '@playwright/test';

test.describe('Route Guards', () => {
  test('unauthenticated user is redirected from /main to /login', async ({ page }) => {
    // Ensure "logged out" state
    await page.context().clearCookies();
    await page.goto('about:blank');
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/main');
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByTestId('login-submit')).toBeVisible();
  });

  test('unauthenticated user is redirected from /edit/:id to /login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('about:blank');
    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto('/edit/123');
    await expect(page).toHaveURL(/\/login/);
  });

  test('authenticated user is redirected from /login to /main (PublicOnlyRoute)', async ({ page }) => {
    // Log in via UI
    await page.goto('/login');

    await page.getByTestId('login-username').fill('test@gmail.com');
    await page.getByTestId('login-password').fill('testpassword');

    await Promise.all([
      page.waitForURL(/\/main/),
      page.getByTestId('login-submit').click(),
    ]);

    // Now try to access /login while authenticated
    await page.goto('/login');
    await expect(page).toHaveURL(/\/main/);
  });

  test('authenticated user is redirected from / to /main', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-username').fill('test@gmail.com');
    await page.getByTestId('login-password').fill('testpassword');

    await Promise.all([
      page.waitForURL(/\/main/),
      page.getByTestId('login-submit').click(),
    ]);

    await page.goto('/');
    await expect(page).toHaveURL(/\/main/);
  });
});
