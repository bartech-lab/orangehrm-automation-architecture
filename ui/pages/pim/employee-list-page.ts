import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Page } from '@playwright/test';

export class EmployeeListPage extends BasePage {
  readonly dataTable: DataTableComponent;

  constructor(page: Page) {
    super(page, '/web/index.php/pim/viewEmployeeList');
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

  async searchEmployee(query: string): Promise<void> {
    const empNameInput = this.page.getByRole('textbox', { name: /type for hints/i }).first();
    await empNameInput.clear();
    await empNameInput.fill(query);
    await this.page.waitForTimeout(500);

    await this.page.getByRole('button', { name: 'Search' }).click();
    await this.page.waitForLoadState('networkidle');
  }

  async getEmployeeCount(): Promise<number> {
    return await this.dataTable.getRowCount();
  }

  async navigateToEmployee(name: string): Promise<void> {
    await this.searchEmployee(name);
    const row = this.page
      .getByRole('row')
      .filter({ hasText: new RegExp(name, 'i') })
      .first();
    await row.waitFor({ state: 'visible' });
    await row.scrollIntoViewIfNeeded();
    await row.click();
  }

  async resetFilters(): Promise<void> {
    await this.page.getByRole('button', { name: 'Reset' }).click();
    await this.page.waitForLoadState('networkidle');
  }
}
