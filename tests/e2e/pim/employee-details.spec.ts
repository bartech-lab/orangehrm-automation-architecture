import { test, expect } from '../../../infra/test-runner/index.js';
import { EmployeeDetailsPage } from '../../../ui/pages/pim/employee-details-page.js';

test.describe('PIM - Employee Details', () => {
  test.skip('should view employee details', async ({ auth }) => {
    const detailsPage = new EmployeeDetailsPage(auth);
    await detailsPage.navigate();
    await expect(auth.locator('.oxd-form')).toBeVisible();
  });

  test.skip('should edit personal information', async ({ auth }) => {
    const detailsPage = new EmployeeDetailsPage(auth);
    await detailsPage.navigate();
    await detailsPage.editPersonalDetails({
      firstName: 'Updated',
      lastName: 'Name',
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test.skip('should edit contact details', async ({ auth }) => {
    const detailsPage = new EmployeeDetailsPage(auth);
    await detailsPage.navigate();
    await detailsPage.editContactDetails({
      email: 'test@example.com',
      phone: '1234567890',
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test.skip('should view job information', async ({ auth }) => {
    const detailsPage = new EmployeeDetailsPage(auth);
    await detailsPage.navigate();
    await detailsPage.viewJobInformation();
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test.skip('should navigate between tabs', async ({ auth }) => {
    const detailsPage = new EmployeeDetailsPage(auth);
    await detailsPage.navigate();
    await detailsPage.navigateToTab('Contact Details');
    await expect(auth.locator('.oxd-form')).toBeVisible();
    await detailsPage.navigateToTab('Job');
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });
});
