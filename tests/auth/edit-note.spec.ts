import { test, expect } from '@playwright/test';

test('saving edit persists updated note data', async ({ page }) => {
  test.setTimeout(70000);
  await page.goto('/main');

  const title = `e2e-nav-${Date.now()}`;
  const waitForNextMinuteBoundary = async () => {
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    await page.waitForTimeout(msUntilNextMinute + 1000);
  };

  await page.getByTestId('add-note-fab').click();
  await expect(page.getByTestId('add-note-modal')).toBeVisible();
  await page.getByTestId('note-title').fill(title);

  const editor = page.getByTestId('note-content');
  await editor.click();
  await page.keyboard.type('nav test');

  await page.getByTestId('note-save').click();
  await expect(page.getByTestId('add-note-modal')).not.toBeVisible();
  await expect(page.getByText(title)).toBeVisible();

  const card = page.locator('article.note-card', {
    has: page.getByText(title),
  });
  const originalDateText = await card.getByTestId('note-card-date').textContent();

  await waitForNextMinuteBoundary();

  await card.getByTestId('note-card-menu-button').click();
  await page.getByTestId('note-card-menu-edit-button').click();

  await expect(page).toHaveURL(/\/edit\/.+/);

  const titleInput = page.locator('input.titleInput');
  await expect(titleInput).toBeVisible();

  const updatedTitle = `${title}-should-save`;
  await titleInput.fill(updatedTitle);

  await page.getByTestId('edit-note-save').click();

  await expect(page).toHaveURL(/\/main/);
  await expect(page.getByText(updatedTitle)).toBeVisible();

  const updatedCardWithNewTitle = page.locator('article.note-card', {
    has: page.getByText(updatedTitle),
  });
  await expect(updatedCardWithNewTitle.getByTestId('note-card-date')).not.toHaveText(
    originalDateText || ''
  );

  await updatedCardWithNewTitle.getByTestId('note-card-menu-button').click();
  await page.getByRole('menuitem', { name: /delete note/i }).click();

  await expect(updatedCardWithNewTitle).not.toBeVisible();
});
