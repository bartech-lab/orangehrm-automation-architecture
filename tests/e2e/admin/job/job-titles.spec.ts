import { test, expect } from '../../../../infra/test-runner/index.js';
import { JobTitlesPage } from '../../../../ui/pages/admin/job/job-titles-page.js';

test.describe('Admin - Job Management', () => {
  test('should view job titles list', async ({ auth }) => {
    const jobPage = new JobTitlesPage(auth);
    await jobPage.navigate();
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should add new job title', async ({ auth }) => {
    const jobPage = new JobTitlesPage(auth);
    await jobPage.navigate();
    await jobPage.addJobTitle('Test Job ' + Date.now(), 'Test Description');
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should edit job title', async ({ auth }) => {
    const jobPage = new JobTitlesPage(auth);
    await jobPage.navigate();
    const testTitle = 'EditMe_' + Date.now();
    await jobPage.addJobTitle(testTitle, 'Original');
    await jobPage.editJobTitle(testTitle, 'Edited_' + testTitle);
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should delete job title', async ({ auth }) => {
    const jobPage = new JobTitlesPage(auth);
    await jobPage.navigate();
    const testTitle = 'DeleteMe_' + Date.now();
    await jobPage.addJobTitle(testTitle, 'To be deleted');
    await jobPage.deleteJobTitle(testTitle);
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
