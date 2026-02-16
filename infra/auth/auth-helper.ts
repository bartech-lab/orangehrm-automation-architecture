import type { Page } from '@playwright/test';

interface Credentials {
  username: string;
  password: string;
}

export class AuthHelper {
  private readonly page: Page;
  private readonly baseUrl: string;
  private readonly credentials: Credentials;

  constructor(page: Page, baseUrl: string, credentials: Credentials) {
    this.page = page;
    this.baseUrl = baseUrl;
    this.credentials = credentials;
  }

  async login(): Promise<void> {
    await this.page.goto(`${this.baseUrl}/web/index.php/auth/login`);
    await this.page.locator('input[name="username"]').fill(this.credentials.username);
    await this.page.locator('input[name="password"]').fill(this.credentials.password);
    await this.page.locator('button[type="submit"]').click();
    await this.page.waitForURL(/dashboard/);
  }

  async logout(): Promise<void> {
    await this.page.locator('.oxd-userdropdown').click();
    await this.page.locator('text=Logout').click();
    await this.page.waitForURL(/auth\/login/);
  }

  async isAuthenticated(): Promise<boolean> {
    const currentUrl = this.page.url();
    return currentUrl.includes('/dashboard');
  }
}
