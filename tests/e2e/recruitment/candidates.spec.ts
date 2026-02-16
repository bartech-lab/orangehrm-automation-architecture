import { test, expect } from '../../../infra/test-runner/index.js';
import { CandidatesPage } from '../../../ui/pages/recruitment/candidates-page.js';

test.describe('Recruitment - Candidates', () => {
  test('should view candidates list', async ({ auth }) => {
    const candidatesPage = new CandidatesPage(auth);
    await candidatesPage.navigate();
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should add new candidate', async ({ auth }) => {
    const candidatesPage = new CandidatesPage(auth);
    await candidatesPage.navigate();
    await candidatesPage.addCandidate({
      firstName: 'John',
      lastName: 'Doe_' + Date.now(),
      email: 'john.doe_' + Date.now() + '@example.com',
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should search for candidate', async ({ auth }) => {
    const candidatesPage = new CandidatesPage(auth);
    await candidatesPage.navigate();
    await candidatesPage.searchCandidate('John');
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should change candidate status', async ({ auth }) => {
    const candidatesPage = new CandidatesPage(auth);
    await candidatesPage.navigate();
    await candidatesPage.changeCandidateStatus('John', 'Shortlisted');
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
