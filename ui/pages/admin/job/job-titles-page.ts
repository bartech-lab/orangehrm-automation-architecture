import { BasePage } from '../../base-page.js';
import { DataTableComponent } from '../../../components/index.js';
import type { Page } from '@playwright/test';

export class JobTitlesPage extends BasePage {
  private readonly dataTable: DataTableComponent;

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

  private jobTitleRow(title: string) {
    return this.page
      .getByRole('row')
      .filter({ hasText: new RegExp(title, 'i') })
      .or(this.page.locator('.oxd-table-card').filter({ hasText: new RegExp(title, 'i') }))
      .first();
  }

  async findJobTitle(title: string): Promise<boolean> {
    await this.waitForReady();
    await this.dataTable.search(title);

    const row = this.jobTitleRow(title);
    await row.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    return row.isVisible().catch(() => false);
  }

  async createJobTitle(job: { title: string; description?: string }): Promise<void> {
    await this.waitForReady();
    await this.page.getByRole('button', { name: /add/i }).click();
    await this.page.getByRole('textbox', { name: /job title/i }).fill(job.title);
    if (job.description) {
      await this.page.getByRole('textbox', { name: /description/i }).fill(job.description);
    }
    await this.page.getByRole('button', { name: /save/i }).click();

    await this.waitForReady();
    const created = await this.findJobTitle(job.title);
    if (!created) {
      throw new Error(`Expected created job title to appear in table: ${job.title}`);
    }
  }

  async addJobTitle(title: string, description?: string): Promise<void> {
    await this.createJobTitle({ title, description });
  }

  async editJobTitle(oldTitle: string, newTitle: string): Promise<void> {
    await this.dataTable.search(oldTitle);
    const editButton = this.jobTitleRow(oldTitle).getByRole('button', { name: /edit/i }).first();
    await editButton.scrollIntoViewIfNeeded();
    await editButton.click();
    await this.page.getByRole('textbox', { name: /job title/i }).fill(newTitle);
    await this.page.getByRole('button', { name: /save/i }).click();

    await this.waitForReady();
    const renamed = await this.findJobTitle(newTitle);
    if (!renamed) {
      throw new Error(`Expected updated job title to appear in table: ${newTitle}`);
    }
  }

  async deleteJobTitle(title: string): Promise<void> {
    await this.dataTable.search(title);
    const deleteButton = this.jobTitleRow(title)
      .getByRole('button', { name: /delete/i })
      .first();
    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click();
    await this.page.getByRole('button', { name: /yes,?\s*delete/i }).click();

    await this.waitForReady();
    const exists = await this.findJobTitle(title);
    if (exists) {
      throw new Error(`Expected deleted job title to be removed from table: ${title}`);
    }
  }
}
