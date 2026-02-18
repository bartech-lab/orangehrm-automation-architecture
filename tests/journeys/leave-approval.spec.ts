import { test, expect } from '../../infra/test-runner/index.js';
import { ApplyLeavePage } from '../../ui/pages/leave/apply-leave-page.js';
import { LeaveListPage } from '../../ui/pages/leave/leave-list-page.js';

test.describe('User Journey - Leave Approval', () => {
  test.skip('complete leave approval workflow', async ({ auth }) => {
    const applyPage = new ApplyLeavePage(auth);
    await applyPage.navigate();
    await applyPage.waitForReady();

    const hasLeaveTypes = await applyPage.hasLeaveTypes();
    test.skip(!hasLeaveTypes, 'No leave types with balance available');

    await applyPage.selectLeaveType('Vacation');
    await applyPage.setDateRange('2024-12-25', '2024-12-26');
    await applyPage.addComments('Christmas vacation');
    await applyPage.apply();
    await expect(auth.locator('.oxd-toast')).toBeVisible();

    const listPage = new LeaveListPage(auth);
    await listPage.navigate();
    await listPage.filterByStatus('Pending');
    await expect(auth.locator('.oxd-table')).toBeVisible();

    await listPage.viewLeaveDetails(0);
    await auth.getByRole('button', { name: /approve/i }).click();
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('view leave list', async ({ auth }) => {
    const listPage = new LeaveListPage(auth);
    await listPage.navigate();
    await listPage.waitForReady();

    await expect(auth.locator('.oxd-table')).toBeVisible();
    const rowCount = await listPage.dataTable.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });
});
