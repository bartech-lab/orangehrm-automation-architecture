import { BasePage } from '../base-page.js';
import type { Page } from '@playwright/test';

export class TimesheetsPage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/time/viewEmployeeTimesheet');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.page.waitForSelector('.oxd-table');
  }

  async isReady(): Promise<boolean> {
    return await this.page.isVisible('.oxd-table');
  }

  async selectWeek(date: string): Promise<void> {
    await this.page.fill('input[name="date"]', date);
    await this.page.click('.oxd-button:has-text("View")');
  }

  async enterHours(project: string, hours: string): Promise<void> {
    await this.page.fill(`input[data-project="${project}"]`, hours);
  }

  async submitTimesheet(): Promise<void> {
    await this.page.click('.oxd-button:has-text("Submit")');
  }

  async approveTimesheet(): Promise<void> {
    await this.page.click('.oxd-button:has-text("Approve")');
  }
}
