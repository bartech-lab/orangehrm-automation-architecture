import { test, expect } from '../../infra/test-runner/index.js';
import { VacanciesPage } from '../../ui/pages/recruitment/vacancies-page.js';
import { CandidatesPage } from '../../ui/pages/recruitment/candidates-page.js';

test.describe('User Journey - Recruitment Pipeline', () => {
  test('complete recruitment workflow', async ({ auth }) => {
    // Step 1: Create vacancy
    const vacanciesPage = new VacanciesPage(auth);
    await vacanciesPage.navigate();
    const vacancyName = 'Test Position ' + Date.now();
    await vacanciesPage.addVacancy({
      name: vacancyName,
      jobTitle: 'Software Engineer',
      hiringManager: 'Admin',
      positions: 1,
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();

    // Step 2: Add candidate
    const candidatesPage = new CandidatesPage(auth);
    await candidatesPage.navigate();
    const candidateName = 'Candidate_' + Date.now();
    await candidatesPage.addCandidate({
      firstName: candidateName,
      lastName: 'Test',
      email: candidateName.toLowerCase() + '@example.com',
      vacancy: vacancyName,
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();

    // Step 3: Move candidate through pipeline
    await candidatesPage.changeCandidateStatus(candidateName + ' Test', 'Interview Scheduled');
    await expect(auth.locator('.oxd-toast')).toBeVisible();

    await candidatesPage.changeCandidateStatus(candidateName + ' Test', 'Hired');
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
