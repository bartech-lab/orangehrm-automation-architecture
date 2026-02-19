import { test, expect } from '../../../infra/test-runner/index.js';
import { AttendancePage } from '../../../ui/pages/time/attendance-page.js';

test.describe('Time - Attendance', () => {
  test('should view attendance history', async ({ auth }) => {
    const attendancePage = new AttendancePage(auth);
    await attendancePage.viewAttendanceRecords();
    await expect(auth.getByRole('table').or(auth.locator('.oxd-table')).first()).toBeVisible();
  });

  test('should load attendance page successfully', async ({ auth }) => {
    const attendancePage = new AttendancePage(auth);
    await attendancePage.navigate();

    const url = auth.url();
    const hasAttendanceInUrl = /attendance/i.test(url);
    const hasAnyForm = await auth
      .locator('.oxd-form, form')
      .first()
      .isVisible()
      .catch(() => false);
    const hasAnyHeading = await auth
      .getByRole('heading')
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasAttendanceInUrl || hasAnyForm || hasAnyHeading).toBeTruthy();
  });
});
