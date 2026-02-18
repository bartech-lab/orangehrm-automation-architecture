import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Page } from '@playwright/test';

export class VacanciesPage extends BasePage {
  readonly dataTable: DataTableComponent;

  constructor(page: Page) {
    super(page, '/web/index.php/recruitment/viewJobVacancy');
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

  async addVacancy(vacancy: {
    name: string;
    jobTitle: string;
    hiringManager: string;
    positions: number;
  }): Promise<void> {
    await this.page.getByRole('button', { name: 'Add' }).click();
    await this.page.waitForLoadState('networkidle');

    const form = this.page.locator('.oxd-form');

    const nameGroup = form.locator('.oxd-input-group').filter({ hasText: 'Vacancy Name' });
    await nameGroup.getByRole('textbox').fill(vacancy.name);

    const jobTitleGroup = form.locator('.oxd-input-group').filter({ hasText: 'Job Title' });
    await jobTitleGroup.locator('.oxd-select-text').click();
    await this.page.getByRole('option', { name: new RegExp(vacancy.jobTitle, 'i') }).click();

    const managerGroup = form.locator('.oxd-input-group').filter({ hasText: 'Hiring Manager' });
    await managerGroup.getByPlaceholder(/type for hints/i).fill(vacancy.hiringManager);
    await this.page.waitForTimeout(500);
    await this.page.getByRole('option').first().click();

    const positionsGroup = form
      .locator('.oxd-input-group')
      .filter({ hasText: 'Number of Positions' });
    await positionsGroup.getByRole('textbox').fill(vacancy.positions.toString());

    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async searchVacancy(name: string): Promise<void> {
    await this.dataTable.search(name);
  }

  async toggleVacancyStatus(name: string, active: boolean): Promise<void> {
    await this.searchVacancy(name);
    await this.page.locator('.oxd-table-cell-action-edit').first().click();
    await this.page.waitForLoadState('networkidle');

    const checkbox = this.page.getByRole('checkbox');
    if (active) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
