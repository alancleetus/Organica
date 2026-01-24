import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL as string;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`${baseURL}/login`);

  await page.getByTestId('login-username').fill(process.env.E2E_EMAIL || 'test@gmail.com');
  await page.getByTestId('login-password').fill(process.env.E2E_PASSWORD || 'testpassword');

  await Promise.all([
    page.waitForURL(/\/main/),
    page.getByTestId('login-submit').click(),
  ]);

  // Save signed-in state (cookies + localStorage)
  await page.context().storageState({ path: 'playwright/.auth/state.json' });

  await browser.close();
}

export default globalSetup;
