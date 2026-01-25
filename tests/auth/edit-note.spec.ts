import { test, expect } from '@playwright/test';

test('saving edit persists updated note data', async ({ page }) => {
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
  // Modify title and save
  // ------------------------
  const titleInput = page.locator('input.titleInput');
  await expect(titleInput).toBeVisible();

  const updatedTitle = `${title}-should-save`;
  await titleInput.fill(updatedTitle);

  await page.getByTestId('edit-note-save').click();

  // Back on main, updated title persists
  await expect(page).toHaveURL(/\/main/);
  await expect(page.getByText(updatedTitle)).toBeVisible();

  // ------------------------
  // Cleanup
  // ------------------------
  const updatedCard = page.locator('article.note-card', {
    has: page.getByText(updatedTitle),
  });

  await updatedCard.getByTestId('note-card-menu-button').click();
  await page.getByTestId('note-card-menu-delete-button').click();

  await expect(page.getByText(updatedTitle)).not.toBeVisible();
});
