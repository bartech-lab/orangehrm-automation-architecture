import { BasePage } from '../base-page.js';
import type { Page } from '@playwright/test';

type EmployeeDetailsUpdate = {
  personal?: { firstName?: string; lastName?: string };
  contact?: { email?: string; phone?: string };
};

export class EmployeeDetailsPage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/pim/viewMyDetails');
  }

  private detailsForm() {
    return this.page.getByRole('form').or(this.page.locator('.oxd-form')).first();
  }

  private firstNameInput() {
    return this.detailsForm().getByPlaceholder('First Name');
  }

  private lastNameInput() {
    return this.detailsForm().getByPlaceholder('Last Name');
  }

  private saveButton() {
    return this.detailsForm().getByRole('button', { name: 'Save' }).first();
  }

  private terminateButton() {
    return this.page
      .getByRole('button', {
        name: /terminate employment|terminate/i,
      })
      .first();
  }

  private async waitForSaveCompletion(): Promise<void> {
    await this.page
      .locator('.oxd-loading-spinner')
      .waitFor({ state: 'hidden', timeout: 10000 })
      .catch(() => {});
    await this.detailsForm().waitFor({ state: 'visible', timeout: 10000 });
  }

  private async waitForSuccessToast(timeout = 10000): Promise<void> {
    const toast = this.page
      .getByRole('alert')
      .filter({ hasText: /success|saved|updated/i })
      .first()
      .or(this.page.locator('.oxd-toast').first());
    await toast.waitFor({ state: 'visible', timeout }).catch(() => {});
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.detailsForm().waitFor({ state: 'visible', timeout: 10000 });
  }

  async isReady(): Promise<boolean> {
    return await this.detailsForm()
      .isVisible()
      .catch(() => false);
  }

  async navigateToTab(tabName: string): Promise<void> {
    await this.page.getByRole('tab', { name: new RegExp(tabName, 'i') }).click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async editPersonalDetails(details: { firstName?: string; lastName?: string }): Promise<void> {
    if (details.firstName) {
      await this.firstNameInput().fill(details.firstName);
    }
    if (details.lastName) {
      await this.lastNameInput().fill(details.lastName);
    }
    await this.saveButton().click();
    await this.waitForSuccessToast();
    await this.waitForSaveCompletion();
  }

  async editContactDetails(contact: { email?: string; phone?: string }): Promise<void> {
    await this.navigateToTab('Contact Details');
    await this.detailsForm().waitFor({ state: 'visible', timeout: 5000 });

    const emailGroup = this.detailsForm()
      .locator('.oxd-input-group')
      .filter({ hasText: /Work Email/i })
      .first();
    const phoneGroup = this.detailsForm()
      .locator('.oxd-input-group')
      .filter({ hasText: /Mobile|Work|Home/i })
      .first();

    if (contact.email) {
      await emailGroup.locator('input').first().fill(contact.email);
    }
    if (contact.phone) {
      await phoneGroup.locator('input').first().fill(contact.phone);
    }
    await this.saveButton().click();
    await this.waitForSuccessToast();
    await this.waitForSaveCompletion();
  }

  async updateDetails(data: EmployeeDetailsUpdate): Promise<void> {
    await this.waitForReady();

    if (data.personal) {
      await this.editPersonalDetails(data.personal);
    }

    if (data.contact) {
      await this.editContactDetails(data.contact);
    }

    if (!data.personal && !data.contact) {
      throw new Error('No details were provided for update.');
    }
  }

  async viewJobInformation(): Promise<void> {
    await this.navigateToTab('Job');
  }

  async hasTerminateButton(): Promise<boolean> {
    return this.terminateButton()
      .isVisible()
      .catch(() => false);
  }

  async terminateEmployment(): Promise<void> {
    await this.viewJobInformation();

    if (!(await this.hasTerminateButton())) {
      throw new Error('Terminate Employment action is not available for this employee.');
    }

    await this.terminateButton().click();
    await this.page
      .getByRole('button', { name: /save|confirm|yes, confirm/i })
      .first()
      .click()
      .catch(() => {});

    await this.waitForSaveCompletion();

    if (await this.hasTerminateButton()) {
      throw new Error('Terminate Employment action did not complete successfully.');
    }
  }
}
