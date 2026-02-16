import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Page } from '@playwright/test';

export class ReportsPage extends BasePage {
  readonly dataTable: DataTableComponent;

  constructor(page: Page) {
    super(page, '/web/index.php/pim/viewDefinedPredefinedReports');
    this.dataTable = new DataTableComponent(page, '.oxd-table');
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
    await this.page.click('.oxd-table-cell-action-run');
  }

  async configureReport(config: { name: string; criteria: string }): Promise<void> {
    await this.page.click('.oxd-button:has-text("Add")');
    await this.page.fill('input[name="report[name]"]', config.name);
    await this.page.selectOption('select[name="report[criteria]"]', config.criteria);
    await this.page.click('.oxd-button:has-text("Save")');
  }
}
