import { test, expect } from '@playwright/test';

test('Edit Note navigation, cancel edit, and cleanup', async ({ page }) => {
  await page.goto('/main');

  const title = `e2e-nav-${Date.now()}`;

  const noteListItemByTitle = (noteTitle: string) =>
    page.locator('.note-list-item', {
      has: page.locator('.note-list-item-title', { hasText: noteTitle }),
    });

  const noteCardByTitle = (noteTitle: string) =>
    page.locator('article.note-card', {
      has: page.locator('.note-title', { hasText: noteTitle }),
    });

  const focusNoteFromList = async (noteTitle: string) => {
    const noteListItem = noteListItemByTitle(noteTitle);
    await expect(noteListItem).toBeVisible();
    await noteListItem.click();
    await expect(noteCardByTitle(noteTitle)).toBeVisible();
  };

  await page.getByTestId('add-note-fab').click();
  await expect(page.getByTestId('add-note-modal')).toBeVisible();
  await page.getByTestId('note-title').fill(title);

  const editor = page.getByTestId('note-content');
  await editor.click();
  await page.keyboard.type('nav test');

  await page.getByTestId('note-save').click();
  await expect(page.getByTestId('add-note-modal')).not.toBeVisible();

  const card = noteCardByTitle(title);
  await expect(card).toBeVisible();

  await card.getByTestId('note-card-menu-button').click();
  await page.getByTestId('note-card-menu-edit-button').click();

  await expect(page).toHaveURL(/\/edit\/.+/);

  const titleInput = page.locator('input.titleInput');
  await expect(titleInput).toBeVisible();

  const attemptedTitle = `${title}-should-not-save`;
  await titleInput.fill(attemptedTitle);

  await page.locator('button.note-page-back-button').click();

  await expect(page).toHaveURL(/\/main/);
  await focusNoteFromList(title);
  await expect(page.getByRole('heading', { name: attemptedTitle })).not.toBeVisible();

  const refocusedCard = noteCardByTitle(title);
  await refocusedCard.getByTestId('note-card-menu-button').click();
  await page.getByTestId('note-card-menu-delete-button').click();

  await expect(refocusedCard).not.toBeVisible();
});
