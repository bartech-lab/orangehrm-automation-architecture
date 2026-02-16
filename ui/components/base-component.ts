import type { Locator, Page } from '@playwright/test';

export abstract class BaseComponent {
  protected readonly page: Page;
  readonly root: Locator;

  constructor(page: Page, selector: string | Locator) {
    this.page = page;
    this.root =
      typeof selector === 'string' ? page.locator(selector) : selector;
  }

  abstract waitForReady(): Promise<void>;
  abstract isVisible(): Promise<boolean>;

  async scrollIntoView(): Promise<void> {
    await this.root.scrollIntoViewIfNeeded();
  }
}
