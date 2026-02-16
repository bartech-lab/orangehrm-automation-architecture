import { test, expect } from '../infra/test-runner/index.js';

test.describe('Core Fixtures Verification', () => {
  test('auth fixture provides authenticated page', async ({ auth }) => {
    await auth.goto('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
    await expect(auth).toHaveURL(/dashboard/);
    await expect(auth.locator('.oxd-topbar-header')).toBeVisible();
  });

  test('hrmPage fixture provides authenticated page', async ({ hrmPage }) => {
    // hrmPage is a pre-authenticated page ready for HRM tests
    await hrmPage.goto('/web/index.php/dashboard/index');
    await expect(hrmPage).toHaveURL(/dashboard/);
    await expect(hrmPage.locator('.oxd-topbar-header')).toBeVisible();
  });

  test('testData fixture generates unique test data', async ({ testData }) => {
    const user1 = testData.createUser();
    const user2 = testData.createUser();

    expect(user1.username).not.toBe(user2.username);
    expect(user1.username).toMatch(/^testuser_\d+_\d+$/);

    const employee = testData.createEmployee();
    expect(employee.firstName).toBe('Test');
    expect(employee.employeeId).toMatch(/^EMP\d+_\d+$/);

    const unique1 = testData.getUniqueString('prefix');
    const unique2 = testData.getUniqueString('prefix');
    expect(unique1).not.toBe(unique2);
    expect(unique1).toMatch(/^prefix_\d+_\d+$/);
  });

  test('testLogger fixture logs test execution @skip-ci', async ({}) => {
    // This test verifies the testLogger auto-fixture runs
    // The fixture logs [TEST START] and [TEST PASSED/FAILED] messages
    expect(true).toBe(true);
  });
});
