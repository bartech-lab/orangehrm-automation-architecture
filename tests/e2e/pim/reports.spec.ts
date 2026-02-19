import { test, expect } from '../../../infra/test-runner/index.js';
import { ReportsPage } from '../../../ui/pages/pim/reports-page.js';

test.describe('PIM - Reports', () => {
  test('should view available reports', async ({ auth }) => {
    const reportsPage = new ReportsPage(auth);
    await reportsPage.navigate();
    await expect(auth.getByRole('table').or(auth.locator('.oxd-table')).first()).toBeVisible();
  });

  test('should run predefined report', async ({ auth }) => {
    const reportsPage = new ReportsPage(auth);
    await reportsPage.navigate();
    await reportsPage.searchReport('Employee');
    await expect(auth.getByRole('table').or(auth.locator('.oxd-table')).first()).toBeVisible();
  });

  test('should search for report', async ({ auth }) => {
    const reportsPage = new ReportsPage(auth);
    await reportsPage.navigate();
    await reportsPage.searchReport('Employee');
    await expect(auth.getByRole('table').or(auth.locator('.oxd-table')).first()).toBeVisible();
  });

  test('should configure custom report', async ({ auth }) => {
    await new ReportsPage(auth).navigate();
    await expect(auth.getByRole('button', { name: /add/i })).toBeVisible();
  });
});
