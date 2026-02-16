import { test, expect } from '../../../infra/test-runner/index.js';
import { ReportsPage } from '../../../ui/pages/pim/reports-page.js';

test.describe('PIM - Reports', () => {
  test('should view available reports', async ({ auth }) => {
    const reportsPage = new ReportsPage(auth);
    await reportsPage.navigate();
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should run predefined report', async ({ auth }) => {
    const reportsPage = new ReportsPage(auth);
    await reportsPage.navigate();
    await reportsPage.runReport('Employee Report');
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should search for report', async ({ auth }) => {
    const reportsPage = new ReportsPage(auth);
    await reportsPage.navigate();
    await reportsPage.searchReport('Employee');
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should configure custom report', async ({ auth }) => {
    const reportsPage = new ReportsPage(auth);
    await reportsPage.navigate();
    await reportsPage.configureReport({
      name: 'Custom Report ' + Date.now(),
      criteria: 'Employee Name',
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
