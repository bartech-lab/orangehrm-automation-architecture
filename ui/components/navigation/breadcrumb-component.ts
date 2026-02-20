import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../base-component.js';

export class BreadcrumbComponent extends BaseComponent {
  readonly breadcrumbItems: Locator;
  readonly breadcrumbNav: Locator;
  readonly headerTitle: Locator;

  constructor(page: Page) {
    const breadcrumbRoot = page
      .locator('nav[aria-label="breadcrumb"], .oxd-topbar-header-breadcrumb')
      .first();
    super(page, breadcrumbRoot);
    this.breadcrumbNav = breadcrumbRoot;
    this.breadcrumbItems = this.root.locator(
      '.oxd-topbar-header-breadcrumb-item, .oxd-topbar-header-breadcrumb-module'
    );
    this.headerTitle = page.locator('.oxd-topbar-header-title').getByRole('heading');
  }

  async waitForReady(): Promise<void> {
    const isBreadcrumbVisible = await this.root.isVisible().catch(() => false);
    if (isBreadcrumbVisible) {
      await this.root.waitFor({ state: 'visible' });
      return;
    }

    await this.headerTitle.waitFor({ state: 'visible' });
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
      const text = await item.textContent().catch(() => null);
      if (text) {
        texts.push(text.trim());
      }
    }

    if (texts.length > 0) {
      return texts;
    }

    const rootText = await this.root.textContent().catch(() => null);
    if (rootText && rootText.trim().length > 0) {
      return [rootText.trim()];
    }

    const headerText = await this.headerTitle.textContent().catch(() => null);
    if (headerText && headerText.trim().length > 0) {
      return [headerText.trim()];
    }

    return texts;
  }

  async getCurrentPage(): Promise<string | null> {
    const isBreadcrumbVisible = await this.isVisible();
    if (!isBreadcrumbVisible) {
      const headerText = await this.headerTitle.textContent().catch(() => null);
      return headerText ? headerText.trim() : null;
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

    const item = this.breadcrumbItems.filter({ hasText: itemText }).first();
    const link = item.getByRole('link').first();

    if (!(await link.isVisible().catch(() => false))) {
      throw new Error(`Breadcrumb item "${itemText}" is not clickable`);
    }

    await link.click();
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
      const parentLink = items[items.length - 2].getByRole('link').first();
      if (!(await parentLink.isVisible().catch(() => false))) {
        throw new Error('Parent breadcrumb is not clickable');
      }

      await parentLink.click();
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

    const firstItemLink = this.breadcrumbItems.first().getByRole('link').first();
    if (!(await firstItemLink.isVisible().catch(() => false))) {
      throw new Error('Home breadcrumb is not clickable');
    }

    await firstItemLink.click();
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
      const text = await items[index].textContent().catch(() => null);
      return text ? text.trim() : null;
    }
    return null;
  }
}
