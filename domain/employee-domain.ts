import { AddEmployeePage } from '../ui/pages/pim/add-employee-page.js';
import { EmployeeDetailsPage } from '../ui/pages/pim/employee-details-page.js';
import { EmployeeListPage } from '../ui/pages/pim/employee-list-page.js';
import {
  Department,
  EmploymentStatus,
  type Employee,
  type EmployeeSearchFilters,
  type EmployeeSummary,
} from './employee/types.js';

type EmployeeDomainPage = ConstructorParameters<typeof AddEmployeePage>[0];

export interface CreateEmployeeInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeId?: string;
  photoPath?: string;
  department?: Department;
  jobTitle?: string;
}

export interface UpdateEmployeeInput {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: Department;
  jobTitle?: string;
  employmentStatus?: EmploymentStatus;
}

export interface EmployeeSearchCriteria extends EmployeeSearchFilters {
  employeeId?: string;
}

const DEFAULT_TIMEOUT_MS = 20000;
const POLL_INTERVAL_MS = 250;

export class EmployeeDomain {
  private readonly addEmployeePage: AddEmployeePage;
  private readonly employeeListPage: EmployeeListPage;
  private readonly employeeDetailsPage: EmployeeDetailsPage;

  constructor(page: EmployeeDomainPage) {
    this.addEmployeePage = new AddEmployeePage(page);
    this.employeeListPage = new EmployeeListPage(page);
    this.employeeDetailsPage = new EmployeeDetailsPage(page);
  }

  async createEmployee(data: CreateEmployeeInput): Promise<EmployeeSummary> {
    await this.addEmployeePage.navigate();
    await this.addEmployeePage.waitForReady();
    await this.addEmployeePage.fillEmployeeDetails({
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      employeeId: data.employeeId,
    });

    if (data.photoPath) {
      await this.addEmployeePage.uploadPhoto(data.photoPath);
    }

    await this.addEmployeePage.save();
    await this.waitForOperationCompletion(async () => {
      const detailsReady = await this.employeeDetailsPage.isReady();
      if (detailsReady) {
        return true;
      }

      const url = await this.addEmployeePage.getCurrentUrl();
      return /viewPersonalDetails/i.test(url);
    }, 'Employee creation did not complete successfully.');

    const employeeId = data.employeeId ?? this.generateEmployeeId();
    return {
      id: employeeId,
      fullName: this.composeFullName(data.firstName, data.lastName, data.middleName),
      jobTitle: data.jobTitle ?? 'Unassigned',
      department: data.department ?? Department.OPERATIONS,
      employmentStatus: EmploymentStatus.ACTIVE,
    };
  }

  async updateEmployee(id: string, data: UpdateEmployeeInput): Promise<Employee> {
    const existingEmployee = await this.getEmployeeDetails(id);
    if (!existingEmployee) {
      throw new Error(`Employee with id ${id} was not found.`);
    }

    await this.openEmployeeRecord(id);

    if (data.firstName || data.lastName) {
      await this.employeeDetailsPage.editPersonalDetails({
        firstName: data.firstName,
        lastName: data.lastName,
      });
    }

    if (data.email || data.phone) {
      await this.employeeDetailsPage.editContactDetails({
        email: data.email,
        phone: data.phone,
      });
    }

    await this.waitForOperationCompletion(
      async () => this.employeeDetailsPage.isReady(),
      'Employee update did not complete successfully.'
    );

    return {
      ...existingEmployee,
      firstName: data.firstName ?? existingEmployee.firstName,
      middleName: data.middleName ?? existingEmployee.middleName,
      lastName: data.lastName ?? existingEmployee.lastName,
      email: data.email ?? existingEmployee.email,
      phone: data.phone ?? existingEmployee.phone,
      department: data.department ?? existingEmployee.department,
      jobTitle: data.jobTitle ?? existingEmployee.jobTitle,
      employmentStatus: data.employmentStatus ?? existingEmployee.employmentStatus,
      updatedAt: new Date(),
    };
  }

  async searchEmployee(criteria: EmployeeSearchCriteria): Promise<EmployeeSummary[]> {
    await this.employeeListPage.navigate();
    await this.employeeListPage.waitForReady();

    const searchQuery = this.resolveSearchQuery(criteria);
    if (searchQuery.length > 0) {
      await this.employeeListPage.searchEmployee(searchQuery);
    }

    const rowCount = await this.employeeListPage.getEmployeeCount();
    const employees: EmployeeSummary[] = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const employeeId =
        (await this.safeCellText(rowIndex, 0)) || criteria.employeeId || `employee-${rowIndex + 1}`;
      const firstAndMiddleName = await this.safeCellText(rowIndex, 1);
      const lastName = await this.safeCellText(rowIndex, 2);
      const jobTitle = (await this.safeCellText(rowIndex, 4)) || criteria.jobTitle || 'Unknown';
      const fullName =
        `${firstAndMiddleName} ${lastName}`.trim() ||
        criteria.nameQuery ||
        `Employee ${rowIndex + 1}`;

      employees.push({
        id: employeeId,
        fullName,
        jobTitle,
        department: criteria.department ?? Department.OPERATIONS,
        employmentStatus: criteria.employmentStatus ?? EmploymentStatus.ACTIVE,
      });
    }

    return employees;
  }

  async getEmployeeDetails(id: string): Promise<Employee | null> {
    const results = await this.searchEmployee({ employeeId: id });
    if (results.length === 0) {
      return null;
    }

    await this.openEmployeeRecord(id);

    const summary = results[0];
    const [firstName, ...rest] = summary.fullName.split(' ').filter(Boolean);
    const lastName = rest.length > 0 ? rest[rest.length - 1] : 'Employee';
    const middleName = rest.length > 1 ? rest.slice(0, -1).join(' ') : undefined;

    return {
      id: summary.id,
      employeeId: summary.id,
      firstName: firstName ?? 'Employee',
      middleName,
      lastName,
      email: this.defaultEmailFor(summary.id),
      department: summary.department,
      jobTitle: summary.jobTitle,
      employmentStatus: summary.employmentStatus,
      hireDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async terminateEmployee(id: string): Promise<Employee> {
    const employee = await this.getEmployeeDetails(id);
    if (!employee) {
      throw new Error(`Employee with id ${id} was not found.`);
    }

    await this.openEmployeeRecord(id);
    await this.employeeDetailsPage.viewJobInformation();
    await this.waitForOperationCompletion(
      async () => this.employeeDetailsPage.isReady(),
      'Employee termination context could not be loaded.'
    );

    const canTerminate = await this.employeeDetailsPage.hasTerminateButton();
    if (!canTerminate) {
      throw new Error(`Termination not available for employee ${id}.`);
    }

    await this.employeeDetailsPage.terminateEmployment();

    return {
      ...employee,
      employmentStatus: EmploymentStatus.TERMINATED,
      terminationDate: new Date(),
      updatedAt: new Date(),
    };
  }

  private async openEmployeeRecord(id: string): Promise<void> {
    await this.employeeListPage.navigate();
    await this.employeeListPage.waitForReady();
    await this.employeeListPage.searchEmployee(id);

    const rowCount = await this.employeeListPage.getEmployeeCount();
    if (rowCount === 0) {
      throw new Error(`Employee with id ${id} was not found.`);
    }

    await this.employeeListPage.navigateToEmployee(id);
    await this.employeeDetailsPage.waitForReady();
  }

  private resolveSearchQuery(criteria: EmployeeSearchCriteria): string {
    return (
      criteria.employeeId ?? criteria.nameQuery ?? criteria.jobTitle ?? criteria.supervisorId ?? ''
    );
  }

  private composeFullName(firstName: string, lastName: string, middleName?: string): string {
    return [firstName, middleName, lastName].filter(Boolean).join(' ');
  }

  private defaultEmailFor(employeeId: string): string {
    const normalized = employeeId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${normalized || 'employee'}@example.com`;
  }

  private generateEmployeeId(): string {
    return `${Date.now()}`;
  }

  private async safeCellText(rowIndex: number, columnIndex: number): Promise<string> {
    try {
      const value = await this.employeeListPage.getCellText(rowIndex, columnIndex);
      return value.trim();
    } catch {
      return '';
    }
  }

  private async waitForOperationCompletion(
    predicate: () => Promise<boolean>,
    errorMessage: string,
    timeoutMs: number = DEFAULT_TIMEOUT_MS
  ): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await predicate()) {
        return;
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, POLL_INTERVAL_MS);
      });
    }

    throw new Error(errorMessage);
  }
}
