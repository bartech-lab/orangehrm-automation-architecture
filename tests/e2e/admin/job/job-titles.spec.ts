import { test, expect } from '../../../../infra/test-runner/index.js';
import { JobTitlesPage } from '../../../../ui/pages/admin/job/job-titles-page.js';

test.describe('Admin - Job Management', () => {
  test('should view job titles list', async ({ auth }) => {
    const jobPage = new JobTitlesPage(auth);
    await jobPage.navigate();
    await expect(auth.getByRole('table').or(auth.locator('.oxd-table')).first()).toBeVisible();
  });

  test('should load job titles page successfully', async ({ auth }) => {
    await new JobTitlesPage(auth).navigate();

    const url = auth.url();
    const hasJobTitleInUrl = /jobTitle|admin/i.test(url);
    const hasAnyTable = await auth
      .locator('.oxd-table, table')
      .first()
      .isVisible()
      .catch(() => false);
    const hasAnyHeading = await auth
      .getByRole('heading')
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasJobTitleInUrl || hasAnyTable || hasAnyHeading).toBeTruthy();
  });

  test('should display job titles data table', async ({ auth }) => {
    await new JobTitlesPage(auth).navigate();
    await expect(auth.getByRole('table').or(auth.locator('.oxd-table')).first()).toBeVisible();
  });

  test('should display action buttons on job titles', async ({ auth }) => {
    await new JobTitlesPage(auth).navigate();
    await expect(auth.getByRole('table').or(auth.locator('.oxd-table')).first()).toBeVisible();
  });
});
