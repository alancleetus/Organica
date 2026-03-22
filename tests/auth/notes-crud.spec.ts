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
    await card.getByTestId('note-read-panel').click();
    const contentArea = card.getByTestId('note-card-content-editor');
    await contentArea.fill(updatedContent);
    await page.waitForTimeout(3000);

    await page.reload();
    await focusNoteFromList(page, title);
    await expect(detailCard(page).getByTestId('note-card-content-editor')).toHaveValue(updatedContent);

    await deleteSelectedNote(page, title);
  });

  test('task lines can be toggled by clicking and persist after reload', async ({ page }) => {
    await page.goto('/main');

    const title = `e2e-task-autosave-${Date.now()}`;

    await createNote(page, title, '[ ] Checkbox item');
    await focusNoteFromList(page, title);

    const card = detailCard(page);
    const checklistItem = card.getByTestId('note-checklist-toggle').first();

    await checklistItem.click();
    await page.waitForTimeout(3000);

    await page.reload();

    await focusNoteFromList(page, title);
    await expect(detailCard(page).getByTestId('note-card-content-editor')).toHaveValue('[x] Checkbox item');

    await deleteSelectedNote(page, title);
  });


  test('completed checklist items render in a separate section in view mode', async ({ page }) => {
    await page.goto('/main');

    const title = 'e2e-completed-section-' + Date.now();
    const content = ['[ ] Open task', '[x] Done task', 'Plain note line'].join('\n');

    await createNote(page, title, content);
    await focusNoteFromList(page, title);

    const card = detailCard(page);
    const readPanel = card.getByTestId('note-read-panel');
    const completedSection = card.getByTestId('note-completed-section');

    await expect(readPanel).toContainText('Open task');
    await expect(readPanel).toContainText('Plain note line');
    await expect(completedSection).toContainText('Completed (1)');
    await expect(completedSection).toContainText('Done task');

    await deleteSelectedNote(page, title);
  });
  test('checklist toggle applies to a full selected block', async ({ page }) => {
    await page.goto('/main');

    const title = `e2e-bulk-task-${Date.now()}`;
    const content = ['first line', 'second line', 'third line'].join('\n');

    await page.getByTestId('add-note-fab').click();
    await expect(page.getByTestId('add-note-modal')).toBeVisible();
    await page.getByTestId('note-title').fill(title);
    await page.getByTestId('note-content').fill(content);

    const modalEditor = page.getByTestId('note-content');
    await modalEditor.click();
    await page.keyboard.press('Control+A');
    await page.getByTestId('add-note-modal').getByTestId('toggle-task-list').click();

    await expect(modalEditor).toHaveValue(
      ['[ ] first line', '[ ] second line', '[ ] third line'].join('\n')
    );

    await page.getByTestId('note-save').click();
    await expect(page.getByTestId('add-note-modal')).not.toBeVisible();
    await focusNoteFromList(page, title);

    const detailEditor = detailCard(page).getByTestId('note-card-content-editor');
    await expect(detailEditor).toHaveValue(
      ['[ ] first line', '[ ] second line', '[ ] third line'].join('\n')
    );

    await deleteSelectedNote(page, title);
  });
});




