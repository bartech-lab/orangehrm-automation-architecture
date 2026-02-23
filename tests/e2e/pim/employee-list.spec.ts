import { test, expect } from '../../../infra/test-runner/index.js';
import { EmployeeDomain } from '../../../domain/employee-domain.js';

test.describe('PIM - Employee List', () => {
  test.describe.configure({ mode: 'serial' });

  test('should display employee list', async ({ auth }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const employees = await employeeDomain.searchEmployee({});

    expect(employees.length).toBeGreaterThan(0);
    expect(employees[0]?.fullName.trim().length).toBeGreaterThan(0);
  });

  test('should search for employee', async ({ auth }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const allEmployees = await employeeDomain.searchEmployee({});
    const firstEmployeeId = allEmployees[0]?.id ?? '';
    const filteredEmployees = await employeeDomain.searchEmployee({ employeeId: firstEmployeeId });

    expect(allEmployees.length).toBeGreaterThan(0);
    expect(firstEmployeeId.length).toBeGreaterThan(0);
    expect(filteredEmployees.length).toBeGreaterThan(0);
    expect(filteredEmployees.every((employee) => employee.id === firstEmployeeId)).toBe(true);
  });

  test('should reset filters', async ({ auth }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const allEmployees = await employeeDomain.searchEmployee({});
    const firstEmployeeId = allEmployees[0]?.id ?? '';
    const filtered = await employeeDomain.searchEmployee({ employeeId: firstEmployeeId });
    const unfiltered = await employeeDomain.searchEmployee({});

    expect(firstEmployeeId.length).toBeGreaterThan(0);
    expect(filtered.every((employee) => employee.id === firstEmployeeId)).toBe(true);
    expect(unfiltered.length).toBeGreaterThanOrEqual(filtered.length);
  });

  test('should navigate to employee details', async ({ auth }) => {
    const employeeDomain = new EmployeeDomain(auth);
    const allEmployees = await employeeDomain.searchEmployee({});
    const employeeReference = allEmployees[0]?.fullName ?? '';
    const opened = await employeeDomain.openEmployeeDetailsFromList(employeeReference);

    expect(allEmployees.length).toBeGreaterThan(0);
    expect(employeeReference.length).toBeGreaterThan(0);
    expect(opened).toBe(true);
  });
});
