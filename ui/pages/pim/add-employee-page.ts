import { BasePage } from '../base-page.js';
import type { Page } from '@playwright/test';

export class AddEmployeePage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/pim/addEmployee');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.page.getByPlaceholder('First Name').waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return await this.page
      .getByPlaceholder('First Name')
      .isVisible()
      .catch(() => false);
  }

  async fillEmployeeDetails(employee: {
    firstName: string;
    middleName?: string;
    lastName: string;
    employeeId?: string;
  }): Promise<void> {
    await this.page.getByPlaceholder('First Name').fill(employee.firstName);
    if (employee.middleName) {
      await this.page.getByPlaceholder('Middle Name').fill(employee.middleName);
    }
    await this.page.getByPlaceholder('Last Name').fill(employee.lastName);
    if (employee.employeeId) {
      const empIdGroup = this.page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' });
      const empIdInput = empIdGroup.locator('input');
      await empIdInput.clear();
      await empIdInput.fill(employee.employeeId);
    }
  }

  async uploadPhoto(filePath: string): Promise<void> {
    await this.page.locator('input[type="file"]').setInputFiles(filePath);
  }

  async save(): Promise<void> {
    await this.page.getByRole('button', { name: 'Save' }).click();
  }

  async cancel(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }
}
