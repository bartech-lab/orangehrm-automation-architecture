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
    await this.page
      .getByRole('table')
      .or(this.page.locator('.oxd-table'))
      .first()
      .waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.page
      .getByRole('table')
      .or(this.page.locator('.oxd-table'))
      .first()
      .isVisible()
      .catch(() => false);
  }

  async selectWeek(date: string): Promise<void> {
    await this.page
      .getByRole('textbox', { name: /date/i })
      .or(this.page.locator('input[name="date"]'))
      .first()
      .fill(date);
    await this.page.getByRole('button', { name: /view/i }).click();
  }

  async enterHours(project: string, hours: string): Promise<void> {
    await this.page.fill(`input[data-project="${project}"]`, hours);
  }

  async submitTimesheet(): Promise<void> {
    await this.page.getByRole('button', { name: /submit/i }).click();
  }

  async approveTimesheet(): Promise<void> {
    await this.page.getByRole('button', { name: /approve/i }).click();
  }
}
