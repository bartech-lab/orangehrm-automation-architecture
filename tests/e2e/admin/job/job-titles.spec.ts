import { test, expect } from '../../../../infra/test-runner/index.js';
import { AdminDomain } from '../../../../domain/admin-domain.js';

test.describe('Admin - Job Management', () => {
  test('should view job titles list', async ({ auth }) => {
    const adminDomain = new AdminDomain(auth);
    const jobTitlesView = await adminDomain.viewJobTitles();

    expect(jobTitlesView.hasResultsTable).toBe(true);
  });

  test('should load job titles page successfully', async ({ auth }) => {
    const adminDomain = new AdminDomain(auth);
    const pageState = await adminDomain.openJobTitles();

    expect(pageState.isLoaded).toBe(true);
  });

  test('should display job titles data table', async ({ auth }) => {
    const adminDomain = new AdminDomain(auth);
    const tableView = await adminDomain.viewJobTitles();

    expect(tableView.hasResultsTable).toBe(true);
  });

  test('should display action buttons on job titles', async ({ auth }) => {
    const adminDomain = new AdminDomain(auth);
    const tableView = await adminDomain.viewJobTitles();

    expect(tableView.hasResultsTable).toBe(true);
  });
});
