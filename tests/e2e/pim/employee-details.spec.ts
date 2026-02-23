import { test, expect } from '../../../infra/test-runner/index.js';
import { EmployeeDomain } from '../../../domain/employee-domain.js';

test.describe('PIM - Employee Details', () => {
  test.describe.configure({ mode: 'serial' });

  test('should view employee details', async ({ auth }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const isReady = await employeeDomain.viewCurrentEmployeeDetails();

    expect(isReady).toBe(true);
  });

  test('should edit personal information', async ({ auth }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const isUpdated = await employeeDomain.editCurrentEmployeePersonalDetails({
      firstName: 'Updated',
      lastName: `Name${Date.now()}`,
    });

    expect(isUpdated).toBe(true);
  });

  test('should edit contact details', async ({ auth }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const isUpdated = await employeeDomain.editCurrentEmployeeContactDetails({
      email: `test${Date.now()}@example.com`,
      phone: '1234567890',
    });

    expect(isUpdated).toBe(true);
  });

  test('should view job information', async ({ auth }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const hasJobSection = await employeeDomain.viewCurrentEmployeeJobInformation();

    expect(hasJobSection).toBe(true);
  });

  test('should navigate between tabs', async ({ auth }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const canNavigateTabs = await employeeDomain.navigateCurrentEmployeeTabs([
      'Contact Details',
      'Job',
    ]);

    expect(canNavigateTabs).toBe(true);
  });
});
