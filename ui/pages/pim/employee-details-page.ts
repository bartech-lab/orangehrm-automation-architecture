import { BasePage } from '../base-page.js';
import type { Page } from '@playwright/test';

export class EmployeeDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/pim/viewPersonalDetails');
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

  async navigateToTab(tabName: string): Promise<void> {
    await this.page.click(`.oxd-tab:has-text("${tabName}")`);
  }

  async editPersonalDetails(details: { firstName?: string; lastName?: string }): Promise<void> {
    if (details.firstName) {
      await this.page.fill('input[name="firstName"]', details.firstName);
    }
    if (details.lastName) {
      await this.page.fill('input[name="lastName"]', details.lastName);
    }
    await this.page.click('.oxd-button:has-text("Save")');
  }

  async editContactDetails(contact: { email?: string; phone?: string }): Promise<void> {
    await this.navigateToTab('Contact Details');
    if (contact.email) {
      await this.page.fill('input[name="contact[workEmail]"]', contact.email);
    }
    if (contact.phone) {
      await this.page.fill('input[name="contact[workTelephone]"]', contact.phone);
    }
    await this.page.click('.oxd-button:has-text("Save")');
  }

  async viewJobInformation(): Promise<void> {
    await this.navigateToTab('Job');
  }
}
