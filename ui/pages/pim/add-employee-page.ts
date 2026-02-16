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
    await this.page.waitForSelector('.oxd-form');
  }

  async isReady(): Promise<boolean> {
    return await this.page.isVisible('.oxd-form');
  }

  async fillEmployeeDetails(employee: {
    firstName: string;
    middleName?: string;
    lastName: string;
    employeeId?: string;
  }): Promise<void> {
    await this.page.fill('input[name="firstName"]', employee.firstName);
    if (employee.middleName) {
      await this.page.fill('input[name="middleName"]', employee.middleName);
    }
    await this.page.fill('input[name="lastName"]', employee.lastName);
    if (employee.employeeId) {
      await this.page.fill('input[name="employeeId"]', employee.employeeId);
    }
  }

  async uploadPhoto(filePath: string): Promise<void> {
    await this.page.setInputFiles('input[type="file"]', filePath);
  }

  async save(): Promise<void> {
    await this.page.click('.oxd-button:has-text("Save")');
  }

  async cancel(): Promise<void> {
    await this.page.click('.oxd-button:has-text("Cancel")');
  }
}
