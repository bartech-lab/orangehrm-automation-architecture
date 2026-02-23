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
    this.userDropdown = page
      .getByRole('button')
      .filter({ has: page.locator('.oxd-userdropdown-name') })
      .or(page.locator('.oxd-userdropdown-tab'))
      .first();
    this.userDropdownName = page
      .locator('.oxd-userdropdown')
      .getByText(/./)
      .or(page.locator('.oxd-userdropdown-name'))
      .first();
    this.userMenu = page.getByRole('menu').or(page.locator('.oxd-dropdown-menu')).first();
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
    await this.page.waitForLoadState('domcontentloaded');
  }

  async isSearchAvailable(): Promise<boolean> {
    return this.searchInput.isVisible().catch(() => false);
  }

  async getUserName(): Promise<string | null> {
    return this.userDropdownName.textContent();
  }

  async openUserMenu(): Promise<void> {
    const isMenuOpen = await this.userMenu.isVisible().catch(() => false);
    if (isMenuOpen) {
      return;
    }

    await this.userDropdown.waitFor({ state: 'visible' });
    await this.userDropdown.click();
    await this.userMenu.waitFor({ state: 'visible', timeout: 5000 });
  }

  async closeUserMenu(): Promise<void> {
    const isMenuOpen = await this.userMenu.isVisible().catch(() => false);
    if (!isMenuOpen) {
      return;
    }

    await this.userDropdown.click();
    await this.userMenu.waitFor({ state: 'hidden', timeout: 1500 }).catch(async () => {
      const dropdownVisible = await this.userDropdown.isVisible().catch(() => false);
      if (dropdownVisible) {
        await this.userDropdown.click();
      }
      await this.userMenu.waitFor({ state: 'hidden', timeout: 2000 }).catch(async () => {
        await this.page.mouse.click(5, 5);
        await this.userMenu.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
      });
    });
  }

  async clickUserMenuItem(itemText: string): Promise<void> {
    await this.openUserMenu();
    const menuItem = this.userMenu
      .locator('a, [role="menuitem"]')
      .filter({ hasText: itemText })
      .first();

    await menuItem.waitFor({ state: 'visible' });
    await menuItem.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async logout(): Promise<void> {
    await this.openUserMenu();
    const logoutItem = this.userMenu
      .locator('a:has-text("Logout"), [role="menuitem"]:has-text("Logout")')
      .first();

    await logoutItem.waitFor({ state: 'visible' });
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
    const items = this.userMenu.locator('a, [role="menuitem"]');
    return items.allTextContents();
  }
}
