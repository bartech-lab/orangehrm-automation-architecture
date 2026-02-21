import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Page } from '@playwright/test';

export class CandidatesPage extends BasePage {
  private readonly dataTable: DataTableComponent;

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

    await Promise.race([
      this.page.locator('.oxd-toast--success').waitFor({ state: 'visible', timeout: 10000 }),
      this.page.locator('.oxd-toast').waitFor({ state: 'visible', timeout: 10000 }),
      this.page
        .getByRole('heading', { name: /application stage/i })
        .waitFor({ state: 'visible', timeout: 10000 }),
    ]).catch(() => {});
  }

  private candidateRow(name: string) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page
      .getByRole('row')
      .filter({ hasText: new RegExp(escapedName, 'i') })
      .or(this.page.locator('.oxd-table-card').filter({ hasText: new RegExp(escapedName, 'i') }))
      .first();
  }

  async findCandidate(name: string): Promise<boolean> {
    await this.waitForReady();
    await this.dataTable.search(name);

    const row = this.candidateRow(name);
    await row.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    return row.isVisible().catch(() => false);
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
      await this.page
        .getByRole('heading', { name: /candidate profile/i })
        .or(this.page.getByRole('button', { name: /save|shortlist|reject/i }))
        .first()
        .waitFor({ state: 'visible' });
      return;
    }

    const firstCardRow = this.page.locator('.oxd-table-card').first();
    if ((await firstCardRow.count()) > 0) {
      await firstCardRow.click();
      await this.page
        .getByRole('heading', { name: /candidate profile/i })
        .or(this.page.getByRole('button', { name: /save|shortlist|reject/i }))
        .first()
        .waitFor({ state: 'visible' });
      return;
    }

    await this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell') })
      .first()
      .click();
    await this.page
      .getByRole('heading', { name: /candidate profile/i })
      .or(this.page.getByRole('button', { name: /save|shortlist|reject/i }))
      .first()
      .waitFor({ state: 'visible' });
  }

  async changeCandidateStatus(name: string, status: string): Promise<void> {
    const onCandidateProfile = /recruitment\/addCandidate\//.test(this.page.url());
    if (!onCandidateProfile) {
      await this.viewCandidateDetails(name);
    }

    const shortlistButton = this.page.getByRole('button', { name: /shortlist/i }).first();
    const shouldShortlist = /shortlist/i.test(status);
    const canShortlist = await shortlistButton
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (shouldShortlist && canShortlist) {
      await shortlistButton.click();

      await this.page
        .getByRole('heading', { name: /shortlist candidate/i })
        .first()
        .waitFor({ state: 'visible', timeout: 5000 })
        .catch(() => {});

      await this.page
        .locator('.oxd-form textarea')
        .first()
        .fill('Status updated to shortlisted')
        .catch(() => {});

      const saveButton = this.page.getByRole('button', { name: /^Save$/ }).first();
      for (let attempt = 0; attempt < 3; attempt++) {
        const saveVisible = await saveButton
          .waitFor({ state: 'visible', timeout: 5000 })
          .then(() => true)
          .catch(() => false);
        if (!saveVisible) {
          break;
        }

        try {
          await saveButton.click({ timeout: 5000 });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const isTransientUiState =
            message.includes('intercepts pointer events') ||
            message.includes('Element is not attached') ||
            message.includes('element was detached');
          if (!isTransientUiState || attempt === 2) {
            throw error;
          }

          await this.page.waitForTimeout(300);
          continue;
        }

        const workflowAdvanced = await Promise.race([
          this.page
            .getByRole('heading', { name: /shortlist candidate/i })
            .first()
            .waitFor({ state: 'hidden', timeout: 4000 })
            .then(() => true)
            .catch(() => false),
          this.page
            .locator('.oxd-toast')
            .first()
            .waitFor({ state: 'visible', timeout: 4000 })
            .then(() => true)
            .catch(() => false),
        ]);
        if (workflowAdvanced) {
          break;
        }
      }
      return;
    }

    const statusGroup = this.page.locator('.oxd-input-group').filter({ hasText: /status/i });
    await statusGroup.locator('.oxd-select-text').click();
    await this.page.getByRole('option', { name: new RegExp(status, 'i') }).click();

    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
