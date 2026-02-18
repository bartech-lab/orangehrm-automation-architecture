import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../base-component.js';

export class TopbarComponent extends BaseComponent {
  readonly searchInput: Locator;
  readonly userDropdown: Locator;
  readonly userDropdownName: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    const topbar = page.getByRole('banner');
    super(page, topbar);
    this.searchInput = page.getByPlaceholder('Search', { exact: false });
    this.userDropdown = page.locator('.oxd-userdropdown').getByRole('button');
    this.userDropdownName = page.locator('.oxd-userdropdown').getByText(/./);
    this.userMenu = page.getByRole('menu');
  }

  async waitForReady(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
    await this.userDropdown.waitFor({ state: 'visible' });
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async isSearchAvailable(): Promise<boolean> {
    return this.searchInput.isVisible().catch(() => false);
  }

  async getUserName(): Promise<string | null> {
    return this.userDropdownName.textContent();
  }

  async openUserMenu(): Promise<void> {
    await this.userDropdown.click();
    await this.userMenu.waitFor({ state: 'visible' });
  }

  async closeUserMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.userMenu.waitFor({ state: 'hidden' }).catch(() => {});
  }

  async clickUserMenuItem(itemText: string): Promise<void> {
    await this.openUserMenu();
    const menuItem = this.userMenu.getByRole('link', { name: itemText });
    await menuItem.click();
    await this.page.waitForLoadState('networkidle');
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    const logoutItem = this.userMenu.getByRole('menuitem', { name: 'Logout' });
    await logoutItem.click();
    await this.page.waitForURL(/login/);
  }

  async openAbout(): Promise<void> {
    await this.clickUserMenuItem('About');
  }

  async openSupport(): Promise<void> {
    await this.clickUserMenuItem('Support');
  }

  async openChangePassword(): Promise<void> {
    await this.clickUserMenuItem('Change Password');
  }

  async isUserMenuOpen(): Promise<boolean> {
    return this.userMenu.isVisible().catch(() => false);
  }

  async getUserMenuItems(): Promise<string[]> {
    await this.openUserMenu();
    const items = this.userMenu.getByRole('link');
    return items.allTextContents();
  }
}
