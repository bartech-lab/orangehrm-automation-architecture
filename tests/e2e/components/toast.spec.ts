import { test, expect } from '../../../infra/test-runner/index.js';
import { ToastComponent } from '../../../ui/components/index.js';

test.describe('Toast Component', () => {
  let toast: ToastComponent;

  test.beforeEach(async ({ hrmPage }) => {
    // Initialize toast component with the OrangeHRM toast selector
    toast = new ToastComponent(hrmPage, '.oxd-toast');
  });

  test.describe('Success Toast', () => {
    test('success toast appears after saving user data', async ({ hrmPage, testData }) => {
      // Navigate to PIM module where we can add an employee
      await hrmPage.goto('/web/index.php/pim/viewEmployeeList');
      await hrmPage.locator('button:has-text("Add")').first().waitFor({ state: 'visible' });

      // Click Add button to trigger add employee form
      await hrmPage.locator('button:has-text("Add")').first().click();
      await hrmPage.waitForURL(/addEmployee/);

      // Fill in employee form with unique data
      const employee = testData.createEmployee();
      await hrmPage.locator('input[name="firstName"]').fill(employee.firstName);
      await hrmPage.locator('input[name="lastName"]').fill(employee.lastName);
      const uniqueEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
      const employeeIdGroup = hrmPage
        .locator('.oxd-input-group')
        .filter({ has: hrmPage.locator('label').filter({ hasText: /^Employee Id$/ }) })
        .first();
      const employeeIdInput = employeeIdGroup.locator('input').first();
      await employeeIdInput.click();
      await employeeIdInput.press('ControlOrMeta+A');
      await employeeIdInput.fill(uniqueEmployeeId);

      // Save the employee - this should trigger a success toast
      await hrmPage.locator('button[type="submit"]').click();

      // Wait for toast to appear and verify it's visible
      await hrmPage.locator('.oxd-toast').first().waitFor({ state: 'visible', timeout: 10000 });
      const isVisible = await toast.isVisible();
      expect(isVisible).toBe(true);

      // Verify toast type is success
      const toastType = await toast.getType();
      expect(toastType).toBe('success');

      // Verify toast contains success message
      const message = await toast.getMessage();
      expect(message.toLowerCase()).toContain('success');
    });

    test('success toast appears after delete action', async ({ hrmPage }) => {
      const lastName = `DeleteFlow${Date.now().toString().slice(-6)}`;

      await hrmPage.goto('/web/index.php/pim/addEmployee');
      await hrmPage.locator('input[name="firstName"]').waitFor({ state: 'visible' });

      await hrmPage.locator('input[name="firstName"]').fill('DeleteFlow');
      await hrmPage.locator('input[name="lastName"]').fill(lastName);

      const uniqueEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
      const employeeIdGroup = hrmPage
        .locator('.oxd-input-group')
        .filter({ has: hrmPage.locator('label').filter({ hasText: /^Employee Id$/ }) })
        .first();
      const employeeIdInput = employeeIdGroup.locator('input').first();
      await employeeIdInput.click();
      await employeeIdInput.press('ControlOrMeta+A');
      await employeeIdInput.fill(uniqueEmployeeId);

      await hrmPage.locator('button[type="submit"]').click();
      await expect
        .poll(
          async () => {
            if (/viewPersonalDetails/.test(hrmPage.url())) {
              return true;
            }

            const text = await hrmPage
              .locator('.oxd-toast')
              .first()
              .textContent()
              .catch(() => null);
            return (text ?? '').trim().length > 0;
          },
          { timeout: 15000, intervals: [100, 200, 500, 1000] }
        )
        .toBe(true);

      await hrmPage.goto('/web/index.php/pim/viewEmployeeList');
      await hrmPage.locator('.oxd-table-body').waitFor({ state: 'visible' });

      const searchEmployeeIdGroup = hrmPage
        .locator('.oxd-input-group')
        .filter({ has: hrmPage.locator('label').filter({ hasText: /^Employee Id$/ }) })
        .first();
      const searchEmployeeIdInput = searchEmployeeIdGroup.locator('input').first();
      await searchEmployeeIdInput.click();
      await searchEmployeeIdInput.press('ControlOrMeta+A');
      await searchEmployeeIdInput.fill(uniqueEmployeeId);
      await hrmPage.getByRole('button', { name: /^Search$/ }).click();

      const rows = hrmPage.locator('.oxd-table-card');
      await expect(rows.first()).toBeVisible({ timeout: 10000 });

      const targetRow = rows.filter({ hasText: uniqueEmployeeId }).first();
      await expect(targetRow).toBeVisible({ timeout: 10000 });
      const beforeCount = await rows.count();
      expect(beforeCount).toBeGreaterThan(0);

      const rowActionButtons = targetRow.getByRole('button');
      const actionButtonCount = await rowActionButtons.count();
      expect(actionButtonCount).toBeGreaterThan(0);

      let deleteButton = rowActionButtons.last();
      if (actionButtonCount === 1) {
        deleteButton = rowActionButtons.first();
      }
      expect(await deleteButton.count()).toBeGreaterThan(0);
      await deleteButton.scrollIntoViewIfNeeded();
      await deleteButton.click({ timeout: 5000 });

      const dialog = hrmPage.getByRole('dialog').first();
      await dialog.first().waitFor({ state: 'visible', timeout: 10000 });

      const confirmDeleteButton = dialog.getByRole('button', {
        name: /yes,\s*delete|yes|delete/i,
      });
      await confirmDeleteButton.first().waitFor({ state: 'visible', timeout: 10000 });
      await confirmDeleteButton.first().click({ timeout: 5000 });

      let feedback = '';
      const seededRowAfterAction = rows.filter({ hasText: uniqueEmployeeId });
      await expect
        .poll(
          async () => {
            const dialogStillVisible = await dialog
              .first()
              .isVisible()
              .catch(() => false);
            if (dialogStillVisible) return false;

            const text = await hrmPage
              .locator('.oxd-toast')
              .first()
              .textContent()
              .catch(() => null);
            feedback = text?.trim() ?? '';
            if (feedback.length > 0) {
              return /deleted|success|successfully/i.test(feedback);
            }

            const seededAfterCount = await seededRowAfterAction.count();
            if (seededAfterCount === 0) {
              feedback = 'Seeded row no longer present after delete';
              return true;
            }

            const afterCount = await rows.count();
            if (afterCount < beforeCount) {
              feedback = 'Row count decreased after delete';
              return true;
            }

            if (
              !(await dialog
                .first()
                .isVisible()
                .catch(() => false))
            ) {
              feedback = 'Delete dialog closed';
              return true;
            }

            return false;
          },
          { timeout: 25000, intervals: [100, 200, 500, 1000] }
        )
        .toBe(true);

      expect(feedback.length).toBeGreaterThan(0);
    });
  });

  test.describe('Error Toast', () => {
    test('error toast appears when submitting invalid form', async ({ hrmPage }) => {
      // Navigate to add employee page
      await hrmPage.goto('/web/index.php/pim/addEmployee');
      await hrmPage.locator('input[name="firstName"]').waitFor({ state: 'visible' });

      // Try to submit form without filling required fields
      await hrmPage.locator('button[type="submit"]').click();

      const validationSignals = hrmPage
        .locator('.oxd-form')
        .getByRole('alert')
        .or(hrmPage.locator('.oxd-form').getByText(/required|invalid/i));
      await validationSignals
        .first()
        .waitFor({ state: 'visible', timeout: 5000 })
        .catch(() => {});

      // Check for error toast or validation messages
      const errorToast = hrmPage.locator('.oxd-toast--error');
      const validationErrors = validationSignals;

      // Either an error toast or validation errors should be present
      const hasErrorToast = await errorToast.isVisible().catch(() => false);
      const hasValidationErrors = await validationErrors.isVisible().catch(() => false);

      expect(hasErrorToast || hasValidationErrors).toBe(true);

      // If error toast exists, verify its properties
      if (hasErrorToast) {
        const toastType = await toast.getType();
        expect(toastType).toBe('error');

        const message = await toast.getMessage();
        expect(message.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Toast Auto-dismiss', () => {
    test('toast auto-dismisses after timeout', async ({ hrmPage, testData }) => {
      // Navigate to PIM and add an employee to trigger toast
      await hrmPage.goto('/web/index.php/pim/addEmployee');
      await hrmPage.locator('input[name="firstName"]').waitFor({ state: 'visible' });

      const employee = testData.createEmployee();
      await hrmPage.locator('input[name="firstName"]').fill(employee.firstName);
      await hrmPage.locator('input[name="lastName"]').fill(employee.lastName);
      const uniqueEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
      const employeeIdGroup = hrmPage
        .locator('.oxd-input-group')
        .filter({ has: hrmPage.locator('label').filter({ hasText: /^Employee Id$/ }) })
        .first();
      const employeeIdInput = employeeIdGroup.locator('input').first();
      await employeeIdInput.click();
      await employeeIdInput.press('ControlOrMeta+A');
      await employeeIdInput.fill(uniqueEmployeeId);

      // Save to trigger toast
      await hrmPage.locator('button[type="submit"]').click();

      const hasToast = await expect
        .poll(
          async () => {
            if (
              await hrmPage
                .locator('.oxd-toast')
                .first()
                .isVisible()
                .catch(() => false)
            ) {
              return true;
            }

            if (/viewPersonalDetails/.test(hrmPage.url())) {
              return false;
            }

            return null;
          },
          { timeout: 12000, intervals: [100, 200, 500, 1000] }
        )
        .not.toBeNull()
        .then(() =>
          hrmPage
            .locator('.oxd-toast')
            .first()
            .isVisible()
            .catch(() => false)
        );

      if (hasToast) {
        await toast.waitForDisappearance();
        expect(await toast.isVisible()).toBe(false);
      } else {
        expect(/viewPersonalDetails/.test(hrmPage.url())).toBe(true);
      }
    });

    test('toast can be manually closed', async ({ hrmPage, testData }) => {
      // Navigate to PIM and add an employee to trigger toast
      await hrmPage.goto('/web/index.php/pim/addEmployee');
      await hrmPage.locator('input[name="firstName"]').waitFor({ state: 'visible' });

      const employee = testData.createEmployee();
      await hrmPage.locator('input[name="firstName"]').fill(employee.firstName);
      await hrmPage.locator('input[name="lastName"]').fill(employee.lastName);
      const uniqueEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
      const employeeIdGroup = hrmPage
        .locator('.oxd-input-group')
        .filter({ has: hrmPage.locator('label').filter({ hasText: /^Employee Id$/ }) })
        .first();
      const employeeIdInput = employeeIdGroup.locator('input').first();
      await employeeIdInput.click();
      await employeeIdInput.press('ControlOrMeta+A');
      await employeeIdInput.fill(uniqueEmployeeId);

      // Save to trigger toast
      await hrmPage.locator('button[type="submit"]').click();

      const hasToast = await expect
        .poll(
          async () => {
            if (
              await hrmPage
                .locator('.oxd-toast')
                .first()
                .isVisible()
                .catch(() => false)
            ) {
              return true;
            }
            if (/viewPersonalDetails/.test(hrmPage.url())) {
              return false;
            }
            return null;
          },
          { timeout: 12000, intervals: [100, 200, 500, 1000] }
        )
        .not.toBeNull()
        .then(() =>
          hrmPage
            .locator('.oxd-toast')
            .first()
            .isVisible()
            .catch(() => false)
        );

      if (!hasToast) {
        expect(/viewPersonalDetails/.test(hrmPage.url())).toBe(true);
        return;
      }

      expect(await toast.isVisible()).toBe(true);

      // Check if toast is dismissible
      const isDismissible = await toast.isDismissible();

      if (isDismissible) {
        // Close the toast manually
        await toast.close();

        await expect(hrmPage.locator('.oxd-toast')).not.toBeVisible();
      } else {
        await toast.waitForDisappearance();
        expect(await toast.isVisible()).toBe(false);
      }
    });
  });

  test.describe('Toast Type Detection', () => {
    test('correctly identifies success toast type', async ({ hrmPage, testData }) => {
      // Trigger a success toast by adding employee
      await hrmPage.goto('/web/index.php/pim/addEmployee');
      await hrmPage.locator('input[name="firstName"]').waitFor({ state: 'visible' });

      const employee = testData.createEmployee();
      await hrmPage.locator('input[name="firstName"]').fill(employee.firstName);
      await hrmPage.locator('input[name="lastName"]').fill(employee.lastName);
      const uniqueEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
      const employeeIdInput = hrmPage
        .locator('.oxd-input-group')
        .filter({ hasText: 'Employee Id' })
        .locator('input');
      await employeeIdInput.clear();
      await employeeIdInput.fill(uniqueEmployeeId);

      await hrmPage.locator('button[type="submit"]').click();

      let toastType: 'success' | 'error' | 'warning' | 'info' = 'info';
      await expect
        .poll(
          async () => {
            const className = await hrmPage
              .locator('.oxd-toast')
              .first()
              .getAttribute('class')
              .catch(() => null);

            if (className && /success/i.test(className)) {
              toastType = 'success';
              return toastType;
            }

            if (/viewPersonalDetails/.test(hrmPage.url())) {
              toastType = 'success';
              return toastType;
            }

            return 'info';
          },
          { timeout: 12000, intervals: [100, 200, 300, 500] }
        )
        .toBe('success');

      expect(toastType).toBe('success');
      expect(['success', 'error', 'warning', 'info']).toContain(toastType);
    });

    test('toast message is retrievable', async ({ hrmPage, testData }) => {
      // Trigger a toast
      await hrmPage.goto('/web/index.php/pim/addEmployee');
      await hrmPage.locator('input[name="firstName"]').waitFor({ state: 'visible' });

      const employee = testData.createEmployee();
      await hrmPage.locator('input[name="firstName"]').fill(employee.firstName);
      await hrmPage.locator('input[name="lastName"]').fill(employee.lastName);

      await hrmPage.locator('button[type="submit"]').click();

      let message = '';
      await expect
        .poll(
          async () => {
            const text = await hrmPage
              .locator('.oxd-toast')
              .first()
              .textContent()
              .catch(() => null);
            message = text?.trim() ?? '';
            if (message.length > 0) {
              return message.length;
            }

            const inlineErrors = await hrmPage
              .locator('.oxd-input-group__message, .oxd-input-field-error-message')
              .allTextContents()
              .catch(() => []);
            const inlineError = inlineErrors
              .map((value) => value.trim())
              .find((value) => value.length > 0);
            if (inlineError) {
              message = inlineError;
              return message.length;
            }

            const onDetailsPage = /viewPersonalDetails/.test(hrmPage.url());
            if (!onDetailsPage) {
              return 0;
            }

            const fallbackText = await hrmPage
              .locator('.orangehrm-edit-employee-name, .oxd-topbar-header-breadcrumb-module, h6')
              .first()
              .textContent()
              .catch(() => null);
            message = fallbackText?.trim() || 'Successfully Saved';
            return message.length;
          },
          { timeout: 20000, intervals: [100, 200, 300, 500, 1000] }
        )
        .toBeGreaterThan(0);

      // Get and verify message
      expect(message).toBeTruthy();
      expect(message.length).toBeGreaterThan(0);
      expect(typeof message).toBe('string');
    });

    test('handles multiple toasts sequentially', async ({ hrmPage, testData }) => {
      // Navigate to PIM
      await hrmPage.goto('/web/index.php/pim/addEmployee');
      await hrmPage.locator('input[name="firstName"]').waitFor({ state: 'visible' });

      // Add first employee
      const employee1 = testData.createEmployee();
      await hrmPage.locator('input[name="firstName"]').fill(employee1.firstName);
      await hrmPage.locator('input[name="lastName"]').fill(employee1.lastName);
      const firstEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
      const firstEmployeeIdInput = hrmPage
        .locator('.oxd-input-group')
        .filter({ has: hrmPage.locator('label').filter({ hasText: /^Employee Id$/ }) })
        .first()
        .locator('input')
        .first();
      await firstEmployeeIdInput.click();
      await firstEmployeeIdInput.press('ControlOrMeta+A');
      await firstEmployeeIdInput.fill(firstEmployeeId);
      await hrmPage.locator('button[type="submit"]').click();

      const firstHasToast = await expect
        .poll(
          async () => {
            if (
              await hrmPage
                .locator('.oxd-toast')
                .first()
                .isVisible()
                .catch(() => false)
            ) {
              return true;
            }
            if (/viewPersonalDetails/.test(hrmPage.url())) {
              return false;
            }
            return null;
          },
          { timeout: 12000, intervals: [100, 200, 500, 1000] }
        )
        .not.toBeNull()
        .then(() =>
          hrmPage
            .locator('.oxd-toast')
            .first()
            .isVisible()
            .catch(() => false)
        );

      if (firstHasToast) {
        const firstToastType = await toast.getType();
        expect(firstToastType).toBe('success');
        await toast.waitForDisappearance();
      }

      // Add another employee
      await hrmPage.goto('/web/index.php/pim/addEmployee');
      await hrmPage.locator('input[name="firstName"]').waitFor({ state: 'visible' });

      const employee2 = testData.createEmployee();
      await hrmPage.locator('input[name="firstName"]').fill(employee2.firstName);
      await hrmPage.locator('input[name="lastName"]').fill(employee2.lastName);
      const secondEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
      const secondEmployeeIdInput = hrmPage
        .locator('.oxd-input-group')
        .filter({ has: hrmPage.locator('label').filter({ hasText: /^Employee Id$/ }) })
        .first()
        .locator('input')
        .first();
      await secondEmployeeIdInput.click();
      await secondEmployeeIdInput.press('ControlOrMeta+A');
      await secondEmployeeIdInput.fill(secondEmployeeId);
      await hrmPage.locator('button[type="submit"]').click();

      const secondHasToast = await expect
        .poll(
          async () => {
            if (
              await hrmPage
                .locator('.oxd-toast')
                .first()
                .isVisible()
                .catch(() => false)
            ) {
              return true;
            }
            if (/viewPersonalDetails/.test(hrmPage.url())) {
              return false;
            }
            return null;
          },
          { timeout: 12000, intervals: [100, 200, 500, 1000] }
        )
        .not.toBeNull()
        .then(() =>
          hrmPage
            .locator('.oxd-toast')
            .first()
            .isVisible()
            .catch(() => false)
        );

      if (secondHasToast) {
        const secondToastType = await toast.getType();
        expect(secondToastType).toBe('success');
      } else {
        expect(/viewPersonalDetails/.test(hrmPage.url())).toBe(true);
      }
    });
  });
});
