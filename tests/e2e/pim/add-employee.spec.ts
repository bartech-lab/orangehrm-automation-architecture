import { test, expect } from '../../../infra/test-runner/index.js';
import { AddEmployeePage } from '../../../ui/pages/pim/add-employee-page.js';
import path from 'path';

test.describe('PIM - Add Employee', () => {
  test('should add employee with valid data', async ({ auth }) => {
    const addPage = new AddEmployeePage(auth);
    await addPage.navigate();
    await addPage.fillEmployeeDetails({
      firstName: 'Test',
      lastName: 'Employee_' + Date.now(),
      employeeId: 'EMP' + Date.now(),
    });
    await addPage.save();
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should add employee with photo upload', async ({ auth }) => {
    const addPage = new AddEmployeePage(auth);
    await addPage.navigate();
    await addPage.fillEmployeeDetails({
      firstName: 'Photo',
      lastName: 'Test_' + Date.now(),
    });
    await addPage.uploadPhoto(path.join(process.cwd(), 'data/fixtures/test-image.jpg'));
    await addPage.save();
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should show validation errors for required fields', async ({ auth }) => {
    const addPage = new AddEmployeePage(auth);
    await addPage.navigate();
    await addPage.save();
    await expect(auth.locator('.oxd-input-group__message')).toBeVisible();
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
