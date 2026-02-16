import { test, expect } from '../../../infra/test-runner/index.js';
import { AttendancePage } from '../../../ui/pages/time/attendance-page.js';

test.describe('Time - Attendance', () => {
  test('should punch in', async ({ auth }) => {
    const attendancePage = new AttendancePage(auth);
    await attendancePage.navigate();
    await attendancePage.punchIn();
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should punch out', async ({ auth }) => {
    const attendancePage = new AttendancePage(auth);
    await attendancePage.navigate();
    await attendancePage.punchOut();
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should view attendance history', async ({ auth }) => {
    const attendancePage = new AttendancePage(auth);
    await attendancePage.viewAttendanceRecords();
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should edit attendance record', async ({ auth }) => {
    const attendancePage = new AttendancePage(auth);
    await attendancePage.editRecord('2024-01-01');
    await expect(auth.locator('.oxd-form')).toBeVisible();
  });
});
