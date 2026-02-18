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

  test.skip('complete recruitment workflow', async ({ auth }) => {
    const vacanciesPage = new VacanciesPage(auth);
    await vacanciesPage.navigate();
    await vacanciesPage.waitForReady();

    const vacancyName = 'Test Position ' + Date.now();
    await vacanciesPage.addVacancy({
      name: vacancyName,
      jobTitle: 'Software Engineer',
      hiringManager: 'Admin',
      positions: 1,
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();

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
    await expect(auth.locator('.oxd-toast')).toBeVisible();

    await candidatesPage.changeCandidateStatus(candidateName + ' Test', 'Interview Scheduled');
    await expect(auth.locator('.oxd-toast')).toBeVisible();

    await candidatesPage.changeCandidateStatus(candidateName + ' Test', 'Hired');
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
