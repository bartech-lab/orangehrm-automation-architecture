import { BasePage } from '../base-page.js';
import type { Locator, Page } from '@playwright/test';

export interface LeaveRequestData {
  leaveType: string;
  fromDate: string;
  toDate: string;
  comment?: string;
}

export class ApplyLeavePage extends BasePage {
  private readonly leaveFormContainer: Locator;
  private readonly leaveForm: Locator;
  private readonly formLoader: Locator;
  private readonly successFeedback: Locator;

  constructor(page: Page) {
    super(page, '/web/index.php/leave/applyLeave');
    this.leaveFormContainer = this.page.locator('.orangehrm-card-container').first();
    this.leaveForm = this.page.getByRole('form').or(this.page.locator('.oxd-form')).first();
    this.formLoader = this.page.locator('.oxd-form-loader').first();
    this.successFeedback = this.page
      .getByRole('alert')
      .filter({ hasText: /success|successfully|saved|submitted/i })
      .first()
      .or(
        this.page
          .locator('.oxd-toast')
          .filter({ hasText: /success|successfully|saved|submitted/i })
          .first()
      )
      .or(this.page.getByText(/successfully saved|success/i).first());
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.leaveFormContainer.waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.leaveFormContainer.isVisible().catch(() => false);
  }

  async hasLeaveTypes(): Promise<boolean> {
    const noLeaveText = this.page.getByText('No Leave Types with Leave Balance');
    const noLeaveVisible = await noLeaveText
      .first()
      .isVisible()
      .catch(() => false);
    return !noLeaveVisible;
  }

  async selectLeaveType(type: string): Promise<void> {
    const leaveTypeGroup = this.leaveForm
      .getByRole('group', { name: /leave type/i })
      .or(this.leaveForm.locator('.oxd-input-group').filter({ hasText: 'Leave Type' }))
      .first();
    const dropdown = leaveTypeGroup
      .getByRole('combobox')
      .or(leaveTypeGroup.locator('.oxd-select-text'))
      .first();
    await dropdown.waitFor({ state: 'visible', timeout: 5000 });
    await this.formLoader.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await dropdown.click({ timeout: 5000 });
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isTransientUiState =
          message.includes('intercepts pointer events') ||
          message.includes('Element is not attached') ||
          message.includes('element was detached');
        if (!isTransientUiState || attempt === 1) {
          throw error;
        }

        await this.formLoader.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      }
    }

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
    await this.formLoader.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    const applyButton = this.page
      .getByRole('form')
      .getByRole('button', { name: /apply/i })
      .first()
      .or(this.page.locator('.oxd-form button[type="submit"]').first());
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        await applyButton.click();
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isTransientUiState =
          message.includes('intercepts pointer events') ||
          message.includes('Element is not attached') ||
          message.includes('element was detached');
        if (!isTransientUiState || attempt === 1) {
          throw error;
        }

        await this.formLoader.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      }
    }

    await this.formLoader.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
  }

  async submitLeaveRequest(data: LeaveRequestData): Promise<void> {
    await this.waitForReady();
    await this.selectLeaveType(data.leaveType);
    await this.setDateRange(data.fromDate, data.toDate);
    if (data.comment) {
      await this.addComments(data.comment);
    }
    await this.apply();
    await this.successFeedback.waitFor({ state: 'visible', timeout: 10000 });
  }

  async getBalance(): Promise<string> {
    const balance = this.page.locator('.leave-balance').or(this.page.getByText(/balance/i));
    return (await balance.textContent().catch(() => '')) || '';
  }
}
