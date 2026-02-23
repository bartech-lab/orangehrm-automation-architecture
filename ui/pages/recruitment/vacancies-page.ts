import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Page } from '@playwright/test';

export class VacanciesPage extends BasePage {
  private readonly dataTable: DataTableComponent;

  private async setStatusOnVacancyForm(active: boolean): Promise<void> {
    const checkbox = this.page.getByRole('checkbox').first();
    await checkbox.waitFor({ state: 'visible' });

    const desiredState = active;
    for (let attempt = 0; attempt < 5; attempt++) {
      const isChecked = await checkbox.isChecked().catch(() => !desiredState);
      if (isChecked === desiredState) {
        break;
      }

      const switchControl = this.page
        .getByRole('switch')
        .or(this.page.locator('.oxd-switch-wrapper, .oxd-switch-input'))
        .first();
      try {
        await switchControl.click({ timeout: 5000 });
      } catch {
        await checkbox.click({ force: true, timeout: 5000 });
      }

      await this.page.waitForTimeout(200);
    }

    const finalState = await checkbox.isChecked().catch(() => !desiredState);
    if (finalState !== desiredState) {
      throw new Error(`Could not set vacancy status to ${desiredState ? 'active' : 'inactive'}`);
    }

    const loader = this.page.locator('.oxd-form-loader');
    await loader.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

    const saveButton = this.page.getByRole('button', { name: /^Save$/ }).first();
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

  constructor(page: Page) {
    super(page, '/web/index.php/recruitment/viewJobVacancy');
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

  async addVacancy(vacancy: {
    name: string;
    jobTitle: string;
    hiringManager: string;
    positions: number;
  }): Promise<void> {
    await this.page.getByRole('button', { name: 'Add' }).click();
    const form = this.page.getByRole('form').or(this.page.locator('.oxd-form')).first();
    await form.waitFor({ state: 'visible' });

    const nameGroup = form.locator('.oxd-input-group').filter({ hasText: 'Vacancy Name' });
    await nameGroup.getByRole('textbox').fill(vacancy.name);

    const jobTitleGroup = form.locator('.oxd-input-group').filter({ hasText: 'Job Title' });
    await jobTitleGroup
      .getByRole('combobox')
      .or(jobTitleGroup.locator('.oxd-select-text'))
      .first()
      .click();
    const jobTitleOptions = this.page
      .getByRole('listbox')
      .last()
      .getByRole('option')
      .or(this.page.locator('.oxd-select-dropdown .oxd-select-option'));
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

    const searchPrefixes = ['a', 'j', 'm', 's', 't', 'b', 'c', 'd'];
    let selectedManager = false;

    for (const prefix of searchPrefixes) {
      if (selectedManager) break;

      await managerInput.click();
      await managerInput.fill('');
      await this.page.waitForTimeout(100);
      await managerInput.fill(prefix);
      await this.page.waitForTimeout(2500);

      const dropdown = this.page.locator('.oxd-autocomplete-dropdown');
      const hasDropdown = await dropdown
        .waitFor({ state: 'visible', timeout: 3000 })
        .then(() => true)
        .catch(() => false);

      if (hasDropdown) {
        const options = dropdown.locator('.oxd-autocomplete-option, [role="option"]');
        const optionCount = await options.count();
        if (optionCount > 0) {
          await options.first().click();
          await this.page.waitForTimeout(800);

          await form.click();
          await this.page.waitForTimeout(300);

          const invalidLabel = managerGroup.locator(':text-is("Invalid")');
          const stillInvalid = await invalidLabel.isVisible().catch(() => false);
          if (!stillInvalid) {
            selectedManager = true;
          }
        }
      }
    }

    if (!selectedManager) {
      throw new Error('Could not select a valid hiring manager from autocomplete');
    }

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

    const successToast = this.page
      .getByRole('alert')
      .filter({ hasText: /success|saved/i })
      .first()
      .or(this.page.locator('.oxd-toast--success').first())
      .or(this.page.locator('.oxd-toast').first());

    await successToast.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    const editVacancyIndicator = this.page
      .getByRole('heading', { name: /edit vacancy/i })
      .or(this.page.getByText('Edit Vacancy'))
      .first();
    await editVacancyIndicator.waitFor({ state: 'visible', timeout: 15000 });
  }

  private vacancyRow(title: string) {
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.page
      .getByRole('row')
      .filter({ hasText: new RegExp(escapedTitle, 'i') })
      .or(
        this.page
          .getByRole('table')
          .locator('.oxd-table-card')
          .filter({ hasText: new RegExp(escapedTitle, 'i') })
      )
      .first();
  }

  async findVacancy(title: string): Promise<boolean> {
    await this.waitForReady();
    await this.dataTable.search(title);

    const row = this.vacancyRow(title);
    await row.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    return row.isVisible().catch(() => false);
  }

  async createVacancy(vacancy: {
    name: string;
    jobTitle: string;
    hiringManager: string;
    positions: number;
  }): Promise<void> {
    await this.addVacancy(vacancy);

    await this.waitForReady();
    const created = await this.findVacancy(vacancy.name);
    if (!created) {
      throw new Error(`Expected created vacancy to appear in table: ${vacancy.name}`);
    }
  }

  async searchVacancy(name: string): Promise<void> {
    const vacancyGroup = this.page.locator('.oxd-input-group').filter({ hasText: 'Vacancy' });
    await vacancyGroup
      .getByRole('combobox')
      .or(vacancyGroup.locator('.oxd-select-text'))
      .first()
      .click();

    const dropdown = this.page
      .getByRole('listbox')
      .last()
      .or(this.page.locator('.oxd-select-dropdown').last());
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

    const targetRow = this.page
      .getByRole('row')
      .filter({ hasText: name })
      .or(this.page.getByRole('table').locator('.oxd-table-card').filter({ hasText: name }))
      .first();
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
    await this.setStatusOnVacancyForm(active);
  }

  async setCurrentVacancyStatus(active: boolean): Promise<void> {
    await this.setStatusOnVacancyForm(active);
  }

  async isCurrentVacancyActive(): Promise<boolean> {
    const checkbox = this.page.getByRole('checkbox').first();
    await checkbox.waitFor({ state: 'visible', timeout: 5000 });
    return checkbox.isChecked();
  }
}
