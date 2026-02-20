import { test, expect } from '../../../infra/test-runner/index.js';
import { AddEmployeePage } from '../../../ui/pages/pim/add-employee-page.js';
import path from 'path';

test.describe('PIM - Add Employee', () => {
  test('should add employee with valid data', async ({ auth, testData }) => {
    const addPage = new AddEmployeePage(auth);
    await addPage.navigate();
    const uniqueEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
    const uniqueLastName = testData
      .getUniqueString('last')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-8);
    await addPage.fillEmployeeDetails({
      firstName: 'Test',
      lastName: `Employee${uniqueLastName}`,
      employeeId: uniqueEmployeeId,
    });
    await addPage.save();

    await expect
      .poll(
        async () => {
          const onDetailsPage = /viewPersonalDetails/.test(auth.url());
          if (onDetailsPage) {
            return true;
          }

          const toastText =
            (await auth
              .locator('.oxd-toast')
              .first()
              .textContent()
              .catch(() => null)) ?? '';
          return /success/i.test(toastText);
        },
        { timeout: 20000, intervals: [100, 200, 500, 1000] }
      )
      .toBe(true);
  });

  test('should add employee with photo upload', async ({ auth, testData }) => {
    const addPage = new AddEmployeePage(auth);
    await addPage.navigate();
    const uniqueEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
    const uniqueLastName = testData
      .getUniqueString('photo')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-8);
    await addPage.fillEmployeeDetails({
      firstName: 'Photo',
      lastName: `Test${uniqueLastName}`,
      employeeId: uniqueEmployeeId,
    });
    await addPage.uploadPhoto(path.join(process.cwd(), 'data/fixtures/test-image.jpg'));
    await addPage.save();

    await expect
      .poll(
        async () => {
          const onDetailsPage = /viewPersonalDetails/.test(auth.url());
          if (onDetailsPage) {
            return true;
          }

          const toastText =
            (await auth
              .locator('.oxd-toast')
              .first()
              .textContent()
              .catch(() => null)) ?? '';
          return /success/i.test(toastText);
        },
        { timeout: 20000, intervals: [100, 200, 500, 1000] }
      )
      .toBe(true);
  });

  test('should show validation errors for required fields', async ({ auth }) => {
    const addPage = new AddEmployeePage(auth);
    await addPage.navigate();
    await addPage.save();

    await expect
      .poll(async () => {
        const messages = auth.locator('.oxd-input-group__message');
        const count = await messages.count();
        if (count === 0) {
          return false;
        }

        const texts = await messages.allTextContents();
        return texts.some((text) => /required/i.test(text));
      })
      .toBe(true);
  });

  test('should cancel operation', async ({ auth }) => {
    const addPage = new AddEmployeePage(auth);
    await addPage.navigate();
    await addPage.fillEmployeeDetails({
      firstName: 'Cancel',
      lastName: 'Test',
    });
    await addPage.cancel();
    await expect(auth).toHaveURL(/viewEmployeeList/);
  });
});
