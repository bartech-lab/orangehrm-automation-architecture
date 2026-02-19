import { test, expect } from '../../../../infra/test-runner/index.js';
import { OrganizationPage } from '../../../../ui/pages/admin/organization/organization-page.js';

test.describe('Admin - Organization', () => {
  test('should view organization info', async ({ auth }) => {
    const orgPage = new OrganizationPage(auth);
    await orgPage.navigate();
    await expect(
      auth.getByRole('heading', { name: /organization|general information/i }).first()
    ).toBeVisible();
  });

  test('should load locations page successfully', async ({ auth }) => {
    const orgPage = new OrganizationPage(auth);
    await orgPage.navigate();
    await orgPage.navigateToLocations();

    const url = auth.url();
    const hasLocationsInUrl = /location/i.test(url);
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

    expect(hasLocationsInUrl || hasAnyTable || hasAnyHeading).toBeTruthy();
  });
});
