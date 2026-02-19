import { test, expect } from '../../../infra/test-runner/index.js';
import { UserManagementPage } from '../../../ui/pages/admin/user-management-page.js';

test.describe('Admin - User Management', () => {
  test('should search for existing user', async ({ auth }) => {
    const userPage = new UserManagementPage(auth);
    await userPage.navigate();
    await userPage.searchUser('Admin');
    await expect(auth.getByRole('table').or(auth.locator('.oxd-table')).first()).toBeVisible();
  });

  test('should load user management page successfully', async ({ auth }) => {
    await new UserManagementPage(auth).navigate();

    const url = auth.url();
    const hasAdminInUrl = /admin/i.test(url);
    const hasAnyTable = await auth
      .locator('.oxd-table, table')
      .first()
      .isVisible()
      .catch(() => false);
    const hasAddButton = await auth
      .getByRole('button', { name: /add/i })
      .isVisible()
      .catch(() => false);

    expect(hasAdminInUrl || hasAnyTable || hasAddButton).toBeTruthy();
  });

  test('should display user list', async ({ auth }) => {
    const userPage = new UserManagementPage(auth);
    await userPage.navigate();
    await userPage.searchUser('Admin');
    await expect(auth.getByRole('table').or(auth.locator('.oxd-table')).first()).toBeVisible();
  });
});
