import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../base-component.js';
import { OXD_SELECTORS } from './navigation-constants.js';

/**
 * Topbar navigation component for OrangeHRM
 * Handles search, user dropdown menu, and logout functionality
 */
export class TopbarComponent extends BaseComponent {
  readonly searchInput: Locator;
  readonly userDropdown: Locator;
  readonly userDropdownName: Locator;

  constructor(page: Page) {
    super(page, OXD_SELECTORS.TOPBAR);
    this.searchInput = page.locator(OXD_SELECTORS.SEARCH_INPUT);
    this.userDropdown = page.locator(OXD_SELECTORS.USER_DROPDOWN);
    this.userDropdownName = page.locator(OXD_SELECTORS.USER_DROPDOWN_NAME);
  }

  async waitForReady(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
    await this.userDropdown.waitFor({ state: 'visible' });
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  /**
   * Search for content using the topbar search input
   * @param query - Search query string
   */
  async search(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if search functionality is available
   */
  async isSearchAvailable(): Promise<boolean> {
    return this.searchInput.isVisible().catch(() => false);
  }

  /**
   * Get the current logged-in user's display name
   */
  async getUserName(): Promise<string | null> {
    return this.userDropdownName.textContent();
  }

  /**
   * Open the user dropdown menu
   */
  async openUserMenu(): Promise<void> {
    await this.userDropdown.click();
    await this.page.locator(OXD_SELECTORS.USER_DROPDOWN_MENU).waitFor({ state: 'visible' });
  }

  /**
   * Close the user dropdown menu by clicking elsewhere
   */
  async closeUserMenu(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page
      .locator(OXD_SELECTORS.USER_DROPDOWN_MENU)
      .waitFor({ state: 'hidden' })
      .catch(() => {});
  }

  /**
   * Click a menu item in the user dropdown
   * @param itemText - Text of the menu item to click
   */
  async clickUserMenuItem(itemText: string): Promise<void> {
    await this.openUserMenu();
    const menuItem = this.page.locator(
      `${OXD_SELECTORS.USER_DROPDOWN_MENU} a:has-text("${itemText}")`
    );
    await menuItem.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    await this.openUserMenu();
    const logoutItem = this.page.locator(
      `${OXD_SELECTORS.USER_DROPDOWN_MENU} a:has-text("Logout")`
    );
    await logoutItem.click();
    await this.page.waitForURL(/login/);
  }

  /**
   * Navigate to "About" from user menu
   */
  async openAbout(): Promise<void> {
    await this.clickUserMenuItem('About');
  }

  /**
   * Navigate to "Support" from user menu
   */
  async openSupport(): Promise<void> {
    await this.clickUserMenuItem('Support');
  }

  /**
   * Navigate to "Change Password" from user menu
   */
  async openChangePassword(): Promise<void> {
    await this.clickUserMenuItem('Change Password');
  }

  /**
   * Check if user menu is currently open
   */
  async isUserMenuOpen(): Promise<boolean> {
    return this.page
      .locator(OXD_SELECTORS.USER_DROPDOWN_MENU)
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get all user menu items
   */
  async getUserMenuItems(): Promise<string[]> {
    await this.openUserMenu();
    const items = this.page.locator(`${OXD_SELECTORS.USER_DROPDOWN_MENU} a`);
    return items.allTextContents();
  }
}
