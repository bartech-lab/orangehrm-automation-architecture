import { BasePage } from '../../base-page.js';
import { DataTableComponent } from '../../../components/index.js';
import type { Page } from '@playwright/test';

export class JobTitlesPage extends BasePage {
  readonly dataTable: DataTableComponent;

  constructor(page: Page) {
    super(page, '/web/index.php/admin/viewJobTitleList');
    this.dataTable = new DataTableComponent(
      page,
      page.getByRole('table').or(page.locator('.oxd-table'))
    );
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

  async addJobTitle(title: string, description?: string): Promise<void> {
    await this.page.getByRole('button', { name: /add/i }).click();
    await this.page
      .getByRole('textbox', { name: /job title/i })
      .or(this.page.locator('input[name="jobTitle[jobTitle]"]'))
      .fill(title);
    if (description) {
      await this.page
        .getByRole('textbox', { name: /description/i })
        .or(this.page.locator('textarea[name="jobTitle[description]"]'))
        .fill(description);
    }
    await this.page.getByRole('button', { name: /save/i }).click();
  }

  async editJobTitle(oldTitle: string, newTitle: string): Promise<void> {
    await this.dataTable.search(oldTitle);
    await this.page
      .getByRole('button', { name: /edit/i })
      .or(this.page.locator('.oxd-table-cell-action-edit'))
      .first()
      .click();
    await this.page
      .getByRole('textbox', { name: /job title/i })
      .or(this.page.locator('input[name="jobTitle[jobTitle]"]'))
      .fill(newTitle);
    await this.page.getByRole('button', { name: /save/i }).click();
  }

  async deleteJobTitle(title: string): Promise<void> {
    await this.dataTable.search(title);
    await this.page
      .getByRole('button', { name: /delete/i })
      .or(this.page.locator('.oxd-table-cell-action-delete'))
      .first()
      .click();
    await this.page
      .getByRole('button', { name: /yes,?\s*delete/i })
      .or(this.page.locator('.oxd-dialog-container .oxd-button--label-danger'))
      .click();
  }
}
