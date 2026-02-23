import { test, expect } from '../../../infra/test-runner/index.js';
import { EmployeeDomain } from '../../../domain/employee-domain.js';
import path from 'path';

test.describe('PIM - Add Employee', () => {
  test.describe.configure({ mode: 'serial' });

  test('should add employee with valid data', async ({ auth, testData }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const uniqueEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
    const uniqueLastName = testData
      .getUniqueString('last')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-8);

    const createdEmployee = await employeeDomain.createEmployee({
      firstName: 'Test',
      lastName: `Employee${uniqueLastName}`,
      employeeId: uniqueEmployeeId,
    });

    await expect
      .poll(
        async () => {
          const results = await employeeDomain.searchEmployee({ employeeId: uniqueEmployeeId });
          return results.some((employee) => employee.id === uniqueEmployeeId);
        },
        { timeout: 20000, intervals: [250, 500, 1000, 2000] }
      )
      .toBe(true);

    expect(createdEmployee.id).toBe(uniqueEmployeeId);
    expect(createdEmployee.fullName).toContain(`Employee${uniqueLastName}`);
  });

  test('should add employee with photo upload', async ({ auth, testData }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const uniqueEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);
    const uniqueLastName = testData
      .getUniqueString('photo')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(-8);

    const createdEmployee = await employeeDomain.createEmployee({
      firstName: 'Photo',
      lastName: `Test${uniqueLastName}`,
      employeeId: uniqueEmployeeId,
      photoPath: path.join(process.cwd(), 'data/fixtures/test-image.jpg'),
    });

    await expect
      .poll(
        async () => {
          const results = await employeeDomain.searchEmployee({ employeeId: uniqueEmployeeId });
          return results.some((employee) => employee.id === uniqueEmployeeId);
        },
        { timeout: 20000, intervals: [250, 500, 1000, 2000] }
      )
      .toBe(true);

    expect(createdEmployee.id).toBe(uniqueEmployeeId);
    expect(createdEmployee.fullName).toContain(`Test${uniqueLastName}`);
  });

  test('should show validation errors for required fields', async ({ auth }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const uniqueEmployeeId = `${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-10);

    const attempt = await employeeDomain.attemptCreateEmployee({
      firstName: '',
      lastName: '',
      employeeId: uniqueEmployeeId,
    });

    expect(attempt.success).toBe(false);
    expect(attempt.hasValidationErrors).toBe(true);
  });

  test('should cancel operation', async ({ auth }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const cancelled = await employeeDomain.cancelEmployeeCreation({
      firstName: 'Cancel',
      lastName: `Employee${Date.now()}`,
    });

    expect(cancelled.cancelled).toBe(true);
    expect(cancelled.currentUrl).toContain('/pim/viewEmployeeList');
  });
});
