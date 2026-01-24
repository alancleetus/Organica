import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('shows error toast on invalid credentials', async ({ page }) => {
    await page.goto('/login');  
    
    await page.getByTestId('login-username').fill('invalid@gmail.com'); 
    await page.getByTestId('login-password').fill('invalid');  
    await page.getByTestId('login-submit').click();
     
    // Wait for toast to appear
    await expect(page.locator('.Toastify__toast')).toContainText(/invalid|error|failed/i);
  });

  test('login success redirects to /main', async ({ page }) => {
    await page.goto('/login');

    await page.getByTestId('login-username').fill('test@gmail.com'); 
    await page.getByTestId('login-password').fill('testpassword');   
    await page.getByTestId('login-submit').click();
    
    await expect(page).toHaveURL(/\/main/);
    // Wait for toast to appear
    await expect(page.locator('.Toastify__toast')).toContainText(/login/i);
  });
});
