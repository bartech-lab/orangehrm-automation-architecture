import { BasePage } from '../base-page.js';
import type { Page } from '@playwright/test';

export class ApplyLeavePage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/leave/applyLeave');
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

  async selectLeaveType(type: string): Promise<void> {
    await this.page.selectOption('select[name="leaveType"]', type);
  }

  async setDateRange(fromDate: string, toDate: string): Promise<void> {
    await this.page.fill('input[name="fromDate"]', fromDate);
    await this.page.fill('input[name="toDate"]', toDate);
  }

  async addComments(text: string): Promise<void> {
    await this.page.fill('textarea[name="comment"]', text);
  }

  async apply(): Promise<void> {
    await this.page.click('.oxd-button:has-text("Apply")');
  }

  async getBalance(): Promise<string> {
    return (await this.page.locator('.leave-balance').textContent()) || '';
  }
}
