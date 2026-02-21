import { BasePage } from '../base-page.js';
import type { Locator, Page } from '@playwright/test';

export interface AssignLeaveData {
  leaveType: string;
  fromDate: string;
  toDate: string;
  comment?: string;
}

export class AssignLeavePage extends BasePage {
  private readonly assignForm: Locator;
  private readonly employeeHintInput: Locator;
  private readonly leaveTypeField: Locator;
  private readonly assignButton: Locator;
  private readonly formLoader: Locator;
  private readonly successFeedback: Locator;

  constructor(page: Page) {
    super(page, '/web/index.php/leave/assignLeave');
    this.assignForm = this.page.locator('.oxd-form').first();
    this.employeeHintInput = this.page.getByPlaceholder(/type for hints/i).first();
    this.leaveTypeField = this.page
      .getByRole('combobox', { name: /leave type/i })
      .or(
        this.page
          .locator('.oxd-input-group')
          .filter({ hasText: /leave type/i })
          .locator('.oxd-select-text')
      )
      .first();
    this.assignButton = this.page.getByRole('button', { name: /assign/i }).first();
    this.formLoader = this.page.locator('.oxd-form-loader').first();
    this.successFeedback = this.page
      .locator('.oxd-toast')
      .filter({ hasText: /success|assigned|saved/i })
      .first()
      .or(this.page.getByText(/successfully saved|success/i).first());
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.page
      .getByRole('heading', { name: /assign leave/i })
      .or(this.assignForm)
      .first()
      .waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.page
      .getByRole('heading', { name: /assign leave/i })
      .or(this.assignForm)
      .first()
      .isVisible()
      .catch(() => false);
  }

  async selectEmployee(name: string): Promise<void> {
    await this.employeeHintInput.fill(name);
    await this.page
      .getByRole('option', { name: new RegExp(name, 'i') })
      .or(this.page.locator('.oxd-autocomplete-option, .oxd-autocomplete-dropdown-option').first())
      .first()
      .click();
  }

  async selectLeaveType(type: string): Promise<void> {
    await this.leaveTypeField.click();
    await this.page
      .getByRole('option', { name: new RegExp(type, 'i') })
      .or(
        this.page
          .locator('.oxd-select-option, .oxd-dropdown-option')
          .filter({ hasText: new RegExp(type, 'i') })
      )
      .first()
      .click();
  }

  async setDates(fromDate: string, toDate: string): Promise<void> {
    const fromInput = this.page
      .getByRole('textbox', { name: /from date/i })
      .or(this.page.locator('input[name="fromDate"]'))
      .or(
        this.page.getByPlaceholder(/yyyy[-/][md]{2}[-/][md]{2}|yyyy[-/][md]{2}[-/][md]{2}/i).first()
      );
    const toInput = this.page
      .getByRole('textbox', { name: /to date/i })
      .or(this.page.locator('input[name="toDate"]'))
      .or(
        this.page.getByPlaceholder(/yyyy[-/][md]{2}[-/][md]{2}|yyyy[-/][md]{2}[-/][md]{2}/i).nth(1)
      );
    await fromInput.first().fill(fromDate);
    await toInput.first().fill(toDate);
  }

  async assign(): Promise<void> {
    await this.assignButton.click();
  }

  async assignLeave(employee: string, leaveData: AssignLeaveData): Promise<void> {
    await this.waitForReady();
    await this.selectEmployee(employee);
    await this.selectLeaveType(leaveData.leaveType);
    await this.setDates(leaveData.fromDate, leaveData.toDate);

    if (leaveData.comment) {
      await this.page
        .getByPlaceholder(/comment/i)
        .or(this.page.locator('textarea'))
        .first()
        .fill(leaveData.comment);
    }

    await this.assign();
    await this.formLoader.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.successFeedback.waitFor({ state: 'visible', timeout: 10000 });
  }
}
