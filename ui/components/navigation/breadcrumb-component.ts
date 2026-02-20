import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../base-component.js';

export class BreadcrumbComponent extends BaseComponent {
  readonly breadcrumbItems: Locator;
  readonly headerTitle: Locator;

  constructor(page: Page) {
    super(page, page.locator('.oxd-topbar-header-breadcrumb'));
    this.breadcrumbItems = this.root
      .locator('.oxd-topbar-header-breadcrumb-item')
      .getByRole('link');
    this.headerTitle = page.locator('.oxd-topbar-header-title').getByRole('heading');
  }

  async waitForReady(): Promise<void> {
    const isBreadcrumbVisible = await this.root.isVisible().catch(() => false);
    if (isBreadcrumbVisible) {
      await this.root.waitFor({ state: 'visible' });
    }
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible().catch(() => false);
  }

  async getBreadcrumbItems(): Promise<string[]> {
    const isBreadcrumbVisible = await this.isVisible();
    if (!isBreadcrumbVisible) {
      const headerText = await this.headerTitle.textContent().catch(() => null);
      return headerText ? [headerText.trim()] : [];
    }

    const items = await this.breadcrumbItems.all();
    const texts: string[] = [];
    for (const item of items) {
      const text = await item.textContent();
      if (text) {
        texts.push(text.trim());
      }
    }
    return texts;
  }

  async getCurrentPage(): Promise<string | null> {
    const isBreadcrumbVisible = await this.isVisible();
    if (!isBreadcrumbVisible) {
      return this.headerTitle.textContent();
    }

    const items = await this.getBreadcrumbItems();
    return items.length > 0 ? items[items.length - 1] : null;
  }

  async getBreadcrumbPath(): Promise<string> {
    const items = await this.getBreadcrumbItems();
    return items.join(' > ');
  }

  async clickBreadcrumbItem(itemText: string): Promise<void> {
    const isBreadcrumbVisible = await this.isVisible();
    if (!isBreadcrumbVisible) {
      throw new Error('Breadcrumb not available on this page');
    }

    const item = this.breadcrumbItems.locator(`:has-text("${itemText}")`);
    await item.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.headerTitle.waitFor({ state: 'visible' });
  }

  async navigateToParent(): Promise<void> {
    const isBreadcrumbVisible = await this.isVisible();
    if (!isBreadcrumbVisible) {
      throw new Error('Breadcrumb not available on this page');
    }

    const items = await this.breadcrumbItems.all();
    if (items.length >= 2) {
      await items[items.length - 2].click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.headerTitle.waitFor({ state: 'visible' });
    }
  }

  async navigateToHome(): Promise<void> {
    const isBreadcrumbVisible = await this.isVisible();
    if (!isBreadcrumbVisible) {
      await this.page.goto('/web/index.php/dashboard/index');
      return;
    }

    const firstItem = this.breadcrumbItems.first();
    await firstItem.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.headerTitle.waitFor({ state: 'visible' });
  }

  async getDepth(): Promise<number> {
    const items = await this.getBreadcrumbItems();
    return items.length;
  }

  async containsText(text: string): Promise<boolean> {
    const items = await this.getBreadcrumbItems();
    return items.some((item) => item.toLowerCase().includes(text.toLowerCase()));
  }

  async getLevel(index: number): Promise<string | null> {
    const items = await this.breadcrumbItems.all();
    if (index >= 0 && index < items.length) {
      return items[index].textContent();
    }
    return null;
  }
}
