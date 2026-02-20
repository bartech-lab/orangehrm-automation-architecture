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
    const vacancyName = 'Test Vacancy ' + Date.now();
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
      positions: 2,
    });
    await expect(auth.getByText('Edit Vacancy', { exact: false }).first()).toBeVisible({
      timeout: 20000,
    });
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

    const vacancyName = 'Status Toggle Vacancy ' + Date.now();
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

    await vacanciesPage.setCurrentVacancyStatus(false);

    await expect
      .poll(() => vacanciesPage.isCurrentVacancyActive().catch(() => true), {
        timeout: 20000,
        intervals: [100, 200, 500, 1000],
      })
      .toBe(false);
  });
});
