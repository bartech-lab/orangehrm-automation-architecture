import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Page } from '@playwright/test';

type ReportCriteria = {
  reportName: string;
};

export class ReportsPage extends BasePage {
  private readonly dataTable: DataTableComponent;

  constructor(page: Page) {
    super(page, '/web/index.php/pim/viewDefinedPredefinedReports');
    this.dataTable = new DataTableComponent(
      page,
      page.getByRole('table').or(page.locator('.oxd-table'))
    );
  }

  private async selectDropdownOption(field: RegExp, option: string): Promise<void> {
    const dropdown = this.page
      .getByRole('combobox', { name: field })
      .or(
        this.page.locator('.oxd-input-group').filter({ hasText: field }).locator('.oxd-select-text')
      );
    await dropdown.first().click();
    await this.page
      .getByRole('option', { name: new RegExp(option, 'i') })
      .or(
        this.page
          .locator('.oxd-select-option, .oxd-dropdown-option')
          .filter({ hasText: new RegExp(option, 'i') })
      )
      .first()
      .click();
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.dataTable.waitForReady();
  }

  async isReady(): Promise<boolean> {
    return await this.dataTable.isVisible();
  }

  async searchReport(name: string): Promise<void> {
    await this.dataTable.search(name);
  }

  async runReport(reportName: string): Promise<void> {
    await this.searchReport(reportName);
    await this.page
      .getByRole('button', { name: /run|view/i })
      .or(this.page.locator('.oxd-table-cell-action-run'))
      .first()
      .click();
    await this.page
      .locator('.oxd-loading-spinner')
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {});
  }

  async generateReport(criteria: ReportCriteria): Promise<void> {
    await this.waitForReady();
    await this.runReport(criteria.reportName);

    await Promise.race([
      this.page.waitForURL(/\/web\/index\.php\/pim\/displayPredefinedReport\//, { timeout: 10000 }),
      this.page
        .getByRole('table')
        .or(this.page.locator('.oxd-table, .orangehrm-container'))
        .first()
        .waitFor({ state: 'visible', timeout: 10000 }),
    ]);
  }

  async configureReport(config: { name: string; criteria: string }): Promise<void> {
    await this.page.getByRole('button', { name: /add/i }).click();
    await this.page
      .getByRole('textbox', { name: /report name|name/i })
      .or(this.page.locator('input[name="report[name]"]'))
      .first()
      .fill(config.name);
    await this.selectDropdownOption(/criteria/i, config.criteria);
    await this.page.getByRole('button', { name: /save/i }).click();
  }
}
