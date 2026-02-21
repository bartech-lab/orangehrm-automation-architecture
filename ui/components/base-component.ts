import type { Locator, Page } from '@playwright/test';

export abstract class BaseComponent {
  protected readonly page: Page;
  protected readonly root: Locator;

  constructor(page: Page, selector: string | Locator) {
    this.page = page;
    this.root = typeof selector === 'string' ? page.locator(selector) : selector;
  }

  abstract waitForReady(): Promise<void>;
  abstract isVisible(): Promise<boolean>;

  async scrollIntoView(): Promise<void> {
    await this.root.scrollIntoViewIfNeeded();
  }

  protected getByRole(role: string, options?: { name?: string | RegExp }): Locator {
    return this.root.getByRole(role as any, options as any);
  }

  protected getByLabel(text: string | RegExp): Locator {
    return this.root.getByLabel(text);
  }

  protected getByPlaceholder(text: string | RegExp): Locator {
    return this.root.getByPlaceholder(text);
  }

  protected getByText(text: string | RegExp): Locator {
    return this.root.getByText(text);
  }

  protected getByTestId(testId: string | RegExp): Locator {
    return this.root.getByTestId(testId);
  }
}
