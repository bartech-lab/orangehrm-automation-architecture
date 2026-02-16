import { test, expect } from '../../../infra/test-runner/index.js';
import { FormComponent } from '../../../ui/components/index.js';

test.describe('FormComponent Tests', () => {
  test.describe('Form Validation', () => {
    test('should display validation errors for required fields', async ({ auth }) => {
      await auth.goto('/web/index.php/pim/addEmployee');

      const form = new FormComponent(auth, 'form.oxd-form');
      await form.waitForReady();

      await form.submit();

      const errors = await form.getValidationErrors();
      expect(errors.length).toBeGreaterThan(0);

      const firstNameValid = await form.isFieldValid('firstName');
      expect(firstNameValid).toBe(false);

      const lastNameValid = await form.isFieldValid('lastName');
      expect(lastNameValid).toBe(false);
    });

    test('should detect required field errors on blur', async ({ auth }) => {
      await auth.goto('/web/index.php/pim/addEmployee');

      const form = new FormComponent(auth, 'form.oxd-form');
      await form.waitForReady();

      await form.fillField('firstName', '');

      const errors = await form.getValidationErrors();
      expect(errors).toContain(expect.stringContaining('Required'));
    });
  });

  test.describe('Form Field Types', () => {
    test('should fill text input fields', async ({ auth, testData }) => {
      await auth.goto('/web/index.php/pim/addEmployee');

      const form = new FormComponent(auth, 'form.oxd-form');
      await form.waitForReady();

      const employee = testData.createEmployee();

      await form.fillField('firstName', employee.firstName);
      await form.fillField('lastName', employee.lastName);
      await form.fillField('employeeId', employee.employeeId);

      const firstNameValid = await form.isFieldValid('firstName');
      const lastNameValid = await form.isFieldValid('lastName');

      expect(firstNameValid).toBe(true);
      expect(lastNameValid).toBe(true);
    });

    test('should handle select dropdown fields', async ({ auth }) => {
      await auth.goto('/web/index.php/pim/addEmployee');

      const form = new FormComponent(auth, 'form.oxd-form');
      await form.waitForReady();

      await form.selectOption('location', '1');

      const locationValid = await form.isFieldValid('location');
      expect(locationValid).toBe(true);
    });

    test('should clear field values', async ({ auth }) => {
      await auth.goto('/web/index.php/pim/addEmployee');

      const form = new FormComponent(auth, 'form.oxd-form');
      await form.waitForReady();

      await form.fillField('firstName', 'TestValue');
      await form.clearField('firstName');

      const errors = await form.getValidationErrors();
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  test.describe('Form Submission', () => {
    test('should submit valid form successfully', async ({ auth, testData }) => {
      await auth.goto('/web/index.php/pim/addEmployee');

      const form = new FormComponent(auth, 'form.oxd-form');
      await form.waitForReady();

      const employee = testData.createEmployee();

      await form.fillField('firstName', employee.firstName);
      await form.fillField('lastName', employee.lastName);

      await form.submit();

      await expect(auth).toHaveURL(/viewPersonalDetails|addEmployee/);

      const toastVisible = await auth
        .locator('.oxd-toast--success')
        .isVisible()
        .catch(() => false);
      const onDetailsPage = auth.url().includes('viewPersonalDetails');

      expect(toastVisible || onDetailsPage).toBe(true);
    });

    test('should prevent submission with validation errors', async ({ auth }) => {
      await auth.goto('/web/index.php/pim/addEmployee');

      const form = new FormComponent(auth, 'form.oxd-form');
      await form.waitForReady();

      await form.submit();

      await expect(auth).toHaveURL(/addEmployee/);

      const errors = await form.getValidationErrors();
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  test.describe('Error Message Detection', () => {
    test('should detect and retrieve field-specific errors', async ({ auth }) => {
      await auth.goto('/web/index.php/pim/addEmployee');

      const form = new FormComponent(auth, 'form.oxd-form');
      await form.waitForReady();

      await form.submit();

      const errors = await form.getValidationErrors();

      expect(Array.isArray(errors)).toBe(true);
      expect(errors.length).toBeGreaterThan(0);

      const hasRequiredError = errors.some((error: string) =>
        error.toLowerCase().includes('required')
      );
      expect(hasRequiredError).toBe(true);
    });

    test('should track field validity state correctly', async ({ auth }) => {
      await auth.goto('/web/index.php/pim/addEmployee');

      const form = new FormComponent(auth, 'form.oxd-form');
      await form.waitForReady();

      await form.submit();
      let firstNameValid = await form.isFieldValid('firstName');
      expect(firstNameValid).toBe(false);

      await form.fillField('firstName', 'John');

      firstNameValid = await form.isFieldValid('firstName');
      expect(firstNameValid).toBe(true);
    });
  });

  test.describe('Form Visibility', () => {
    test('should check form visibility', async ({ auth }) => {
      await auth.goto('/web/index.php/pim/addEmployee');

      const form = new FormComponent(auth, 'form.oxd-form');

      const isVisible = await form.isVisible();
      expect(isVisible).toBe(true);
    });

    test('should wait for form to be ready', async ({ auth }) => {
      await auth.goto('/web/index.php/pim/addEmployee');

      const form = new FormComponent(auth, 'form.oxd-form');

      await expect(form.waitForReady()).resolves.not.toThrow();
    });
  });
});
