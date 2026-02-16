import { test, expect } from '../../../../infra/test-runner/index.js';
import { OrganizationPage } from '../../../../ui/pages/admin/organization/organization-page.js';

test.describe('Admin - Organization', () => {
  test('should view organization info', async ({ auth }) => {
    const orgPage = new OrganizationPage(auth);
    await orgPage.navigate();
    await expect(auth.locator('.oxd-form')).toBeVisible();
  });

  test('should edit organization name', async ({ auth }) => {
    const orgPage = new OrganizationPage(auth);
    await orgPage.navigate();
    await orgPage.editOrganizationName('OrangeHRM Test');
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should navigate to locations', async ({ auth }) => {
    const orgPage = new OrganizationPage(auth);
    await orgPage.navigate();
    await orgPage.navigateToLocations();
    await expect(auth).toHaveURL(/viewLocations/);
  });

  test('should add location', async ({ auth }) => {
    const orgPage = new OrganizationPage(auth);
    await orgPage.navigate();
    await orgPage.navigateToLocations();
    await orgPage.addLocation({
      name: 'Test Location ' + Date.now(),
      city: 'New York',
      country: 'US',
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
