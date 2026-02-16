import { test, expect } from '../../../infra/test-runner/index.js';
import { VacanciesPage } from '../../../ui/pages/recruitment/vacancies-page.js';

test.describe('Recruitment - Vacancies', () => {
  test('should view vacancies list', async ({ auth }) => {
    const vacanciesPage = new VacanciesPage(auth);
    await vacanciesPage.navigate();
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should add new vacancy', async ({ auth }) => {
    const vacanciesPage = new VacanciesPage(auth);
    await vacanciesPage.navigate();
    await vacanciesPage.addVacancy({
      name: 'Test Vacancy ' + Date.now(),
      jobTitle: 'Software Engineer',
      hiringManager: 'Admin',
      positions: 2,
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should search for vacancy', async ({ auth }) => {
    const vacanciesPage = new VacanciesPage(auth);
    await vacanciesPage.navigate();
    await vacanciesPage.searchVacancy('Software');
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should toggle vacancy status', async ({ auth }) => {
    const vacanciesPage = new VacanciesPage(auth);
    await vacanciesPage.navigate();
    await vacanciesPage.toggleVacancyStatus('Software Engineer', false);
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
