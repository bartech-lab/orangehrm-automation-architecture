import { test, expect } from '../../infra/test-runner/index.js';
import { AddEmployeePage } from '../../ui/pages/pim/add-employee-page.js';
import { EmployeeListPage } from '../../ui/pages/pim/employee-list-page.js';
import { EmployeeDetailsPage } from '../../ui/pages/pim/employee-details-page.js';

test.describe('User Journey - Employee Onboarding', () => {
  test('complete onboarding workflow', async ({ auth }) => {
    const addPage = new AddEmployeePage(auth);
    await addPage.navigate();
    await addPage.waitForReady();

    const employeeName = 'Onboard_' + Date.now();
    const shortId = Date.now().toString().slice(-6);

    await addPage.fillEmployeeDetails({
      firstName: employeeName,
      lastName: 'Test',
      employeeId: shortId,
    });
    await addPage.save();

    await auth
      .locator('.oxd-toast, [class*="viewPersonalDetails"]')
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    const url = auth.url();
    const onDetailsPage = url.includes('viewPersonalDetails');
    const toastVisible = await auth
      .locator('.oxd-toast')
      .isVisible()
      .catch(() => false);

    expect(onDetailsPage || toastVisible).toBe(true);

    const listPage = new EmployeeListPage(auth);
    await listPage.navigate();
    await listPage.waitForReady();

    await listPage.searchEmployee(employeeName);
    await expect(auth.locator('.oxd-table')).toContainText(employeeName);

    const detailsPage = new EmployeeDetailsPage(auth);
    await listPage.navigateToEmployee(employeeName);
    await detailsPage.waitForReady();

    await expect(auth.getByPlaceholder('First Name')).toHaveValue(employeeName);
  });
});
