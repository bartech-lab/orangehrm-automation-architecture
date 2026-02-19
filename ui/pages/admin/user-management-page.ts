import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Page } from '@playwright/test';

export class UserManagementPage extends BasePage {
  readonly dataTable: DataTableComponent;

  constructor(page: Page) {
    super(page, '/web/index.php/admin/viewSystemUsers');
    this.dataTable = new DataTableComponent(
      page,
      page.getByRole('table').or(page.locator('.oxd-table'))
    );
  }

  private async selectCustomOption(fieldLabel: RegExp, option: string): Promise<void> {
    const dropdown = this.page.getByRole('combobox', { name: fieldLabel });
    await dropdown.first().click();
    await this.page
      .getByRole('option', { name: new RegExp(option, 'i') })
      .or(
        this.page
          .locator('.oxd-select-option, .oxd-dropdown-option')
          .filter({ hasText: new RegExp(option, 'i') })
      )
      .first()
      .click();
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

  async searchUser(username: string): Promise<void> {
    await this.dataTable.search(username);
  }

  async addUser(user: {
    username: string;
    password: string;
    role: string;
    employeeName?: string;
    status?: string;
  }): Promise<void> {
    await this.page.getByRole('button', { name: /add/i }).click();
    await this.selectCustomOption(/user role/i, user.role);

    const employeeInput = this.page
      .getByPlaceholder(/type for hints/i)
      .or(this.page.getByRole('textbox', { name: /employee name/i }));
    await employeeInput.first().fill(user.employeeName ?? 'Admin');
    await this.page
      .getByRole('option', { name: new RegExp(user.employeeName ?? 'Admin', 'i') })
      .or(this.page.locator('.oxd-autocomplete-option').first())
      .first()
      .click();

    await this.selectCustomOption(/status/i, user.status ?? 'Enabled');

    await this.page.getByRole('textbox', { name: /username/i }).fill(user.username);
    await this.page.getByLabel(/^password$/i).fill(user.password);
    await this.page.getByLabel(/confirm password/i).fill(user.password);
    await this.page.getByRole('button', { name: /save/i }).click();
  }

  async deleteUser(username: string): Promise<void> {
    await this.searchUser(username);
    const userRow = this.page
      .getByRole('row')
      .filter({ hasText: new RegExp(username, 'i') })
      .or(this.page.locator('.oxd-table-card').filter({ hasText: new RegExp(username, 'i') }))
      .first();
    await userRow.scrollIntoViewIfNeeded();

    const deleteButton = userRow.getByRole('button', { name: /delete/i }).first();
    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click();
    await this.page
      .getByRole('button', { name: /yes,?\s*delete/i })
      .or(this.page.locator('.oxd-dialog-container .oxd-button--label-danger'))
      .click();
  }

  async editUser(username: string, changes: Partial<{ role: string }>): Promise<void> {
    await this.searchUser(username);
    const userRow = this.page
      .getByRole('row')
      .filter({ hasText: new RegExp(username, 'i') })
      .or(this.page.locator('.oxd-table-card').filter({ hasText: new RegExp(username, 'i') }))
      .first();
    await userRow.scrollIntoViewIfNeeded();

    const editButton = userRow.getByRole('button', { name: /edit/i }).first();
    await editButton.scrollIntoViewIfNeeded();
    await editButton.click();
    if (changes.role) {
      await this.selectCustomOption(/user role/i, changes.role);
    }
    await this.page.getByRole('button', { name: /save/i }).click();
  }
}
