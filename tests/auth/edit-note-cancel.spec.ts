import { test, expect } from '@playwright/test';

test('Edit Note navigation, cancel edit, and cleanup', async ({ page }) => {
  await page.goto('/main');

  const title = `e2e-nav-${Date.now()}`;

  // ------------------------
  // Create note
  // ------------------------
  await page.getByTestId('add-note-fab').click();
  await page.getByTestId('note-title').fill(title);

  const editor = page.getByTestId('note-content');
  await editor.click();
  await page.keyboard.type('nav test');

  await page.getByTestId('note-save').click();
  await expect(page).toHaveURL(/\/main/);
  await expect(page.getByText(title)).toBeVisible();

  // ------------------------
  // Navigate to edit page via menu
  // ------------------------
  const card = page.locator('article.note-card', {
    has: page.getByText(title),
  });

  await card.getByTestId('note-card-menu-button').click();
  await page.getByTestId('note-card-menu-edit-button').click();

  await expect(page).toHaveURL(/\/edit\/.+/);

  // ------------------------
  // Modify title but CANCEL
  // ------------------------
  const titleInput = page.locator('input.titleInput');
  await expect(titleInput).toBeVisible();

  const attemptedTitle = `${title}-should-not-save`;
  await titleInput.fill(attemptedTitle);

  // Click cancel / back button
  await page.locator('button.note-page-back-button').click();

  // Back on main, original title should still exist
  await expect(page).toHaveURL(/\/main/);
  await expect(page.getByText(title)).toBeVisible();
  await expect(page.getByText(attemptedTitle)).not.toBeVisible();

  // ------------------------
  // Cleanup: delete the note
  // ------------------------
  await card.getByTestId('note-card-menu-button').click();
  await page.getByTestId('note-card-menu-delete-button').click();

  await expect(page.getByText(title)).not.toBeVisible();
});
