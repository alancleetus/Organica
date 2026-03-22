import { test, expect } from '@playwright/test';

test('saving edit persists updated note data', async ({ page }) => {
  await page.goto('/main');

  const title = `e2e-nav-${Date.now()}`;
  const waitForNextMinuteBoundary = async () => {
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    await page.waitForTimeout(msUntilNextMinute + 1000);
  };

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

  const card = page.locator('article.note-card', {
    has: page.getByText(title),
  });
  const originalDateText = await card.getByTestId('note-card-date').textContent();

  await waitForNextMinuteBoundary();

  // ------------------------
  // Navigate to edit page via menu
  // ------------------------
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

  const updatedCardWithNewTitle = page.locator('article.note-card', {
    has: page.getByText(updatedTitle),
  });
  await expect(updatedCardWithNewTitle.getByTestId('note-card-date')).not.toHaveText(
    originalDateText || ''
  );

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
