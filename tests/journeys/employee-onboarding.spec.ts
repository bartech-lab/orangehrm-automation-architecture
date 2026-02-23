import { test, expect } from '../../infra/test-runner/index.js';
import { EmployeeDomain } from '../../domain/employee-domain.js';

test.describe('User Journey - Employee Onboarding', () => {
  test('complete onboarding workflow', async ({ auth, testData }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const suffix = testData
      .getUniqueString('onboard')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-10);
    const employeeId = `${Date.now()}`.slice(-6);
    const firstName = `Onboard${suffix}`;
    const lastName = 'Test';

    const createdEmployee = await employeeDomain.createEmployee({
      firstName,
      lastName,
      employeeId,
    });

    await expect
      .poll(
        async () => {
          const results = await employeeDomain.searchEmployee({ employeeId });
          return results.some((employee) => employee.id === employeeId);
        },
        { timeout: 20000, intervals: [250, 500, 1000, 2000] }
      )
      .toBe(true);

    const detailsOpened = await employeeDomain.openEmployeeDetailsFromList(employeeId);

    expect(createdEmployee.id).toBe(employeeId);
    expect(createdEmployee.fullName).toContain(firstName);
    expect(detailsOpened).toBe(true);
  });
});
