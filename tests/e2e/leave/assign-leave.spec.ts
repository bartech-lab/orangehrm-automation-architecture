import { test, expect } from '../../../infra/test-runner/index.js';
import { AssignLeavePage } from '../../../ui/pages/leave/assign-leave-page.js';

test.describe('Leave - Assign Leave', () => {
  test('should assign vacation to employee', async ({ auth }) => {
    const assignPage = new AssignLeavePage(auth);
    await assignPage.navigate();
    await assignPage.selectEmployee('Admin');
    await assignPage.selectLeaveType('Vacation');
    await assignPage.setDates('2024-12-25', '2024-12-26');
    await assignPage.assign();
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should assign sick leave', async ({ auth }) => {
    const assignPage = new AssignLeavePage(auth);
    await assignPage.navigate();
    await assignPage.selectEmployee('Admin');
    await assignPage.selectLeaveType('Sick');
    await assignPage.setDates('2024-12-20', '2024-12-20');
    await assignPage.assign();
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should validate required fields', async ({ auth }) => {
    const assignPage = new AssignLeavePage(auth);
    await assignPage.navigate();
    await assignPage.assign();
    await expect(auth.locator('.oxd-input-group__message')).toBeVisible();
  });
});
