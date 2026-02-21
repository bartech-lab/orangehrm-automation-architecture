import { AddEmployeePage } from '../ui/pages/pim/add-employee-page.js';
import { EmployeeDetailsPage } from '../ui/pages/pim/employee-details-page.js';
import { EmployeeListPage } from '../ui/pages/pim/employee-list-page.js';
import { ApplyLeavePage } from '../ui/pages/leave/apply-leave-page.js';
import { LeaveRequestCalculator, LeaveType } from './leave/index.js';

type BrowserPage = ConstructorParameters<typeof AddEmployeePage>[0];

export interface HireEmployeeInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  employeeId?: string;
}

export interface HireEmployeeResult {
  status: 'created' | 'submitted';
  fullName: string;
  employeeId?: string;
  visibleInEmployeeDirectory: boolean;
}

export interface TerminateEmployeeResult {
  status: 'terminated' | 'not_found' | 'not_available';
  employeeReference: string;
}

export interface LeaveRequester {
  username: string;
}

export interface LeaveDates {
  from: Date;
  to: Date;
  leaveType: LeaveType;
  reason?: string;
}

export interface LeaveRequestResult {
  status: 'submitted' | 'no_leave_balance';
  requester: string;
  leaveType: LeaveType;
  requestedDays: number;
}

export class HRMSystem {
  constructor(private readonly page: BrowserPage) {}

  async hireEmployee(data: HireEmployeeInput): Promise<HireEmployeeResult> {
    const addEmployeePage = new AddEmployeePage(this.page);

    await addEmployeePage.navigate();
    await addEmployeePage.waitForReady();
    await addEmployeePage.fillEmployeeDetails(data);
    await addEmployeePage.save();

    const employeeListPage = new EmployeeListPage(this.page);
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    await employeeListPage.navigate();
    await employeeListPage.waitForReady();
    await employeeListPage.searchEmployee(fullName);
    const visibleInEmployeeDirectory = (await employeeListPage.getEmployeeCount()) > 0;

    return {
      status: visibleInEmployeeDirectory ? 'created' : 'submitted',
      fullName,
      employeeId: data.employeeId,
      visibleInEmployeeDirectory,
    };
  }

  async terminateEmployee(employeeReference: string): Promise<TerminateEmployeeResult> {
    const employeeListPage = new EmployeeListPage(this.page);

    await employeeListPage.navigate();
    await employeeListPage.waitForReady();
    await employeeListPage.searchEmployee(employeeReference);

    if ((await employeeListPage.getEmployeeCount()) === 0) {
      return {
        status: 'not_found',
        employeeReference,
      };
    }

    await employeeListPage.navigateToEmployee(employeeReference);

    const employeeDetailsPage = new EmployeeDetailsPage(this.page);
    await employeeDetailsPage.waitForReady();
    await employeeDetailsPage.navigateToTab('Job');

    const canTerminate = await employeeDetailsPage.hasTerminateButton();
    if (!canTerminate) {
      return {
        status: 'not_available',
        employeeReference,
      };
    }

    await employeeDetailsPage.terminateEmployment();

    return {
      status: 'terminated',
      employeeReference,
    };
  }

  async requestLeave(user: LeaveRequester, dates: LeaveDates): Promise<LeaveRequestResult> {
    const applyLeavePage = new ApplyLeavePage(this.page);

    await applyLeavePage.navigate();
    await applyLeavePage.waitForReady();

    const hasLeaveTypes = await applyLeavePage.hasLeaveTypes();
    if (!hasLeaveTypes) {
      return {
        status: 'no_leave_balance',
        requester: user.username,
        leaveType: dates.leaveType,
        requestedDays: 0,
      };
    }

    await applyLeavePage.selectLeaveType(dates.leaveType);
    await applyLeavePage.setDateRange(
      this.formatDateForUi(dates.from),
      this.formatDateForUi(dates.to)
    );
    if (dates.reason) {
      await applyLeavePage.addComments(dates.reason);
    }
    await applyLeavePage.apply();

    return {
      status: 'submitted',
      requester: user.username,
      leaveType: dates.leaveType,
      requestedDays: LeaveRequestCalculator.calculateDuration(dates.from, dates.to),
    };
  }

  private formatDateForUi(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
  }
}
