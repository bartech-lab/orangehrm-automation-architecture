import { BasePage } from '../../base-page.js';
import type { Page } from '@playwright/test';

export class OrganizationPage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/admin/viewOrganizationGeneralInformation');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.page.waitForSelector('.oxd-form');
  }

  async isReady(): Promise<boolean> {
    return await this.page.isVisible('.oxd-form');
  }

  async editOrganizationName(name: string): Promise<void> {
    await this.page.fill('input[name="organization[name]"]', name);
    await this.page.click('.oxd-button:has-text("Save")');
  }

  async getOrganizationName(): Promise<string> {
    return (await this.page.inputValue('input[name="organization[name]"]')) || '';
  }

  async navigateToLocations(): Promise<void> {
    await this.page.goto('/web/index.php/admin/viewLocations');
  }

  async addLocation(location: { name: string; city: string; country: string }): Promise<void> {
    await this.page.click('.oxd-button:has-text("Add")');
    await this.page.fill('input[name="location[name]"]', location.name);
    await this.page.fill('input[name="location[city]"]', location.city);
    await this.page.selectOption('select[name="location[country]"]', location.country);
    await this.page.click('.oxd-button:has-text("Save")');
  }
}
