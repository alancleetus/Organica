import { defineConfig, devices } from '@playwright/test';


export default defineConfig({

  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  globalSetup: './tests/auth.setup',

  projects: [
    // Unauthenticated tests (login + route guards)
    {
      name: 'unauth',
      testDir: './tests/unauth',
      use: { ...devices['Desktop Chrome'] },
    },

    // Authenticated tests 
    {
      name: 'auth',
      testDir: './tests/auth',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/state.json',
      },
      dependencies: ['unauth'], 
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
