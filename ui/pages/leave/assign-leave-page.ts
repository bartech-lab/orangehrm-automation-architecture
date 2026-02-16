import { BasePage } from '../base-page.js';
import type { Page } from '@playwright/test';

export class AssignLeavePage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/leave/assignLeave');
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

  async selectEmployee(name: string): Promise<void> {
    await this.page.fill('input[placeholder="Type for hints..."]', name);
    await this.page.click('.oxd-autocomplete-dropdown-option');
  }

  async selectLeaveType(type: string): Promise<void> {
    await this.page.selectOption('select[name="leaveType"]', type);
  }

  async setDates(fromDate: string, toDate: string): Promise<void> {
    await this.page.fill('input[name="fromDate"]', fromDate);
    await this.page.fill('input[name="toDate"]', toDate);
  }

  async assign(): Promise<void> {
    await this.page.click('.oxd-button:has-text("Assign")');
  }
}
