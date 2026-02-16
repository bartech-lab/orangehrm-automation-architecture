import type { Locator, Page } from '@playwright/test';

export abstract class BaseComponent {
  protected readonly page: Page;
  protected readonly rootLocator: Locator;

  constructor(page: Page, selector: string | Locator) {
    this.page = page;
    this.rootLocator =
      typeof selector === 'string' ? page.locator(selector) : selector;
  }

  abstract isVisible(): Promise<boolean>;
  abstract waitForVisible(): Promise<void>;
  abstract waitForHidden(): Promise<void>;

  async click(): Promise<void> {
    await this.rootLocator.click();
  }

  async hover(): Promise<void> {
    await this.rootLocator.hover();
  }

  async getText(): Promise<string> {
    return this.rootLocator.innerText();
  }

  async getAttribute(attributeName: string): Promise<string | null> {
    return this.rootLocator.getAttribute(attributeName);
  }

  async count(): Promise<number> {
    return this.rootLocator.count();
  }

  async isEnabled(): Promise<boolean> {
    return this.rootLocator.isEnabled();
  }

  async isDisabled(): Promise<boolean> {
    return this.rootLocator.isDisabled();
  }

  async scrollIntoView(): Promise<void> {
    await this.rootLocator.scrollIntoViewIfNeeded();
  }
}
