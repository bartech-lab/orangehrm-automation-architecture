import { test, expect } from '../../../infra/test-runner/index.js';
import { AdminDomain } from '../../../domain/admin-domain.js';

test.describe('Admin - User Management', () => {
  test('should search for existing user', async ({ auth }) => {
    const adminDomain = new AdminDomain(auth);
    const searchResult = await adminDomain.searchSystemUser('Admin');

    expect(searchResult.hasResultsTable).toBe(true);
  });

  test('should load user management page successfully', async ({ auth }) => {
    const adminDomain = new AdminDomain(auth);
    const pageState = await adminDomain.openUserManagement();

    expect(pageState.isLoaded).toBe(true);
  });

  test('should display user list', async ({ auth }) => {
    const adminDomain = new AdminDomain(auth);
    const listView = await adminDomain.searchSystemUser('Admin');

    expect(listView.hasResultsTable).toBe(true);
  });
});
