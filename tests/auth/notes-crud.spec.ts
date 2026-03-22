import { test, expect, Page, Locator } from '@playwright/test';

/**
 * Helpers
 */
function detailCard(page: Page): Locator {
  return page.locator('article.note-card').first();
}

async function createNote(page: Page, title: string, content: string) {
  await page.getByTestId('add-note-fab').click();
  await expect(page.getByTestId('add-note-modal')).toBeVisible();
  await expect(page.getByTestId('note-title')).toBeVisible();

  await page.getByTestId('note-title').fill(title);
  await page.getByTestId('note-content').fill(content);

  await page.getByTestId('note-save').click();

  await expect(page.getByTestId('add-note-modal')).not.toBeVisible();
  await expect(noteListItemByTitle(page, title)).toBeVisible();
  await expect(detailCard(page).getByTestId('note-card-title-input')).toHaveValue(title);
}

function noteListItemByTitle(page: Page, title: string): Locator {
  return page.locator('.note-list-item', {
    has: page.locator('.note-list-item-title', { hasText: title }),
  });
}

async function focusNoteFromList(page: Page, title: string) {
  const noteListItem = noteListItemByTitle(page, title);
  await expect(noteListItem).toBeVisible();
  await noteListItem.click();
  await expect(detailCard(page).getByTestId('note-card-title-input')).toHaveValue(title);
}

async function deleteSelectedNote(page: Page, title: string) {
  await focusNoteFromList(page, title);
  const card = detailCard(page);

  await card.getByTestId('note-card-menu-button').click();
  await page.getByRole('menuitem', { name: /delete note/i }).click();
  await expect(noteListItemByTitle(page, title)).not.toBeVisible();
}

test.describe('Notes CRUD (Firestore)', () => {
  test('create note, refresh persists, then delete', async ({ page }) => {
    await page.goto('/main');
    await expect(page.getByTestId('add-note-fab')).toBeVisible();

    const title = `e2e-${Date.now()}`;
    const content = `Playwright content ${Date.now()}`;

    await createNote(page, title, content);

    await page.reload();
    await focusNoteFromList(page, title);

    await deleteSelectedNote(page, title);
  });

  test('cancel add-note closes modal without creating', async ({ page }) => {
    await page.goto('/main');
    await page.getByTestId('add-note-fab').click();

    await expect(page.getByTestId('add-note-modal')).toBeVisible();
    await expect(page.getByTestId('note-title')).toBeVisible();
    await page.getByTestId('note-title').fill(`should-not-save-${Date.now()}`);

    await page.getByTestId('cancel-add-note').click();
    await expect(page.getByTestId('add-note-modal')).not.toBeVisible();
  });

  test('logout redirects user away from protected routes', async ({ page }) => {
    await page.goto('/main');
    await expect(page.getByTestId('logout-button')).toBeVisible();

    await page.getByTestId('logout-button').click();

    await page.goto('/main');
    await expect(page).toHaveURL(/\/login/);
  });

  test('inline note edits autosave after typing stops and persist after reload', async ({ page }) => {
    await page.goto('/main');

    const title = `e2e-autosave-${Date.now()}`;
    const initialContent = `Initial content ${Date.now()}`;
    const updatedContent = `Autosaved content ${Date.now()}`;

    await createNote(page, title, initialContent);

    const card = detailCard(page);
    const contentArea = card.getByTestId('note-card-content-editor');
    await contentArea.fill(updatedContent);

    await expect(card.getByTestId('note-card-save')).toBeVisible();
    await page.waitForTimeout(3000);
    await expect(card.getByTestId('note-card-save')).not.toBeVisible();

    await page.reload();
    await focusNoteFromList(page, title);
    await expect(detailCard(page).getByTestId('note-card-content-editor')).toHaveValue(updatedContent);

    await deleteSelectedNote(page, title);
  });

  test('task lines persist after reload', async ({ page }) => {
    await page.goto('/main');

    const title = `e2e-task-autosave-${Date.now()}`;

    await page.getByTestId('add-note-fab').click();
    await expect(page.getByTestId('add-note-modal')).toBeVisible();
    await expect(page.getByTestId('note-title')).toBeVisible();

    await page.getByTestId('note-title').fill(title);
    await page.getByTestId('add-note-modal').getByTestId('toggle-task-list').click();
    await page.getByTestId('note-content').click();
    await page.keyboard.type('Checkbox item');

    await page.getByTestId('note-save').click();
    await expect(page.getByTestId('add-note-modal')).not.toBeVisible();
    await expect(noteListItemByTitle(page, title)).toBeVisible();

    const card = detailCard(page);
    const contentArea = card.getByTestId('note-card-content-editor');

    await contentArea.fill('[x] Checkbox item');
    await expect(card.getByTestId('note-card-save')).toBeVisible();
    await page.waitForTimeout(3000);
    await expect(card.getByTestId('note-card-save')).not.toBeVisible();

    await page.reload();

    await focusNoteFromList(page, title);
    await expect(detailCard(page).getByTestId('note-card-content-editor')).toHaveValue('[x] Checkbox item');

    await deleteSelectedNote(page, title);
  });
});

