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
    await this.page.locator('.orangehrm-card-container').waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return await this.page
      .locator('.orangehrm-card-container')
      .isVisible()
      .catch(() => false);
  }

  async hasLeaveTypes(): Promise<boolean> {
    const noLeaveText = this.page.getByText('No Leave Types with Leave Balance');
    return !(await noLeaveText.isVisible().catch(() => false));
  }

  async selectLeaveType(type: string): Promise<void> {
    const form = this.page.locator('.oxd-form');
    const leaveTypeGroup = form.locator('.oxd-input-group').filter({ hasText: 'Leave Type' });
    const dropdown = leaveTypeGroup.locator('.oxd-select-text');
    await dropdown.click();
    await this.page.getByRole('option', { name: new RegExp(type, 'i') }).click();
  }

  async setDateRange(fromDate: string, toDate: string): Promise<void> {
    const fromInput = this.page.getByPlaceholder(/yyyy-dd-mm|yyyy-mm-dd/i).first();
    const toInput = this.page.getByPlaceholder(/yyyy-dd-mm|yyyy-mm-dd/i).nth(1);
    await fromInput.fill(fromDate);
    await toInput.fill(toDate);
  }

  async addComments(text: string): Promise<void> {
    const commentInput = this.page.getByPlaceholder(/comment/i).or(this.page.locator('textarea'));
    await commentInput.fill(text);
  }

  async apply(): Promise<void> {
    await this.page.getByRole('button', { name: /apply/i }).click();
  }

  async getBalance(): Promise<string> {
    const balance = this.page.locator('.leave-balance').or(this.page.getByText(/balance/i));
    return (await balance.textContent().catch(() => '')) || '';
  }
}
