import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page.js';
import type { Credentials } from '../../domain/auth/types.js';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorAlert: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page, baseUrl: string = 'https://opensource-demo.orangehrmlive.com') {
    super(page, baseUrl);

    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.errorMessage = page.locator('.oxd-alert-content-text');
    this.errorAlert = page.locator('.oxd-alert-content-text');
    this.rememberMeCheckbox = page.getByRole('checkbox', { name: /remember me/i });
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.passwordInput.waitFor({ state: 'visible' });
    await this.loginButton.waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    try {
      const usernameVisible = await this.usernameInput.isVisible();
      const passwordVisible = await this.passwordInput.isVisible();
      const buttonVisible = await this.loginButton.isVisible();
      return usernameVisible && passwordVisible && buttonVisible;
    } catch {
      return false;
    }
  }

  async goto(): Promise<void> {
    await this.navigate();
  }

  async login(credentials: Credentials): Promise<void> {
    await this.usernameInput.fill(credentials.username);
    await this.passwordInput.fill(credentials.password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string | null> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 5000 });
      return await this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForURL(/.*dashboard.*/, { timeout: 10000 });
      return true;
    } catch {
      return false;
    }
  }

  async hasError(): Promise<boolean> {
    try {
      await this.errorAlert.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async toggleRememberMe(): Promise<void> {
    await this.rememberMeCheckbox.click();
  }

  async isRememberMeChecked(): Promise<boolean> {
    const checkboxInput = this.rememberMeCheckbox.locator('input[type="checkbox"]');
    try {
      return await checkboxInput.isChecked();
    } catch {
      return false;
    }
  }

  async clearForm(): Promise<void> {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  async fillUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async getFieldValidationErrors(): Promise<string[]> {
    const errors: string[] = [];

    const requiredErrors = this.page.locator('.oxd-input-field-error-message');
    const count = await requiredErrors.count();

    for (let i = 0; i < count; i++) {
      const text = await requiredErrors.nth(i).textContent();
      if (text) {
        errors.push(text);
      }
    }

    return errors;
  }
}
