import { test, expect } from '@playwright/test';

test('sorter preferences persist after reload', async ({ page }) => {
  await page.goto('/main');

  const sorterTrigger = page.getByTestId('sorter-select');
  const sortDirectionToggle = page.getByTestId('sort-direction-toggle');

  await expect(sorterTrigger).toBeVisible();
  await expect(sorterTrigger).toHaveAttribute('aria-label', 'Sort by Title');
  await expect(sortDirectionToggle).toHaveAttribute('aria-label', 'Sort ascending');

  await sorterTrigger.click();
  await page.getByRole('button', { name: 'Modified', exact: true }).click();
  await expect(sorterTrigger).toHaveAttribute('aria-label', 'Sort by Modified');

  await sortDirectionToggle.click();
  await expect(sortDirectionToggle).toHaveAttribute('aria-label', 'Sort descending');

  await page.reload();

  await expect(sorterTrigger).toHaveAttribute('aria-label', 'Sort by Modified');
  await expect(sortDirectionToggle).toHaveAttribute('aria-label', 'Sort descending');
});
