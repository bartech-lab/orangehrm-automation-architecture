import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Page } from '@playwright/test';

export class CandidatesPage extends BasePage {
  readonly dataTable: DataTableComponent;

  constructor(page: Page) {
    super(page, '/web/index.php/recruitment/viewCandidates');
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

  async addCandidate(candidate: {
    firstName: string;
    lastName: string;
    email: string;
    vacancy?: string;
  }): Promise<void> {
    await this.page.click('.oxd-button:has-text("Add")');
    await this.page.fill('input[name="firstName"]', candidate.firstName);
    await this.page.fill('input[name="lastName"]', candidate.lastName);
    await this.page.fill('input[name="email"]', candidate.email);
    if (candidate.vacancy) {
      await this.page.selectOption('select[name="vacancy"]', candidate.vacancy);
    }
    await this.page.click('.oxd-button:has-text("Save")');
  }

  async searchCandidate(name: string): Promise<void> {
    await this.dataTable.search(name);
  }

  async viewCandidateDetails(name: string): Promise<void> {
    await this.searchCandidate(name);
    await this.page.click('.oxd-table-cell-action-view');
  }

  async changeCandidateStatus(name: string, status: string): Promise<void> {
    await this.viewCandidateDetails(name);
    await this.page.selectOption('select[name="status"]', status);
    await this.page.click('.oxd-button:has-text("Save")');
  }
}
