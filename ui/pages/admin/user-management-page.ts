import { BasePage } from '../base-page.js';
import { DataTableComponent } from '../../components/index.js';
import type { Page } from '@playwright/test';

export class UserManagementPage extends BasePage {
  readonly dataTable: DataTableComponent;

  constructor(page: Page) {
    super(page, '/web/index.php/admin/viewSystemUsers');
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

  async searchUser(username: string): Promise<void> {
    await this.dataTable.search(username);
  }

  async addUser(user: { username: string; password: string; role: string }): Promise<void> {
    await this.page.click('.oxd-button:has-text("Add")');
    await this.page.fill('input[name="username"]', user.username);
    await this.page.fill('input[name="password"]', user.password);
    await this.page.click('.oxd-button:has-text("Save")');
  }

  async deleteUser(username: string): Promise<void> {
    await this.searchUser(username);
    await this.page.click('.oxd-table-cell-action-delete');
    await this.page.click('.oxd-button:has-text("Yes, Delete")');
  }

  async editUser(username: string, changes: Partial<{ role: string }>): Promise<void> {
    await this.searchUser(username);
    await this.page.click('.oxd-table-cell-action-edit');
    if (changes.role) {
      await this.page.selectOption('select[name="userRole"]', changes.role);
    }
    await this.page.click('.oxd-button:has-text("Save")');
  }
}
