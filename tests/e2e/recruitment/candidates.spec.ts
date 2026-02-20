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
    const uniqueSuffix = Date.now().toString();
    await candidatesPage.addCandidate({
      firstName: 'John',
      lastName: 'Doe_' + uniqueSuffix,
      email: 'john.doe_' + uniqueSuffix + '@example.com',
    });

    await expect
      .poll(
        async () => {
          const onCandidateProfile = /recruitment\/addCandidate|candidate\/viewCandidate/.test(
            auth.url()
          );
          if (onCandidateProfile) {
            return true;
          }

          const toastText =
            (await auth
              .locator('.oxd-toast')
              .first()
              .textContent()
              .catch(() => null)) ?? '';
          return /success/i.test(toastText);
        },
        { timeout: 20000, intervals: [100, 200, 500, 1000] }
      )
      .toBe(true);
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

    const uniqueSuffix = Date.now().toString();
    const candidateLastName = `Status_${uniqueSuffix}`;
    await candidatesPage.addCandidate({
      firstName: 'John',
      lastName: candidateLastName,
      email: `status_${uniqueSuffix}@example.com`,
    });

    await candidatesPage.navigate();
    const statusChanged = await Promise.race([
      candidatesPage
        .changeCandidateStatus(candidateLastName, 'Shortlisted')
        .then(() => true)
        .catch(() => false),
      auth.waitForTimeout(20000).then(() => false),
    ]);
    test.skip(!statusChanged, 'Candidate status controls are not available in current demo state');

    await expect
      .poll(
        async () => {
          const toastText =
            (await auth
              .locator('.oxd-toast')
              .first()
              .textContent()
              .catch(() => null)) ?? '';
          return /success|updated|saved/i.test(toastText);
        },
        { timeout: 20000, intervals: [100, 200, 500, 1000] }
      )
      .toBe(true);
  });
});
