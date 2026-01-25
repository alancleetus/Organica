import { test, expect, Page, Locator } from '@playwright/test';

/**
 * Helpers
 */
async function createNote(page: Page, title: string, content: string) {
  // Assumes you are already authenticated and on /main
  await page.getByTestId('add-note-fab').click(); // navigates to /note/
  await expect(page.getByTestId('note-title')).toBeVisible();

  await page.getByTestId('note-title').fill(title);

  // TipTap is contenteditable; use click + keyboard typing (fill won't work)
  const editor = page.getByTestId('note-content');
  await editor.click();
  await page.keyboard.type(content);

  await page.getByTestId('note-save').click();

  // After save, AddNote navigates back to /main
  await expect(page).toHaveURL(/\/main/);
  await expect(page.getByText(title)).toBeVisible();
}

function noteCardByTitle(page: Page, title: string): Locator {
  // Finds the article.note-card that contains the note title text
  return page.locator('article.note-card', { has: page.getByText(title) });
}

async function deleteNoteFromCard(page: Page, title: string) {
  const card = noteCardByTitle(page, title);
  await expect(card).toBeVisible();

  // Open the card's menu (your testid is on the wrapper div)
  await card.getByTestId('note-card-menu-button').click();

  // MenuItem testids may not attach reliably (MUI), so click by visible text
  await page.getByRole('menuitem', { name: /delete note/i }).click();

  // Assert it is gone
  await expect(page.getByText(title)).not.toBeVisible();
}

test.describe('Notes CRUD (Firestore)', () => {
  test('create note, refresh persists, then delete', async ({ page }) => {
    await page.goto('/main');
    await expect(page.getByTestId('add-note-fab')).toBeVisible();

    const title = `e2e-${Date.now()}`;
    const content = `Playwright content ${Date.now()}`;

    // Create
    await createNote(page, title, content);

    // Persistence check (Firestore re-read + UI rehydrate)
    await page.reload();
    await expect(page.getByText(title)).toBeVisible();

    // Cleanup (delete the note so Firestore stays clean)
    await deleteNoteFromCard(page, title);
  });

  test('cancel add-note returns to /main without creating', async ({ page }) => {
    await page.goto('/main');
    await page.getByTestId('add-note-fab').click();

    await expect(page.getByTestId('note-title')).toBeVisible();
    await page.getByTestId('note-title').fill(`should-not-save-${Date.now()}`);

    // Cancel
    await page.getByTestId('cancel-add-note').click();
    await expect(page).toHaveURL(/\/main/);
  });

  test('logout redirects user away from protected routes', async ({ page }) => {
    await page.goto('/main');
    await expect(page.getByTestId('logout-button')).toBeVisible();

    await page.getByTestId('logout-button').click();

    // After logout, protected routes should send you back to /login
    await page.goto('/main');
    await expect(page).toHaveURL(/\/login/);
  });
});
