import { test, expect } from '@playwright/test';

test('legacy edit route redirects back to main workspace', async ({ page }) => {
  await page.goto('/edit/legacy-note-id');
  await expect(page).toHaveURL(/\/main/);
});
