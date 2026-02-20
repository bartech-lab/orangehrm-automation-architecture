import type { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page.js';

export type ModuleName =
  | 'Admin'
  | 'PIM'
  | 'Leave'
  | 'Time'
  | 'Recruitment'
  | 'Performance'
  | 'My Info'
  | 'Claim'
  | 'Buzz'
  | 'Directory'
  | 'Maintenance';

export class DashboardPage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly quickActionButtons: Locator;
  readonly sidebar: Locator;
  readonly sidebarMenuItems: Locator;
  readonly userDropdown: Locator;
  readonly userDropdownMenu: Locator;
  readonly logoutLink: Locator;
  readonly userNameText: Locator;
  readonly topbarHeader: Locator;

  constructor(page: Page, baseUrl: string) {
    super(page, baseUrl);

    this.topbarHeader = this.page.getByRole('banner');
    this.welcomeMessage = this.page.locator('.oxd-topbar-header-title');
    this.quickActionButtons = this.page.getByRole('button');
    this.sidebar = this.page.getByRole('navigation', { name: /sidepanel/i });
    this.sidebarMenuItems = this.sidebar.getByRole('link');
    this.userDropdown = this.page.locator('.oxd-userdropdown-tab');
    this.userDropdownMenu = this.page.locator('.oxd-dropdown-menu');
    this.logoutLink = this.userDropdownMenu
      .locator('a:has-text("Logout"), [role="menuitem"]:has-text("Logout")')
      .first();
    this.userNameText = this.page.locator('.oxd-userdropdown-name');
  }

  async navigate(): Promise<void> {
    const url = this.baseUrl
      ? `${this.baseUrl}/web/index.php/dashboard/index`
      : '/web/index.php/dashboard/index';
    await this.page.goto(url);
  }

  async waitForReady(): Promise<void> {
    await this.topbarHeader.waitFor({ state: 'visible', timeout: 10000 });
    await this.sidebar.waitFor({ state: 'visible', timeout: 10000 });
  }

  async isReady(): Promise<boolean> {
    const topbarVisible = await this.topbarHeader.isVisible().catch(() => false);
    const sidebarVisible = await this.sidebar.isVisible().catch(() => false);
    return topbarVisible && sidebarVisible;
  }

  async getWelcomeMessage(): Promise<string> {
    const topbarVisible = await this.welcomeMessage
      .first()
      .isVisible()
      .catch(() => false);
    if (topbarVisible) {
      const topbarText = await this.welcomeMessage.first().textContent();
      return topbarText?.trim() ?? '';
    }

    await this.userNameText.first().waitFor({ state: 'visible' });
    const fallbackText = await this.userNameText.first().textContent();
    return fallbackText?.trim() ?? '';
  }

  async navigateTo(moduleName: ModuleName): Promise<void> {
    const menuItem = this.sidebar.getByRole('link', { name: moduleName });

    await menuItem.waitFor({ state: 'visible' });
    await menuItem.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async openUserDropdown(): Promise<void> {
    const isMenuOpen = await this.userDropdownMenu.isVisible().catch(() => false);
    if (isMenuOpen) {
      return;
    }

    await this.userDropdown.waitFor({ state: 'visible' });
    await this.userDropdown.click();
    await this.userDropdownMenu.waitFor({ state: 'visible', timeout: 5000 });
  }

  async getCurrentUser(): Promise<string> {
    await this.userNameText.waitFor({ state: 'visible' });
    const text = await this.userNameText.textContent();
    return text ?? '';
  }

  async logout(): Promise<void> {
    await this.openUserDropdown();
    await this.logoutLink.click();
    await this.page.waitForURL(/auth\/login/, { timeout: 10000 });
  }

  async isModuleVisible(moduleName: ModuleName): Promise<boolean> {
    const menuItem = this.sidebar.getByRole('link', { name: moduleName });
    return menuItem.isVisible().catch(() => false);
  }

  async getAvailableModules(): Promise<string[]> {
    const modules: string[] = [];
    const count = await this.sidebarMenuItems.count();

    for (let i = 0; i < count; i++) {
      const text = await this.sidebarMenuItems.nth(i).textContent();
      if (text) {
        modules.push(text.trim());
      }
    }

    return modules;
  }
}
