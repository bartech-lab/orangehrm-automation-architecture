import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../base-component.js';
import { MODULE_NAMES, SIDEBAR_SELECTORS, OXD_SELECTORS } from './navigation-constants.js';

type ModuleName = keyof typeof SIDEBAR_SELECTORS;

/**
 * Sidebar navigation component for OrangeHRM
 * Handles left sidebar menu navigation and expand/collapse functionality
 */
export class SidebarComponent extends BaseComponent {
  readonly menuItems: Locator;
  readonly toggleButton: Locator;

  constructor(page: Page) {
    super(page, OXD_SELECTORS.SIDEBAR_ASIDE);
    this.menuItems = this.root
      .getByRole('link')
      .filter({
        hasText:
          /Admin|PIM|Leave|Time|Recruitment|Performance|Dashboard|Directory|Maintenance|Claim|Buzz|My Info/i,
      });
    this.toggleButton = page.locator(OXD_SELECTORS.SIDEBAR_TOGGLE).getByRole('button');
  }

  async waitForReady(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
    await this.menuItems.first().waitFor({ state: 'visible' });
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  /**
   * Navigate to a module by clicking its sidebar menu item
   * @param moduleName - Name of the module to navigate to
   */
  async navigateTo(moduleName: ModuleName): Promise<void> {
    if (!SIDEBAR_SELECTORS[moduleName]) {
      throw new Error(`Unknown module: ${moduleName}`);
    }

    const menuItem = this.root
      .getByRole('link', { name: new RegExp(`^\\s*${moduleName}\\s*$`, 'i') })
      .first();
    await menuItem.click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.waitForReady();
  }

  /**
   * Check if sidebar is expanded (visible width)
   * OrangeHRM sidebar doesn't have collapse/expand in newer versions
   */
  async isExpanded(): Promise<boolean> {
    const sidebar = this.root;
    const boundingBox = await sidebar.boundingBox();
    return boundingBox !== null && boundingBox.width > 50;
  }

  /**
   * Toggle sidebar expand/collapse state
   * Note: May not be available in all OrangeHRM versions
   */
  async toggle(): Promise<void> {
    const isToggleVisible = await this.toggleButton.isVisible().catch(() => false);
    if (isToggleVisible) {
      await this.toggleButton.click();
    }
  }

  /**
   * Collapse the sidebar if expanded
   * Note: May not be available in all OrangeHRM versions
   */
  async collapse(): Promise<void> {
    const isToggleVisible = await this.toggleButton.isVisible().catch(() => false);
    if (isToggleVisible && (await this.isExpanded())) {
      await this.toggle();
    }
  }

  /**
   * Expand the sidebar if collapsed
   * Note: May not be available in all OrangeHRM versions
   */
  async expand(): Promise<void> {
    const isToggleVisible = await this.toggleButton.isVisible().catch(() => false);
    if (isToggleVisible && !(await this.isExpanded())) {
      await this.toggle();
    }
  }

  /**
   * Get all visible menu item texts
   */
  async getMenuItemTexts(): Promise<string[]> {
    return this.menuItems.allTextContents();
  }

  /**
   * Check if a specific module is visible in the sidebar
   */
  async hasModule(moduleName: ModuleName): Promise<boolean> {
    if (!SIDEBAR_SELECTORS[moduleName]) {
      return false;
    }
    return this.root
      .getByRole('link', { name: new RegExp(`^\\s*${moduleName}\\s*$`, 'i') })
      .first()
      .isVisible()
      .catch(() => false);
  }

  /**
   * Get the currently active module name
   */
  async getActiveModule(): Promise<string | null> {
    const activeItem = this.page
      .locator(`${OXD_SELECTORS.SIDEBAR_MENU_ITEM}--active, .oxd-main-menu-item.active`)
      .getByRole('link');
    if (await activeItem.isVisible().catch(() => false)) {
      return activeItem.textContent();
    }
    return null;
  }
}

export { MODULE_NAMES };
