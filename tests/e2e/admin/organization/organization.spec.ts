import { test, expect } from '../../../../infra/test-runner/index.js';
import { AdminDomain } from '../../../../domain/admin-domain.js';

test.describe('Admin - Organization', () => {
  test('should view organization info', async ({ auth }) => {
    const adminDomain = new AdminDomain(auth);
    const organizationInfo = await adminDomain.openOrganizationInfo();

    expect(organizationInfo.isVisible).toBe(true);
  });

  test('should load locations page successfully', async ({ auth }) => {
    const adminDomain = new AdminDomain(auth);
    const locationsState = await adminDomain.openOrganizationLocations();

    expect(locationsState.isLoaded).toBe(true);
  });
});
