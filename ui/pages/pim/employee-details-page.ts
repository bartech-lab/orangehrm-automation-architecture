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
    await this.page
      .getByRole('form')
      .or(this.page.locator('.oxd-form'))
      .first()
      .waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return await this.page
      .getByRole('form')
      .or(this.page.locator('.oxd-form'))
      .first()
      .isVisible()
      .catch(() => false);
  }

  async navigateToTab(tabName: string): Promise<void> {
    await this.page.getByRole('tab', { name: new RegExp(tabName, 'i') }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async editPersonalDetails(details: { firstName?: string; lastName?: string }): Promise<void> {
    if (details.firstName) {
      await this.page.getByPlaceholder('First Name').fill(details.firstName);
    }
    if (details.lastName) {
      await this.page.getByPlaceholder('Last Name').fill(details.lastName);
    }
    await this.page.getByRole('button', { name: 'Save' }).first().click();
  }

  async editContactDetails(contact: { email?: string; phone?: string }): Promise<void> {
    await this.navigateToTab('Contact Details');

    if (contact.email) {
      await this.page.getByLabel(/email/i).fill(contact.email);
    }
    if (contact.phone) {
      await this.page.getByLabel(/phone|telephone/i).fill(contact.phone);
    }
    await this.page.getByRole('button', { name: 'Save' }).first().click();
  }

  async viewJobInformation(): Promise<void> {
    await this.navigateToTab('Job');
  }
}
