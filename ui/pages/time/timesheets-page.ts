import { BasePage } from '../base-page.js';
import type { Locator, Page } from '@playwright/test';

export interface TimeEntryData {
  project: string;
  activity: string;
  hours: Record<string, string>;
}

export class TimesheetsPage extends BasePage {
  private readonly tableContainer: Locator;
  private readonly successFeedback: Locator;

  constructor(page: Page) {
    super(page, '/web/index.php/time/viewEmployeeTimesheet');
    this.tableContainer = this.page.getByRole('table').or(this.page.locator('.oxd-table')).first();
    this.successFeedback = this.page
      .getByRole('alert')
      .filter({ hasText: /success|successfully|saved|submitted|approved/i })
      .first()
      .or(this.page.getByText(/successfully|saved|submitted/i).first())
      .or(this.page.locator('.oxd-toast').first());
  }

  private dateInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /date/i })
      .or(this.page.locator('input[name="date"]'))
      .first();
  }

  private projectRow(projectName: string): Locator {
    return this.page
      .getByRole('row')
      .filter({ hasText: new RegExp(projectName, 'i') })
      .first();
  }

  private hoursInputForRow(row: Locator, dayIndex: number): Locator {
    return row.getByRole('textbox').nth(dayIndex);
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await this.tableContainer.waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.tableContainer.isVisible().catch(() => false);
  }

  async selectWeek(date: string): Promise<void> {
    await this.dateInput().fill(date);
    await this.page.getByRole('button', { name: /view/i }).click();
    await this.tableContainer.waitFor({ state: 'visible' });
  }

  async recordTimeEntry(project: string, day: number, hours: string): Promise<void> {
    const row = this.projectRow(project);
    await row.waitFor({ state: 'visible' });
    const hoursInput = this.hoursInputForRow(row, day);
    await hoursInput.fill(hours);
  }

  async recordTimeEntries(entries: TimeEntryData): Promise<void> {
    const row = this.projectRow(entries.project);
    await row.waitFor({ state: 'visible' });

    const dayEntries = Object.entries(entries.hours);
    for (const [dayIndex, hours] of dayEntries) {
      const input = this.hoursInputForRow(row, parseInt(dayIndex, 10));
      await input.fill(hours);
    }
  }

  async submitTimesheet(): Promise<void> {
    await this.page.getByRole('button', { name: /submit/i }).click();
    await this.successFeedback.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async approveTimesheet(): Promise<void> {
    await this.page.getByRole('button', { name: /approve/i }).click();
    await this.successFeedback.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async submitTimesheetForWeek(date: string): Promise<void> {
    await this.selectWeek(date);
    await this.submitTimesheet();
  }

  async hasTimesheetForWeek(date: string): Promise<boolean> {
    await this.selectWeek(date);
    return this.tableContainer.isVisible().catch(() => false);
  }
}
