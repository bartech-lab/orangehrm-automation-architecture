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
    const statusGroup = this.page.locator('.oxd-input-group').filter({ hasText: 'Status' });
    await statusGroup.locator('.oxd-select-text').click();
    await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click();
  }

  async filterByType(type: string): Promise<void> {
    const typeGroup = this.page.locator('.oxd-input-group').filter({ hasText: 'Leave Type' });
    await typeGroup.locator('.oxd-select-text').click();
    await this.page.getByRole('option', { name: new RegExp(type, 'i') }).click();
  }

  async searchEmployee(name: string): Promise<void> {
    const hintInput = this.page.getByPlaceholder(/type for hints/i).first();
    await hintInput.fill(name);
    await this.page.waitForTimeout(500);
    const option = this.page.locator('.oxd-autocomplete-option, .oxd-dropdown-option').first();
    await option.click();
  }

  async viewLeaveDetails(row: number): Promise<void> {
    await this.dataTable.clickRow(row);
  }

  async approveLeave(row: number): Promise<void> {
    await this.viewLeaveDetails(row);
    await this.page.getByRole('button', { name: /approve/i }).click();
  }
}
