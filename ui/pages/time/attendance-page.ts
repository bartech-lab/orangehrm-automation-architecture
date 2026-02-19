import { BasePage } from '../base-page.js';
import type { Page } from '@playwright/test';

export class AttendancePage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/attendance/punchIn');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.page
      .getByRole('heading', { name: /punch/i })
      .or(this.page.locator('.oxd-form'))
      .first()
      .waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.page
      .getByRole('heading', { name: /punch/i })
      .or(this.page.locator('.oxd-form'))
      .first()
      .isVisible()
      .catch(() => false);
  }

  async punchIn(): Promise<void> {
    await this.page.getByRole('button', { name: /^in$/i }).click();
  }

  async punchOut(): Promise<void> {
    await this.page.getByRole('button', { name: /^out$/i }).click();
  }

  async viewAttendanceRecords(): Promise<void> {
    await this.page.goto('/web/index.php/attendance/viewAttendanceRecord');
  }

  async editRecord(date: string): Promise<void> {
    await this.viewAttendanceRecords();
    await this.page
      .getByRole('textbox', { name: /date/i })
      .or(this.page.locator('input[name="date"]'))
      .first()
      .fill(date);
    await this.page.getByRole('button', { name: /view/i }).click();
  }
}
