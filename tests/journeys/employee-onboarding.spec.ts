import { test, expect } from '../../infra/test-runner/index.js';
import { AddEmployeePage } from '../../ui/pages/pim/add-employee-page.js';
import { EmployeeListPage } from '../../ui/pages/pim/employee-list-page.js';
import { EmployeeDetailsPage } from '../../ui/pages/pim/employee-details-page.js';

test.describe('User Journey - Employee Onboarding', () => {
  test('complete onboarding workflow', async ({ auth }) => {
    // Step 1: Add new employee
    const addPage = new AddEmployeePage(auth);
    await addPage.navigate();
    const employeeName = 'Onboard_' + Date.now();
    await addPage.fillEmployeeDetails({
      firstName: employeeName,
      lastName: 'Test',
      employeeId: 'EMP' + Date.now(),
    });
    await addPage.save();
    await expect(auth.locator('.oxd-toast')).toBeVisible();

    // Step 2: Search for employee in list
    const listPage = new EmployeeListPage(auth);
    await listPage.navigate();
    await listPage.searchEmployee(employeeName);
    await expect(auth.locator('.oxd-table')).toContainText(employeeName);

    // Step 3: View and edit employee details
    const detailsPage = new EmployeeDetailsPage(auth);
    await listPage.navigateToEmployee(employeeName);
    await detailsPage.editContactDetails({
      email: employeeName.toLowerCase() + '@example.com',
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
