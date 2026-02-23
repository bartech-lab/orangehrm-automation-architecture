import { BasePage } from '../base-page.js';
import type { Page } from '@playwright/test';

type EmployeeData = {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeId?: string;
};

export class AddEmployeePage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/pim/addEmployee');
  }

  private firstNameInput() {
    return this.page.getByPlaceholder('First Name');
  }

  private middleNameInput() {
    return this.page.getByPlaceholder('Middle Name');
  }

  private lastNameInput() {
    return this.page.getByPlaceholder('Last Name');
  }

  private employeeIdInput() {
    return this.page
      .getByLabel(/employee id/i)
      .or(
        this.page.locator('.oxd-input-group').filter({ hasText: 'Employee Id' }).locator('input')
      );
  }

  private saveButton() {
    return this.page.getByRole('button', { name: 'Save' });
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.firstNameInput().waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return await this.firstNameInput()
      .isVisible()
      .catch(() => false);
  }

  async fillEmployeeDetails(employee: EmployeeData): Promise<void> {
    await this.firstNameInput().fill(employee.firstName);
    if (employee.middleName) {
      await this.middleNameInput().fill(employee.middleName);
    }
    await this.lastNameInput().fill(employee.lastName);
    if (employee.employeeId) {
      const employeeIdInput = this.employeeIdInput();
      await employeeIdInput.clear();
      await employeeIdInput.fill(employee.employeeId);
    }
  }

  async uploadPhoto(filePath: string): Promise<void> {
    await this.page.locator('input[type="file"]').setInputFiles(filePath);
  }

  async save(): Promise<void> {
    await this.saveButton().click();
  }

  async attemptSave(): Promise<{ success: boolean; hasValidationErrors: boolean }> {
    await this.saveButton().click();

    try {
      await this.page.waitForURL(/\/web\/index\.php\/pim\/viewPersonalDetails\//, {
        timeout: 5000,
      });
      return { success: true, hasValidationErrors: false };
    } catch {
      const hasErrors = await this.page
        .getByRole('alert')
        .filter({ hasText: /required|invalid/i })
        .or(this.page.locator('.oxd-input-field-error-message'))
        .first()
        .isVisible()
        .catch(() => false);
      return { success: false, hasValidationErrors: hasErrors };
    }
  }

  async saveEmployee(employee: EmployeeData): Promise<void> {
    await this.waitForReady();
    await this.fillEmployeeDetails(employee);
    await this.saveButton().click();
    await this.page.waitForURL(/\/web\/index\.php\/pim\/viewPersonalDetails\//, {
      timeout: 10000,
    });
  }

  async cancel(): Promise<void> {
    await this.page.getByRole('button', { name: 'Cancel' }).click();
  }
}
