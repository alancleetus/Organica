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
  // The dev server double-mounts data-fetching effects (React StrictMode),
  // which can briefly render the just-created note twice before the
  // notes list settles on the fetched data.
  await expect(noteListItemByTitle(page, title)).toHaveCount(1);
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
  await expect(noteListItem).toHaveCount(1);
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

    page.once('dialog', (dialog) => dialog.accept());
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
    await page.waitForTimeout(3000);

    await page.reload();
    await focusNoteFromList(page, title);
    await expect(detailCard(page).getByTestId('note-card-content-editor')).toHaveValue(updatedContent);

    await deleteSelectedNote(page, title);
  });

  async function createChecklistNote(page: Page, title: string, lines: string[]) {
    await page.getByTestId('add-note-fab').click();
    await expect(page.getByTestId('add-note-modal')).toBeVisible();
    await page.getByTestId('note-title').fill(title);
    await page.getByTestId('note-content').fill(lines.join('\n'));
    // Switching to the checklist type converts each existing line into an item.
    await page.getByTestId('note-type-checklist').click();

    await page.getByTestId('note-save').click();
    await expect(page.getByTestId('add-note-modal')).not.toBeVisible();
    // The dev server double-mounts data-fetching effects (React StrictMode),
    // which can briefly render the just-created note twice before the
    // notes list settles on the fetched data.
    await expect(noteListItemByTitle(page, title)).toHaveCount(1);
    await expect(noteListItemByTitle(page, title)).toBeVisible();
  }

  test('task lines can be toggled by clicking and persist after reload', async ({ page }) => {
    await page.goto('/main');

    const title = `e2e-task-autosave-${Date.now()}`;

    await createChecklistNote(page, title, ['Checkbox item']);
    await focusNoteFromList(page, title);

    const card = detailCard(page);
    const checklistItem = card.locator('[data-testid="note-checklist-item"]').first();
    await checklistItem.locator('.plain-note-checklist-toggle').click();
    await expect(checklistItem).toHaveClass(/is-checked/);
    await expect(card.getByTestId('note-card-save-state')).toHaveAttribute('data-state', 'saved');

    await page.reload();
    await focusNoteFromList(page, title);

    await expect(
      detailCard(page).locator('[data-testid="note-checklist-item"]').first()
    ).toHaveClass(/is-checked/);

    await deleteSelectedNote(page, title);
  });

  test('completed checklist items render in a separate section', async ({ page }) => {
    await page.goto('/main');

    const title = 'e2e-completed-section-' + Date.now();

    await createChecklistNote(page, title, ['Open task', 'Done task', 'Plain note line']);
    await focusNoteFromList(page, title);

    const card = detailCard(page);
    const completedSection = card.getByTestId('note-completed-section');
    await expect(completedSection).not.toBeVisible();

    // Item text lives inside each row's <input value>, not as plain text
    // content, so items are matched by position and read via their value.
    const items = card.locator('[data-testid="note-checklist-item"]');
    await expect(items).toHaveCount(3);
    await expect(items.nth(1).locator('.checklist-editor-input')).toHaveValue('Done task');
    await items.nth(1).locator('.plain-note-checklist-toggle').click();

    await expect(completedSection).toContainText('Completed (1)');
    await expect(completedSection.locator('.checklist-editor-input')).toHaveValue('Done task');

    const activeInputs = card.locator(
      '.checklist-editor-items > [data-testid="note-checklist-item"] .checklist-editor-input'
    );
    await expect(activeInputs).toHaveCount(2);
    await expect(activeInputs.nth(0)).toHaveValue('Open task');
    await expect(activeInputs.nth(1)).toHaveValue('Plain note line');

    await deleteSelectedNote(page, title);
  });
});




