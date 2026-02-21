import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Locator, Page } from '@playwright/test';

export class EmployeeListPage extends BasePage {
  private readonly dataTable: DataTableComponent;

  constructor(page: Page) {
    super(page, '/web/index.php/pim/viewEmployeeList');
    this.dataTable = new DataTableComponent(page, '.oxd-table');
  }

  async getCellText(rowIndex: number, columnIndex: number): Promise<string> {
    return await this.dataTable.getCellText(rowIndex, columnIndex);
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

  private employeeNameSearchInput(): Locator {
    return this.page.getByRole('textbox', { name: /type for hints/i }).first();
  }

  private searchButton(): Locator {
    return this.page.getByRole('button', { name: 'Search' });
  }

  private matchingCardRow(namePattern: RegExp): Locator {
    return this.page.locator('.oxd-table-card').filter({ hasText: namePattern }).first();
  }

  private matchingSemanticRow(namePattern: RegExp): Locator {
    return this.page.getByRole('row').filter({ hasText: namePattern }).first();
  }

  private async resolveEmployeeRow(name: string): Promise<Locator> {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const namePattern = new RegExp(escapedName, 'i');

    const cardRow = this.matchingCardRow(namePattern);
    if ((await cardRow.count()) > 0) {
      await cardRow.waitFor({ state: 'visible', timeout: 10000 });
      return cardRow;
    }

    const semanticRow = this.matchingSemanticRow(namePattern);
    if ((await semanticRow.count()) > 0) {
      await semanticRow.waitFor({ state: 'visible', timeout: 10000 });
      return semanticRow;
    }

    throw new Error(`Employee '${name}' was not found in the employee list.`);
  }

  async searchEmployee(query: string): Promise<void> {
    const employeeNameInput = this.employeeNameSearchInput();
    await employeeNameInput.clear();
    await employeeNameInput.fill(query);

    await this.searchButton().click();
    await this.page.waitForLoadState('domcontentloaded');
    await this.page
      .locator('.oxd-loading-spinner')
      .waitFor({ state: 'hidden' })
      .catch(() => {});
    await this.waitForReady();
  }

  async findEmployee(name: string): Promise<void> {
    await this.searchEmployee(name);
    await this.resolveEmployeeRow(name);
  }

  async getEmployeeCount(): Promise<number> {
    return await this.dataTable.getRowCount();
  }

  async navigateToEmployee(name: string): Promise<void> {
    await this.findEmployee(name);

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const employeeRow = await this.resolveEmployeeRow(name);
        await employeeRow.click();
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const transientDomError =
          message.includes('Element is not attached') ||
          message.includes('element was detached') ||
          message.includes('strict mode violation');
        if (!transientDomError || attempt === 2) {
          throw error;
        }
      }
    }
  }

  async resetFilters(): Promise<void> {
    await this.page.getByRole('button', { name: 'Reset' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
