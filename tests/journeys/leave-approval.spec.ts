import { test, expect } from '../../infra/test-runner/index.js';
import { ApplyLeavePage } from '../../ui/pages/leave/apply-leave-page.js';
import { LeaveListPage } from '../../ui/pages/leave/leave-list-page.js';

test.describe('User Journey - Leave Approval', () => {
  test('complete leave approval workflow', async ({ auth }) => {
    // Step 1: Employee applies for leave
    const applyPage = new ApplyLeavePage(auth);
    await applyPage.navigate();
    await applyPage.selectLeaveType('Vacation');
    await applyPage.setDateRange('2024-12-25', '2024-12-26');
    await applyPage.addComments('Christmas vacation');
    await applyPage.apply();
    await expect(auth.locator('.oxd-toast')).toBeVisible();

    // Step 2: Manager views leave requests
    const listPage = new LeaveListPage(auth);
    await listPage.navigate();
    await listPage.filterByStatus('Pending');
    await expect(auth.locator('.oxd-table')).toBeVisible();

    // Step 3: Manager approves leave
    await listPage.viewLeaveDetails(0);
    await auth.click('.oxd-button:has-text("Approve")');
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
