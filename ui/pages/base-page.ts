import type { Page } from '@playwright/test';

export abstract class BasePage {
  protected readonly page: Page;
  protected readonly baseUrl: string;

  constructor(page: Page, baseUrl: string) {
    this.page = page;
    this.baseUrl = baseUrl;
  }

  abstract navigate(): Promise<void>;
  abstract waitForReady(): Promise<void>;
  abstract isReady(): Promise<boolean>;

  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async waitForUrl(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(urlPattern);
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `./screenshots/${name}.png` });
  }
}
