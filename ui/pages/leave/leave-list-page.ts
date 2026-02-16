import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Page } from '@playwright/test';

export class LeaveListPage extends BasePage {
  readonly dataTable: DataTableComponent;

  constructor(page: Page) {
    super(page, '/web/index.php/leave/viewLeaveList');
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

  async filterByStatus(status: string): Promise<void> {
    await this.page.selectOption('.oxd-select:has-text("Status") select', status);
  }

  async filterByType(type: string): Promise<void> {
    await this.page.selectOption('.oxd-select:has-text("Leave Type") select', type);
  }

  async searchEmployee(name: string): Promise<void> {
    await this.page.fill('input[placeholder="Type for hints..."]', name);
    await this.page.click('.oxd-autocomplete-dropdown-option');
  }

  async viewLeaveDetails(row: number): Promise<void> {
    await this.dataTable.clickRow(row);
  }
}
