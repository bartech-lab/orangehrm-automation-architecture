import { test, expect } from '../../../infra/test-runner/index.js';
import { UserManagementPage } from '../../../ui/pages/admin/user-management-page.js';

test.describe('Admin - User Management', () => {
  test('should search for existing user', async ({ auth }) => {
    const userPage = new UserManagementPage(auth);
    await userPage.navigate();
    await userPage.searchUser('Admin');
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should add new user', async ({ auth }) => {
    const userPage = new UserManagementPage(auth);
    await userPage.navigate();
    await userPage.addUser({
      username: 'TestUser_' + Date.now(),
      password: 'TestPass123!',
      role: 'ESS',
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should edit user role', async ({ auth }) => {
    const userPage = new UserManagementPage(auth);
    await userPage.navigate();
    await userPage.editUser('Admin', { role: 'Admin' });
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should delete user with confirmation', async ({ auth }) => {
    const userPage = new UserManagementPage(auth);
    await userPage.navigate();
    const testUser = 'DeleteMe_' + Date.now();
    await userPage.addUser({ username: testUser, password: 'TestPass123!', role: 'ESS' });
    await userPage.deleteUser(testUser);
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
