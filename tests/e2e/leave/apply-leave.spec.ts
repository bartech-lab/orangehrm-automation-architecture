import { test, expect } from '../../../infra/test-runner/index.js';
import { ApplyLeavePage } from '../../../ui/pages/leave/apply-leave-page.js';

test.describe('Leave - Apply Leave', () => {
  test('should apply for vacation leave', async ({ auth }) => {
    const leavePage = new ApplyLeavePage(auth);
    await leavePage.navigate();
    await leavePage.selectLeaveType('Vacation');
    await leavePage.setDateRange('2024-12-25', '2024-12-26');
    await leavePage.addComments('Vacation request');
    await leavePage.apply();
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should apply for sick leave', async ({ auth }) => {
    const leavePage = new ApplyLeavePage(auth);
    await leavePage.navigate();
    await leavePage.selectLeaveType('Sick');
    await leavePage.setDateRange('2024-12-20', '2024-12-20');
    await leavePage.apply();
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should show validation for past dates', async ({ auth }) => {
    const leavePage = new ApplyLeavePage(auth);
    await leavePage.navigate();
    await leavePage.setDateRange('2020-01-01', '2020-01-02');
    await leavePage.apply();
    await expect(auth.locator('.oxd-input-group__message')).toBeVisible();
  });
});
