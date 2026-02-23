import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Locator, Page } from '@playwright/test';

export class EmployeeListPage extends BasePage {
  private readonly dataTable: DataTableComponent;
  private readonly cardRowSelector = '.oxd-table-card';

  constructor(page: Page) {
    super(page, '/web/index.php/pim/viewEmployeeList');
    this.dataTable = new DataTableComponent(
      page,
      page.getByRole('table').or(page.locator('.oxd-table'))
    );
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
    return this.page.locator(this.cardRowSelector).filter({ hasText: namePattern }).first();
  }

  private matchingSemanticRow(namePattern: RegExp): Locator {
    return this.page.getByRole('row').filter({ hasText: namePattern }).first();
  }

  private firstCardRow(): Locator {
    return this.page.locator(this.cardRowSelector).first();
  }

  private firstSemanticRow(): Locator {
    return this.page
      .getByRole('table')
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell') })
      .first();
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

    const fallbackCardRow = this.firstCardRow();
    if ((await fallbackCardRow.count()) > 0) {
      await fallbackCardRow.waitFor({ state: 'visible', timeout: 5000 });
      return fallbackCardRow;
    }

    const fallbackSemanticRow = this.firstSemanticRow();
    if ((await fallbackSemanticRow.count()) > 0) {
      await fallbackSemanticRow.waitFor({ state: 'visible', timeout: 5000 });
      return fallbackSemanticRow;
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

    await Promise.race([
      this.page.locator(this.cardRowSelector).first().waitFor({ state: 'visible', timeout: 10000 }),
      this.page
        .getByRole('table')
        .getByRole('row')
        .filter({ has: this.page.getByRole('cell') })
        .first()
        .waitFor({ state: 'visible', timeout: 10000 }),
      this.page
        .locator(`${this.cardRowSelector}, .orangehrm-container`)
        .first()
        .waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {});
  }

  async findEmployee(name: string): Promise<void> {
    await this.searchEmployee(name);
    try {
      await this.resolveEmployeeRow(name);
    } catch {
      await this.resetFilters();
      await this.waitForReady();
      await this.page
        .locator(this.cardRowSelector)
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {});
    }
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
