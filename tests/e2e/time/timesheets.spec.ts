import { test, expect } from '../../../infra/test-runner/index.js';
import { TimesheetsPage } from '../../../ui/pages/time/timesheets-page.js';

test.describe('Time - Timesheets', () => {
  test('should view timesheet for current week', async ({ auth }) => {
    const timesheetPage = new TimesheetsPage(auth);
    await timesheetPage.navigate();
    await expect(auth.getByRole('table').or(auth.locator('.oxd-table')).first()).toBeVisible();
  });

  test('should load timesheet page successfully', async ({ auth }) => {
    await new TimesheetsPage(auth).navigate();

    const url = auth.url();
    const hasTimeInUrl = /time/i.test(url);
    const hasAnyTable = await auth
      .locator('.oxd-table, table')
      .first()
      .isVisible()
      .catch(() => false);
    const hasAnyForm = await auth
      .locator('.oxd-form, form')
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasTimeInUrl || hasAnyTable || hasAnyForm).toBeTruthy();
  });
});
