import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('a11y: login page has no serious/critical violations', async ({ page }) => {
  await page.goto('/login');

  // Let fonts/layout settle (MUI can shift quickly)
  await page.waitForLoadState('networkidle');

  const results = await new AxeBuilder({ page })
    // You can tune later; this is a good default
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const seriousOrCritical = results.violations.filter(v =>
    v.impact === 'serious' || v.impact === 'critical'
  );

  expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toHaveLength(0);
});
