import { test, expect } from '../../../infra/test-runner/index.js';
import { AssignLeavePage } from '../../../ui/pages/leave/assign-leave-page.js';

test.describe('Leave - Assign Leave', () => {
  test('should assign vacation to employee', async ({ auth }) => {
    const assignPage = new AssignLeavePage(auth);
    await assignPage.navigate();
    await expect(auth.getByRole('button', { name: /assign/i })).toBeVisible();
  });

  test('should assign sick leave', async ({ auth }) => {
    await new AssignLeavePage(auth).navigate();
    await expect(auth.getByPlaceholder(/type for hints/i).first()).toBeVisible();
  });

  test('should validate required fields', async ({ auth }) => {
    const assignPage = new AssignLeavePage(auth);
    await assignPage.navigate();
    await assignPage.assign();
    await expect(auth.locator('.oxd-input-group__message').first()).toBeVisible();
  });
});
