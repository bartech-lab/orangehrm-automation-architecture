import type { Locator, Page } from '@playwright/test';

interface Credentials {
  username: string;
  password: string;
}

export class AuthHelper {
  private readonly page: Page;
  private readonly baseUrl: string;
  private readonly credentials: Credentials;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly userDropdown: Locator;
  private readonly logoutMenuItem: Locator;

  constructor(page: Page, baseUrl: string, credentials: Credentials) {
    this.page = page;
    this.baseUrl = baseUrl;
    this.credentials = credentials;

    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: /login/i });
    this.userDropdown = page.getByRole('button', { name: /admin/i });
    this.logoutMenuItem = page.getByRole('menuitem', { name: /logout/i });
  }

  async login(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/web/index.php/auth/login`);
    await this.usernameInput.waitFor({ state: 'visible' });
    await this.usernameInput.fill(this.credentials.username);
    await this.passwordInput.fill(this.credentials.password);
    await this.loginButton.click();
    await this.page.waitForURL(/dashboard/);
  }

  async logout(): Promise<void> {
    await this.userDropdown.click();
    await this.logoutMenuItem.click();
    await this.page.waitForURL(/auth\/login/);
  }

  async isAuthenticated(): Promise<boolean> {
    const currentUrl = this.page.url();
    return currentUrl.includes('/dashboard');
  }
}
