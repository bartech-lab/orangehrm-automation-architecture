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
    await this.generalInfoContainer().waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.generalInfoContainer()
      .isVisible()
      .catch(() => false);
  }

  private generalInfoContainer() {
    return this.page
      .getByRole('heading', { name: /general information|organization/i })
      .or(this.page.locator('.oxd-form'))
      .first();
  }

  private organizationNameField() {
    return this.page
      .getByRole('textbox', { name: /organization name|name/i })
      .or(this.page.locator('input[name="organization[name]"]'))
      .first();
  }

  private async ensureGeneralInfoEditable(): Promise<void> {
    const organizationName = this.organizationNameField();
    const isDisabled = await organizationName.isDisabled().catch(() => true);
    if (!isDisabled) {
      return;
    }

    const editButton = this.page.getByRole('button', { name: /edit/i }).first();
    await editButton.waitFor({ state: 'visible' });
    await editButton.click();
    await organizationName.waitFor({ state: 'visible' });
  }

  async updateOrganizationProfile(profile: { name: string }): Promise<void> {
    await this.waitForReady();
    await this.ensureGeneralInfoEditable();
    await this.organizationNameField().fill(profile.name);
    await this.page.getByRole('button', { name: /save/i }).click();

    await this.waitForReady();
    const savedName = await this.getOrganizationName();
    if (savedName.trim() !== profile.name.trim()) {
      throw new Error(`Expected organization name to be saved as: ${profile.name}`);
    }
  }

  async editOrganizationName(name: string): Promise<void> {
    await this.updateOrganizationProfile({ name });
  }

  async getOrganizationName(): Promise<string> {
    await this.waitForReady();
    return (await this.organizationNameField().inputValue()) || '';
  }

  async openLocationsDirectory(): Promise<void> {
    await this.page.goto('/web/index.php/admin/viewLocations');
    await this.page
      .getByRole('heading', { name: /locations/i })
      .or(this.page.getByRole('table'))
      .or(this.page.locator('.oxd-table'))
      .first()
      .waitFor({ state: 'visible' });
  }

  async navigateToLocations(): Promise<void> {
    await this.openLocationsDirectory();
  }

  private locationRow(name: string) {
    return this.page
      .getByRole('row')
      .filter({ hasText: new RegExp(name, 'i') })
      .or(this.page.locator('.oxd-table-card').filter({ hasText: new RegExp(name, 'i') }))
      .first();
  }

  async findLocation(name: string): Promise<boolean> {
    await this.openLocationsDirectory();
    await this.page
      .getByRole('textbox', { name: /search/i })
      .or(this.page.getByPlaceholder(/search/i))
      .first()
      .fill(name)
      .catch(() => undefined);
    await this.page
      .getByRole('button', { name: /search/i })
      .click()
      .catch(() => undefined);

    const row = this.locationRow(name);
    await row.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);
    return row.isVisible().catch(() => false);
  }

  async createLocation(location: { name: string; city: string; country: string }): Promise<void> {
    await this.openLocationsDirectory();
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

    const created = await this.findLocation(location.name);
    if (!created) {
      throw new Error(`Expected created location to appear in list: ${location.name}`);
    }
  }

  async addLocation(location: { name: string; city: string; country: string }): Promise<void> {
    await this.createLocation(location);
  }
}
