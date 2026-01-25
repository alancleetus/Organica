import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('a11y: main page has no serious/critical violations', async ({ page }) => {
  await page.goto('/main');

  // Wait for the main UI to render
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const seriousOrCritical = results.violations.filter(v =>
    v.impact === 'serious' || v.impact === 'critical'
  );

  expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toHaveLength(0);
});
