import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Locator, Page } from '@playwright/test';

export interface LeaveRequestCriteria {
  employeeName?: string;
  status?: string;
  leaveType?: string;
  containsText?: string;
}

export class LeaveListPage extends BasePage {
  readonly dataTable: DataTableComponent;
  private readonly statusFilterGroup: Locator;
  private readonly leaveTypeFilterGroup: Locator;
  private readonly employeeSearchInput: Locator;
  private readonly searchButton: Locator;
  private readonly tableLoader: Locator;

  constructor(page: Page) {
    super(page, '/web/index.php/leave/viewLeaveList');
    this.dataTable = new DataTableComponent(page, '.oxd-table');
    this.statusFilterGroup = this.page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Status' })
      .first();
    this.leaveTypeFilterGroup = this.page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Leave Type' })
      .first();
    this.employeeSearchInput = this.page.getByPlaceholder(/type for hints/i).first();
    this.searchButton = this.page.getByRole('button', { name: /search/i }).first();
    this.tableLoader = this.page.locator('.oxd-form-loader').first();
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
    await this.statusFilterGroup.locator('.oxd-select-text').click();
    await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click();
  }

  async filterByType(type: string): Promise<void> {
    await this.leaveTypeFilterGroup.locator('.oxd-select-text').click();
    const dropdown = this.page.locator('.oxd-select-dropdown').last();
    const escapedType = type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exactOption = dropdown.getByRole('option', {
      name: new RegExp(`^\\s*${escapedType}\\s*$`, 'i'),
    });
    if ((await exactOption.count()) > 0) {
      await exactOption.first().click();
      return;
    }

    await dropdown
      .getByRole('option')
      .filter({ hasText: new RegExp(escapedType, 'i') })
      .first()
      .click();
  }

  async searchEmployee(name: string): Promise<void> {
    await this.employeeSearchInput.fill(name);
    const option = this.page.locator('.oxd-autocomplete-option, .oxd-dropdown-option').first();
    await option.waitFor({ state: 'visible' });
    await option.click();
  }

  async findLeaveRequest(criteria: LeaveRequestCriteria): Promise<number | null> {
    await this.waitForReady();
    if (criteria.employeeName) {
      await this.searchEmployee(criteria.employeeName);
    }
    if (criteria.status) {
      await this.filterByStatus(criteria.status);
    }
    if (criteria.leaveType) {
      await this.filterByType(criteria.leaveType);
    }

    await this.searchButton.click();
    await this.tableLoader.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    await this.waitForReady();

    const rowCount = await this.dataTable.getRowCount();
    for (let row = 0; row < rowCount; row++) {
      const rowText = (await this.getRowText(row)).toLowerCase();
      if (this.matchesCriteria(rowText, criteria)) {
        return row;
      }
    }

    return null;
  }

  async viewLeaveDetails(row: number): Promise<void> {
    await this.dataTable.clickRow(row);
  }

  async approveLeave(row: number): Promise<void> {
    await this.viewLeaveDetails(row);
    await this.page.getByRole('button', { name: /approve/i }).click();
  }

  private async getRowText(row: number): Promise<string> {
    const cardRows = this.page.locator('.oxd-table-card');
    if ((await cardRows.count()) > 0) {
      return (await cardRows.nth(row).textContent())?.trim() ?? '';
    }

    const semanticRows = this.page.getByRole('row').filter({ has: this.page.getByRole('cell') });
    return (await semanticRows.nth(row).textContent())?.trim() ?? '';
  }

  private matchesCriteria(rowText: string, criteria: LeaveRequestCriteria): boolean {
    const expectedValues = [
      criteria.employeeName,
      criteria.status,
      criteria.leaveType,
      criteria.containsText,
    ].filter((value): value is string => Boolean(value));

    return expectedValues.every((value) => rowText.includes(value.toLowerCase()));
  }
}
