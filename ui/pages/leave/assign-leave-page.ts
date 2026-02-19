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
    await this.page
      .getByRole('heading', { name: /assign leave/i })
      .or(this.page.locator('.oxd-form'))
      .first()
      .waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.page
      .getByRole('heading', { name: /assign leave/i })
      .or(this.page.locator('.oxd-form'))
      .first()
      .isVisible()
      .catch(() => false);
  }

  async selectEmployee(name: string): Promise<void> {
    await this.page
      .getByPlaceholder(/type for hints/i)
      .first()
      .fill(name);
    await this.page
      .getByRole('option', { name: new RegExp(name, 'i') })
      .or(this.page.locator('.oxd-autocomplete-option, .oxd-autocomplete-dropdown-option').first())
      .first()
      .click();
  }

  async selectLeaveType(type: string): Promise<void> {
    await this.page
      .getByRole('combobox', { name: /leave type/i })
      .or(
        this.page
          .locator('.oxd-input-group')
          .filter({ hasText: /leave type/i })
          .locator('.oxd-select-text')
      )
      .first()
      .click();
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
    await this.page.getByRole('button', { name: /assign/i }).click();
  }
}
