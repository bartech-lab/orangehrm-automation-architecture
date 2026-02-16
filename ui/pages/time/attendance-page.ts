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
    await this.page.waitForSelector('.oxd-form');
  }

  async isReady(): Promise<boolean> {
    return await this.page.isVisible('.oxd-form');
  }

  async punchIn(): Promise<void> {
    await this.page.click('.oxd-button:has-text("In")');
  }

  async punchOut(): Promise<void> {
    await this.page.click('.oxd-button:has-text("Out")');
  }

  async viewAttendanceRecords(): Promise<void> {
    await this.page.goto('/web/index.php/attendance/viewAttendanceRecord');
  }

  async editRecord(date: string): Promise<void> {
    await this.viewAttendanceRecords();
    await this.page.fill('input[name="date"]', date);
    await this.page.click('.oxd-button:has-text("View")');
  }
}
