import { BasePage } from '../base-page.js';
import type { Locator, Page } from '@playwright/test';

export class AttendancePage extends BasePage {
  private readonly formContainer: Locator;
  private readonly tableContainer: Locator;
  private readonly successFeedback: Locator;

  constructor(page: Page) {
    super(page, '/web/index.php/attendance/punchIn');
    this.formContainer = this.page.getByRole('form').or(this.page.locator('.oxd-form')).first();
    this.tableContainer = this.page.getByRole('table').or(this.page.locator('.oxd-table')).first();
    this.successFeedback = this.page
      .getByRole('alert')
      .filter({ hasText: /success|successfully|saved|punched/i })
      .first()
      .or(this.page.getByText(/successfully|punched/i).first())
      .or(this.page.locator('.oxd-toast').first());
  }

  private punchInButton(): Locator {
    return this.page.getByRole('button', { name: /^in$/i });
  }

  private punchOutButton(): Locator {
    return this.page.getByRole('button', { name: /^out$/i });
  }

  private dateInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /date/i })
      .or(this.page.locator('input[name="date"]'))
      .first();
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.page
      .getByRole('heading', { name: /punch/i })
      .or(this.formContainer)
      .first()
      .waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.page
      .getByRole('heading', { name: /punch/i })
      .or(this.formContainer)
      .first()
      .isVisible()
      .catch(() => false);
  }

  async recordPunchIn(): Promise<void> {
    await this.punchInButton().click();
    await this.successFeedback.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async recordPunchOut(): Promise<void> {
    await this.punchOutButton().click();
    await this.successFeedback.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async viewAttendanceRecords(): Promise<void> {
    await this.page.goto('/web/index.php/attendance/viewAttendanceRecord');
    await this.tableContainer.waitFor({ state: 'visible' }).catch(() => {});
  }

  async viewRecordsForDate(date: string): Promise<void> {
    await this.viewAttendanceRecords();
    await this.dateInput().fill(date);
    await this.page.getByRole('button', { name: /view/i }).click();
    await this.tableContainer.waitFor({ state: 'visible' });
  }

  async hasRecordForDate(date: string): Promise<boolean> {
    await this.viewRecordsForDate(date);
    return this.tableContainer.isVisible().catch(() => false);
  }

  async canPunchIn(): Promise<boolean> {
    return this.punchInButton()
      .isVisible()
      .catch(() => false);
  }

  async canPunchOut(): Promise<boolean> {
    return this.punchOutButton()
      .isVisible()
      .catch(() => false);
  }
}
