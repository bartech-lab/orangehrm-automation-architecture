import { test, expect } from '../../infra/test-runner/index.js';
import { VacanciesPage } from '../../ui/pages/recruitment/vacancies-page.js';
import { CandidatesPage } from '../../ui/pages/recruitment/candidates-page.js';

test.describe('User Journey - Recruitment Pipeline', () => {
  test('view vacancies list', async ({ auth }) => {
    const vacanciesPage = new VacanciesPage(auth);
    await vacanciesPage.navigate();
    await vacanciesPage.waitForReady();

    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('view candidates list', async ({ auth }) => {
    const candidatesPage = new CandidatesPage(auth);
    await candidatesPage.navigate();
    await candidatesPage.waitForReady();

    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('complete recruitment workflow', async ({ auth }) => {
    const vacanciesPage = new VacanciesPage(auth);
    await vacanciesPage.navigate();
    await vacanciesPage.waitForReady();

    const vacancyName = 'Test Position ' + Date.now();
    const hiringManager =
      (await auth
        .locator('.oxd-userdropdown-name, .oxd-topbar-header-userarea p')
        .first()
        .textContent()
        .catch(() => null)) ?? 'fNameTest lNameTest';
    await vacanciesPage.addVacancy({
      name: vacancyName,
      jobTitle: 'Software Engineer',
      hiringManager: hiringManager.trim(),
      positions: 1,
    });
    await expect(auth.getByText('Edit Vacancy', { exact: false }).first()).toBeVisible({
      timeout: 20000,
    });

    const candidatesPage = new CandidatesPage(auth);
    await candidatesPage.navigate();
    await candidatesPage.waitForReady();

    const candidateName = 'Candidate_' + Date.now();
    await candidatesPage.addCandidate({
      firstName: candidateName,
      lastName: 'Test',
      email: candidateName.toLowerCase() + '@example.com',
      vacancy: vacancyName,
    });
    await expect
      .poll(
        async () => {
          const toastText =
            (await auth
              .locator('.oxd-toast')
              .first()
              .textContent()
              .catch(() => null)) ?? '';
          if (/success|saved|updated/i.test(toastText)) {
            return true;
          }

          return /recruitment\/addCandidate|candidate\/viewCandidate/.test(auth.url());
        },
        { timeout: 20000, intervals: [100, 200, 500, 1000] }
      )
      .toBe(true);

    await candidatesPage.viewCandidateDetails(candidateName + ' Test');

    const statusLabel = auth
      .locator('p')
      .filter({ hasText: /status:/i })
      .first();
    const initialStatus = ((await statusLabel.textContent().catch(() => '')) ?? '').trim();

    const actionButtons = auth
      .getByRole('button')
      .filter({ hasText: /shortlist|schedule|mark|offer|hire/i });
    await expect(actionButtons.first()).toBeVisible({ timeout: 10000 });

    const firstAction = actionButtons.first();
    await firstAction.click();

    const shortlistSaveButton = auth.getByRole('button', { name: /^Save$/ }).first();
    const shortlistSaveVisible = await shortlistSaveButton
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    if (shortlistSaveVisible) {
      await shortlistSaveButton.click();
    }

    await expect
      .poll(
        async () => {
          const toastText =
            (await auth
              .locator('.oxd-toast')
              .first()
              .textContent()
              .catch(() => null)) ?? '';
          if (/success|updated|saved/i.test(toastText)) {
            return true;
          }

          const currentStatus = ((await statusLabel.textContent().catch(() => '')) ?? '').trim();
          return currentStatus.length > 0 && currentStatus !== initialStatus;
        },
        { timeout: 20000, intervals: [100, 200, 500, 1000] }
      )
      .toBe(true);
  });
});
