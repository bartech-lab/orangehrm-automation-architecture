import { BasePage } from '../../base-page.js';
import type { Page } from '@playwright/test';

export class OrganizationPage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/admin/viewOrganizationGeneralInformation');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.page
      .getByRole('heading', { name: /general information|organization/i })
      .or(this.page.locator('.oxd-form'))
      .first()
      .waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.page
      .getByRole('heading', { name: /general information|organization/i })
      .or(this.page.locator('.oxd-form'))
      .first()
      .isVisible()
      .catch(() => false);
  }

  async editOrganizationName(name: string): Promise<void> {
    const editButton = this.page.getByRole('button', { name: /edit/i });
    if (
      await editButton
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      await editButton.first().click();
    }
    await this.page
      .getByRole('textbox', { name: /organization name|name/i })
      .or(this.page.locator('input[name="organization[name]"]'))
      .first()
      .fill(name);
    await this.page.getByRole('button', { name: /save/i }).click();
  }

  async getOrganizationName(): Promise<string> {
    return (
      (await this.page
        .getByRole('textbox', { name: /organization name|name/i })
        .or(this.page.locator('input[name="organization[name]"]'))
        .first()
        .inputValue()) || ''
    );
  }

  async navigateToLocations(): Promise<void> {
    await this.page.goto('/web/index.php/admin/viewLocations');
  }

  async addLocation(location: { name: string; city: string; country: string }): Promise<void> {
    await this.page.getByRole('button', { name: /add/i }).click();
    await this.page
      .getByRole('textbox', { name: /name/i })
      .or(this.page.locator('input[name="location[name]"]'))
      .first()
      .fill(location.name);
    await this.page
      .getByRole('textbox', { name: /city/i })
      .or(this.page.locator('input[name="location[city]"]'))
      .first()
      .fill(location.city);

    const countryField = this.page
      .getByRole('combobox', { name: /country/i })
      .or(this.page.locator('select[name="location[country]"]'));
    await countryField.first().click();
    await this.page
      .getByRole('option', { name: new RegExp(location.country, 'i') })
      .or(this.page.locator(`option[value="${location.country}"]`))
      .or(
        this.page
          .locator('.oxd-select-option')
          .filter({ hasText: new RegExp(location.country, 'i') })
      )
      .first()
      .click();

    await this.page.getByRole('button', { name: /save/i }).click();
  }
}
