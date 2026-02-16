import { test, expect } from '../../../infra/test-runner/index.js';
import { LeaveListPage } from '../../../ui/pages/leave/leave-list-page.js';

test.describe('Leave - Leave List', () => {
  test('should view all leave requests', async ({ auth }) => {
    const leavePage = new LeaveListPage(auth);
    await leavePage.navigate();
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should filter by status', async ({ auth }) => {
    const leavePage = new LeaveListPage(auth);
    await leavePage.navigate();
    await leavePage.filterByStatus('Pending');
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should filter by leave type', async ({ auth }) => {
    const leavePage = new LeaveListPage(auth);
    await leavePage.navigate();
    await leavePage.filterByType('Vacation');
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should search by employee', async ({ auth }) => {
    const leavePage = new LeaveListPage(auth);
    await leavePage.navigate();
    await leavePage.searchEmployee('Admin');
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });
});
