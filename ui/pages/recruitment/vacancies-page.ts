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
    await this.page.click('.oxd-button:has-text("Add")');
    await this.page.fill('input[name="vacancy[name]"]', vacancy.name);
    await this.page.selectOption('select[name="vacancy[jobTitle]"]', vacancy.jobTitle);
    await this.page.fill('input[name="vacancy[hiringManager]"]', vacancy.hiringManager);
    await this.page.fill('input[name="vacancy[numOfPositions]"]', vacancy.positions.toString());
    await this.page.click('.oxd-button:has-text("Save")');
  }

  async searchVacancy(name: string): Promise<void> {
    await this.dataTable.search(name);
  }

  async toggleVacancyStatus(name: string, active: boolean): Promise<void> {
    await this.searchVacancy(name);
    await this.page.click('.oxd-table-cell-action-edit');
    if (active) {
      await this.page.check('input[name="vacancy[status]"]');
    } else {
      await this.page.uncheck('input[name="vacancy[status]"]');
    }
    await this.page.click('.oxd-button:has-text("Save")');
  }
}
