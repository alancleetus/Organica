import { test, expect } from '@playwright/test';

test('editing note title in the detail pane autosaves and persists', async ({ page }) => {
  test.setTimeout(70000);
  await page.goto('/main');

  const title = `e2e-nav-${Date.now()}`;
  const waitForNextMinuteBoundary = async () => {
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    await page.waitForTimeout(msUntilNextMinute + 1000);
  };

  const noteListItemByTitle = (noteTitle: string) =>
    page.locator('.note-list-item', {
      has: page.locator('.note-list-item-title', { hasText: noteTitle }),
    });

  const detailCard = () => page.locator('article.note-card').first();

  const focusNoteFromList = async (noteTitle: string) => {
    const noteListItem = noteListItemByTitle(noteTitle);
    await expect(noteListItem).toBeVisible();
    await noteListItem.click();
    await expect(detailCard().getByTestId('note-card-title-input')).toHaveValue(noteTitle);
  };

  await page.getByTestId('add-note-fab').click();
  await expect(page.getByTestId('add-note-modal')).toBeVisible();
  await page.getByTestId('note-title').fill(title);

  const editor = page.getByTestId('note-content');
  await editor.click();
  await page.keyboard.type('nav test');

  await page.getByTestId('note-save').click();
  await expect(page.getByTestId('add-note-modal')).not.toBeVisible();

  const card = detailCard();
  await expect(card.getByTestId('note-card-title-input')).toHaveValue(title);
  const originalDateText = await card.getByTestId('note-card-date').textContent();

  await waitForNextMinuteBoundary();

  const updatedTitle = `${title}-should-save`;
  await card.getByTestId('note-card-title-input').fill(updatedTitle);

  await expect(card.getByTestId('note-card-save')).toBeVisible();
  await page.waitForTimeout(3000);
  await expect(card.getByTestId('note-card-save')).not.toBeVisible();

  await page.reload();
  await focusNoteFromList(updatedTitle);

  await expect(detailCard().getByTestId('note-card-date')).not.toHaveText(
    originalDateText || ''
  );

  await detailCard().getByTestId('note-card-menu-button').click();
  await page.getByRole('menuitem', { name: /delete note/i }).click();

  await expect(noteListItemByTitle(updatedTitle)).not.toBeVisible();
});
