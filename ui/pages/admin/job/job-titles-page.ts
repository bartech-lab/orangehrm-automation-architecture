import { BasePage } from '../../base-page.js';
import { DataTableComponent } from '../../../components/index.js';
import type { Page } from '@playwright/test';

export class JobTitlesPage extends BasePage {
  readonly dataTable: DataTableComponent;

  constructor(page: Page) {
    super(page, '/web/index.php/admin/viewJobTitleList');
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

  async addJobTitle(title: string, description?: string): Promise<void> {
    await this.page.click('.oxd-button:has-text("Add")');
    await this.page.fill('input[name="jobTitle[jobTitle]"]', title);
    if (description) {
      await this.page.fill('textarea[name="jobTitle[description]"]', description);
    }
    await this.page.click('.oxd-button:has-text("Save")');
  }

  async editJobTitle(oldTitle: string, newTitle: string): Promise<void> {
    await this.dataTable.search(oldTitle);
    await this.page.click('.oxd-table-cell-action-edit');
    await this.page.fill('input[name="jobTitle[jobTitle]"]', newTitle);
    await this.page.click('.oxd-button:has-text("Save")');
  }

  async deleteJobTitle(title: string): Promise<void> {
    await this.dataTable.search(title);
    await this.page.click('.oxd-table-cell-action-delete');
    await this.page.click('.oxd-button:has-text("Yes, Delete")');
  }
}
