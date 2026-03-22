import { test, expect } from '@playwright/test';

test('sorter preferences persist after reload', async ({ page }) => {
  await page.goto('/main');

  const sorterSelect = page.getByTestId('sorter-select');
  const sortDirectionToggle = page.getByTestId('sort-direction-toggle');

  await expect(sorterSelect).toBeVisible();
  await expect(sorterSelect).toHaveValue('title');
  await expect(sortDirectionToggle).toHaveAttribute('aria-label', 'Sort ascending');

  await sorterSelect.selectOption('modifiedDT');
  await expect(sorterSelect).toHaveValue('modifiedDT');

  await sortDirectionToggle.click();
  await expect(sortDirectionToggle).toHaveAttribute('aria-label', 'Sort descending');

  await page.reload();

  await expect(sorterSelect).toHaveValue('modifiedDT');
  await expect(sortDirectionToggle).toHaveAttribute('aria-label', 'Sort descending');
});
