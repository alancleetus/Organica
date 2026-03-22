import { test, expect, Page, Locator } from '@playwright/test';

/**
 * Helpers
 */
async function createNote(page: Page, title: string, content: string) {
  await page.getByTestId('add-note-fab').click();
  await expect(page.getByTestId('add-note-modal')).toBeVisible();
  await expect(page.getByTestId('note-title')).toBeVisible();

  await page.getByTestId('note-title').fill(title);

  const editor = page.getByTestId('note-content');
  await editor.click();
  await page.keyboard.type(content);

  await page.getByTestId('note-save').click();

  await expect(page.getByTestId('add-note-modal')).not.toBeVisible();
  await expect(noteCardByTitle(page, title)).toBeVisible();
}

function noteListItemByTitle(page: Page, title: string): Locator {
  return page.locator('.note-list-item', {
    has: page.locator('.note-list-item-title', { hasText: title }),
  });
}

function noteCardByTitle(page: Page, title: string): Locator {
  return page.locator('article.note-card', {
    has: page.locator('.note-title', { hasText: title }),
  });
}

async function focusNoteFromList(page: Page, title: string) {
  const noteListItem = noteListItemByTitle(page, title);
  await expect(noteListItem).toBeVisible();
  await noteListItem.click();
  await expect(noteCardByTitle(page, title)).toBeVisible();
}

async function deleteNoteFromCard(page: Page, title: string) {
  await focusNoteFromList(page, title);
  const card = noteCardByTitle(page, title);

  await card.getByTestId('note-card-menu-button').click();
  await page.getByRole('menuitem', { name: /delete note/i }).click();
  await expect(noteCardByTitle(page, title)).not.toBeVisible();
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

    await deleteNoteFromCard(page, title);
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

    const card = noteCardByTitle(page, title);
    const contentArea = card.getByTestId('note-card-content').locator('.ProseMirror');

    await contentArea.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type(updatedContent);

    await expect(card.getByTestId('note-card-save')).toBeVisible();
    await page.waitForTimeout(3000);
    await expect(card.getByTestId('note-card-save')).not.toBeVisible();

    await page.reload();
    await focusNoteFromList(page, title);
    await expect(noteCardByTitle(page, title).getByText(updatedContent)).toBeVisible();

    await deleteNoteFromCard(page, title);
  });

  test('task checkbox changes autosave and persist after reload', async ({ page }) => {
    await page.goto('/main');

    const title = `e2e-task-autosave-${Date.now()}`;

    await page.getByTestId('add-note-fab').click();
    await expect(page.getByTestId('add-note-modal')).toBeVisible();
    await expect(page.getByTestId('note-title')).toBeVisible();

    await page.getByTestId('note-title').fill(title);
    await page.getByTestId('toggle-task-list').click();

    const editor = page.getByTestId('note-content');
    await editor.click();
    await page.keyboard.type('Checkbox item');

    await page.getByTestId('note-save').click();
    await expect(page.getByTestId('add-note-modal')).not.toBeVisible();
    await expect(noteCardByTitle(page, title)).toBeVisible();

    const card = noteCardByTitle(page, title);
    const checkbox = card.locator('input[type="checkbox"]').first();

    await checkbox.check();
    await expect(card.getByTestId('note-card-save')).toBeVisible();
    await page.waitForTimeout(3000);
    await expect(card.getByTestId('note-card-save')).not.toBeVisible();

    await page.reload();

    await focusNoteFromList(page, title);
    const reloadedCard = noteCardByTitle(page, title);
    await expect(reloadedCard.locator('input[type="checkbox"]').first()).toBeChecked();

    await deleteNoteFromCard(page, title);
  });
});
