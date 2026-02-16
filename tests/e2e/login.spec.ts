import { test, expect } from '../../infra/test-runner/fixtures.js';
import { LoginPage } from '../../ui/pages/login-page.js';
import type { Credentials } from '../../domain/auth/types.js';

test.describe('Login Functionality', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.waitForReady();
  });

  test('@auth @smoke - Valid login with Admin credentials', async () => {
    const credentials: Credentials = {
      username: 'Admin',
      password: 'admin123',
    };

    await loginPage.login(credentials);

    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('@auth - Invalid credentials show error message', async () => {
    const credentials: Credentials = {
      username: 'InvalidUser',
      password: 'wrongpassword',
    };

    await loginPage.login(credentials);

    const hasError = await loginPage.hasError();
    expect(hasError).toBe(true);

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid');
  });

  test('@auth - Empty fields validation', async () => {
    const credentials: Credentials = {
      username: '',
      password: '',
    };

    await loginPage.login(credentials);

    const currentUrl = await loginPage.getCurrentUrl();
    expect(currentUrl).toContain('/auth/login');

    const isStillOnLogin = await loginPage.isReady();
    expect(isStillOnLogin).toBe(true);
  });

  test('@auth - Remember me checkbox functionality', async ({ page }) => {
    const rememberMeExists = await page
      .locator('.oxd-checkbox-wrapper')
      .first()
      .isVisible()
      .catch(() => false);

    if (!rememberMeExists) {
      test.skip();
      return;
    }

    const isCheckedBefore = await loginPage.isRememberMeChecked();
    expect(isCheckedBefore).toBe(false);

    await loginPage.toggleRememberMe();

    const isCheckedAfter = await loginPage.isRememberMeChecked();
    expect(isCheckedAfter).toBe(true);
  });
});
