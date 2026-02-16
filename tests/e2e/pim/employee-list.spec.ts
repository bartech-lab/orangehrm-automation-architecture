import { test, expect } from '../../../infra/test-runner/index.js';
import { EmployeeListPage } from '../../../ui/pages/pim/employee-list-page.js';

test.describe('PIM - Employee List', () => {
  test('should display employee list', async ({ auth }) => {
    const empPage = new EmployeeListPage(auth);
    await empPage.navigate();
    const count = await empPage.getEmployeeCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should search for employee', async ({ auth }) => {
    const empPage = new EmployeeListPage(auth);
    await empPage.navigate();
    await empPage.searchEmployee('Admin');
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should reset filters', async ({ auth }) => {
    const empPage = new EmployeeListPage(auth);
    await empPage.navigate();
    await empPage.searchEmployee('Test');
    await empPage.resetFilters();
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should navigate to employee details', async ({ auth }) => {
    const empPage = new EmployeeListPage(auth);
    await empPage.navigate();
    await empPage.navigateToEmployee('Admin');
    await expect(auth).toHaveURL(/viewPersonalDetails/);
  });
});
