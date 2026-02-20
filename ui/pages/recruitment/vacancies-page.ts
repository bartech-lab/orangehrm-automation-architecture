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
    const form = this.page.locator('.oxd-form');
    await form.waitFor({ state: 'visible' });

    const nameGroup = form.locator('.oxd-input-group').filter({ hasText: 'Vacancy Name' });
    await nameGroup.getByRole('textbox').fill(vacancy.name);

    const jobTitleGroup = form.locator('.oxd-input-group').filter({ hasText: 'Job Title' });
    await jobTitleGroup.locator('.oxd-select-text').click();
    const jobTitleOptions = this.page.locator('.oxd-select-dropdown .oxd-select-option');
    await jobTitleOptions.first().waitFor({ state: 'visible', timeout: 5000 });
    const requestedOption = jobTitleOptions
      .filter({ hasText: new RegExp(`^\\s*${vacancy.jobTitle}\\s*$`, 'i') })
      .first();
    if ((await requestedOption.count()) > 0) {
      await requestedOption.click();
    } else {
      const fallbackOption = jobTitleOptions.nth(1);
      await fallbackOption.click();
    }

    const managerGroup = form.locator('.oxd-input-group').filter({ hasText: 'Hiring Manager' });
    const managerInput = managerGroup.getByPlaceholder(/type for hints/i);
    await managerInput.click();
    await managerInput.fill('a');
    await this.page.waitForTimeout(2000);
    await managerInput.press('ArrowDown').catch(() => {});
    await managerInput.press('Enter').catch(() => {});

    const positionsGroup = form
      .locator('.oxd-input-group')
      .filter({ hasText: 'Number of Positions' });
    await positionsGroup.getByRole('textbox').fill(vacancy.positions.toString());

    const loader = this.page.locator('.oxd-form-loader');
    await loader.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    const saveButton = this.page.getByRole('button', { name: 'Save' }).first();
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await saveButton.click({ timeout: 5000 });
        break;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        const isTransientUiState =
          message.includes('intercepts pointer events') ||
          message.includes('Element is not attached') ||
          message.includes('element was detached');
        if (!isTransientUiState || attempt === 2) {
          throw error;
        }

        await loader.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      }
    }
  }

  async searchVacancy(name: string): Promise<void> {
    const vacancyGroup = this.page.locator('.oxd-input-group').filter({ hasText: 'Vacancy' });
    await vacancyGroup.locator('.oxd-select-text').click();

    const dropdown = this.page.locator('.oxd-select-dropdown').last();
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const exactOption = dropdown.getByRole('option', {
      name: new RegExp(`^\\s*${escapedName}\\s*$`, 'i'),
    });
    if ((await exactOption.count()) > 0) {
      await exactOption.first().click();
    } else {
      const fallbackOption = dropdown
        .getByRole('option')
        .filter({ hasText: new RegExp(escapedName, 'i') })
        .first();
      const hasFallbackOption = (await fallbackOption.count()) > 0;
      if (hasFallbackOption) {
        await fallbackOption.click();
      } else {
        await this.page.keyboard.press('Escape').catch(() => {});
      }
    }

    await this.page.getByRole('button', { name: /^Search$/ }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async toggleVacancyStatus(name: string, active: boolean): Promise<void> {
    await this.searchVacancy(name);

    const targetRow = this.page.locator('.oxd-table-card').filter({ hasText: name }).first();
    const hasTargetRow = await targetRow
      .waitFor({ state: 'visible', timeout: 10000 })
      .then(() => true)
      .catch(() => false);

    if (!hasTargetRow) {
      throw new Error(`Vacancy row not found for name: ${name}`);
    }

    const rowButtons = targetRow.getByRole('button');
    const rowButtonCount = await rowButtons.count();
    if (rowButtonCount === 0) {
      throw new Error(`No action buttons available for vacancy: ${name}`);
    }

    await rowButtons.last().click();

    const checkbox = this.page.getByRole('checkbox');
    await checkbox.waitFor({ state: 'visible' });
    if (active) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
    await this.page.getByRole('button', { name: 'Save' }).click();
  }
}
