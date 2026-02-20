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
    await this.page.getByRole('button', { name: 'Add' }).click();
    const firstNameInput = this.page.getByPlaceholder('First Name');
    await firstNameInput.waitFor({ state: 'visible' });

    await firstNameInput.fill(candidate.firstName);
    await this.page.getByPlaceholder('Last Name').fill(candidate.lastName);
    const form = this.page.locator('.oxd-form').first();
    const emailInput = form.locator('input[placeholder="Type here"]').first();
    await emailInput.fill(candidate.email);

    if (candidate.vacancy) {
      const vacancyGroup = this.page.locator('.oxd-input-group').filter({ hasText: 'Vacancy' });
      await vacancyGroup.locator('.oxd-select-text').click();
      await this.page.getByRole('option', { name: new RegExp(candidate.vacancy, 'i') }).click();
    }

    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async searchCandidate(name: string): Promise<void> {
    await this.dataTable.search(name);
    const searchButton = this.page.getByRole('button', { name: /search/i }).first();
    if (await searchButton.isVisible().catch(() => false)) {
      await searchButton.click();
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  async viewCandidateDetails(name: string): Promise<void> {
    await this.searchCandidate(name);
    const viewButton = this.page.locator('.oxd-table-cell-action-view').first();
    if ((await viewButton.count()) > 0) {
      await viewButton.click();
      await this.page.getByRole('button', { name: 'Save' }).waitFor({ state: 'visible' });
      return;
    }

    const firstCardRow = this.page.locator('.oxd-table-card').first();
    if ((await firstCardRow.count()) > 0) {
      await firstCardRow.click();
      await this.page.getByRole('button', { name: 'Save' }).waitFor({ state: 'visible' });
      return;
    }

    await this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell') })
      .first()
      .click();
    await this.page.getByRole('button', { name: 'Save' }).waitFor({ state: 'visible' });
  }

  async changeCandidateStatus(name: string, status: string): Promise<void> {
    const onCandidateProfile = /recruitment\/addCandidate\//.test(this.page.url());
    if (!onCandidateProfile) {
      await this.viewCandidateDetails(name);
    }

    const statusGroup = this.page.locator('.oxd-input-group').filter({ hasText: /status/i });
    await statusGroup.locator('.oxd-select-text').click();
    await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click();

    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
