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

    await this.page.getByRole('button', { name: 'Search' }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getEmployeeCount(): Promise<number> {
    return await this.dataTable.getRowCount();
  }

  async navigateToEmployee(name: string): Promise<void> {
    await this.searchEmployee(name);
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const rowByCard = this.page
          .locator('.oxd-table-card')
          .filter({ hasText: new RegExp(escapedName, 'i') })
          .first();

        if ((await rowByCard.count()) > 0) {
          await rowByCard.click();
          return;
        }

        const semanticRow = this.page
          .getByRole('row')
          .filter({ hasText: new RegExp(escapedName, 'i') })
          .first();

        if ((await semanticRow.count()) > 0) {
          await semanticRow.click();
          return;
        }

        const firstCardRow = this.page.locator('.oxd-table-card').first();
        if ((await firstCardRow.count()) > 0) {
          await firstCardRow.click();
          return;
        }

        await this.page
          .getByRole('row')
          .filter({ has: this.page.getByRole('cell') })
          .first()
          .click();
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
