import { test, expect } from '../../../infra/test-runner/index.js';
import { TimesheetsPage } from '../../../ui/pages/time/timesheets-page.js';

test.describe('Time - Timesheets', () => {
  test('should view timesheet for current week', async ({ auth }) => {
    const timesheetPage = new TimesheetsPage(auth);
    await timesheetPage.navigate();
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should enter hours for projects', async ({ auth }) => {
    const timesheetPage = new TimesheetsPage(auth);
    await timesheetPage.navigate();
    await timesheetPage.enterHours('Project A', '8');
    await expect(auth.locator('input[value="8"]')).toBeVisible();
  });

  test('should submit timesheet', async ({ auth }) => {
    const timesheetPage = new TimesheetsPage(auth);
    await timesheetPage.navigate();
    await timesheetPage.submitTimesheet();
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
