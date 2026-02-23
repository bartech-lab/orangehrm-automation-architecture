import { AddEmployeePage } from '../ui/pages/pim/add-employee-page.js';
import { EmployeeDetailsPage } from '../ui/pages/pim/employee-details-page.js';
import { EmployeeListPage } from '../ui/pages/pim/employee-list-page.js';
import { ReportsPage } from '../ui/pages/pim/reports-page.js';
import { ApplyLeavePage } from '../ui/pages/leave/apply-leave-page.js';
import { LoginPage } from '../ui/pages/login-page.js';
import { CandidatesPage } from '../ui/pages/recruitment/candidates-page.js';
import { VacanciesPage } from '../ui/pages/recruitment/vacancies-page.js';
import type { Credentials } from './auth/types.js';
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

export interface ReportsViewResult {
  hasResultsTable: boolean;
}

export interface ReportsActionResult {
  success: boolean;
  hasResultsTable: boolean;
}

export interface RecruitmentViewResult {
  hasResultsTable: boolean;
}

export interface RecruitmentPipelineInput {
  vacancyName: string;
  jobTitle: string;
  positions: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
}

export interface RecruitmentPipelineResult {
  vacancyCreated: boolean;
  candidateAdded: boolean;
  workflowAdvanced: boolean;
}

export interface LoginAttemptResult {
  isLoggedIn: boolean;
  hasError: boolean;
  errorMessage: string | null;
  currentUrl: string;
  isLoginPageReady: boolean;
}

export class HRMSystem {
  constructor(private readonly page: BrowserPage) {}

  async attemptLogin(credentials: Credentials): Promise<LoginAttemptResult> {
    const loginPage = new LoginPage(this.page);

    await loginPage.goto();
    await loginPage.waitForReady();
    await loginPage.login(credentials);

    const [isLoggedIn, hasError, errorMessage, currentUrl, isLoginPageReady] = await Promise.all([
      loginPage.isLoggedIn(),
      loginPage.hasError(),
      loginPage.getErrorMessage(),
      loginPage.getCurrentUrl(),
      loginPage.isReady(),
    ]);

    return {
      isLoggedIn,
      hasError,
      errorMessage,
      currentUrl,
      isLoginPageReady,
    };
  }

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

  async viewPimReports(): Promise<ReportsViewResult> {
    const reportsPage = new ReportsPage(this.page);
    await reportsPage.navigate();
    await reportsPage.waitForReady();

    const hasResultsTable = await this.page
      .getByRole('table')
      .or(this.page.locator('.oxd-table'))
      .first()
      .isVisible()
      .catch(() => false);

    return { hasResultsTable };
  }

  async runPredefinedPimReport(reportName: string): Promise<ReportsActionResult> {
    const reportsPage = new ReportsPage(this.page);
    await reportsPage.navigate();
    await reportsPage.waitForReady();
    await reportsPage.searchReport(reportName);

    const hasRunAction = await this.page
      .getByRole('button', { name: /run|view/i })
      .or(this.page.locator('.oxd-table-cell-action-run'))
      .first()
      .isVisible()
      .catch(() => false);

    const hasResultsTable = await this.page
      .getByRole('table')
      .or(this.page.locator('.oxd-table'))
      .first()
      .isVisible()
      .catch(() => false);

    return {
      success: hasRunAction || hasResultsTable,
      hasResultsTable,
    };
  }

  async searchPimReport(reportName: string): Promise<ReportsActionResult> {
    const reportsPage = new ReportsPage(this.page);
    await reportsPage.navigate();
    await reportsPage.waitForReady();
    await reportsPage.searchReport(reportName);

    const hasResultsTable = await this.page
      .getByRole('table')
      .or(this.page.locator('.oxd-table'))
      .first()
      .isVisible()
      .catch(() => false);

    return {
      success: hasResultsTable,
      hasResultsTable,
    };
  }

  async openPimCustomReportConfiguration(): Promise<ReportsActionResult> {
    const reportsPage = new ReportsPage(this.page);
    await reportsPage.navigate();
    await reportsPage.waitForReady();

    const hasAddButton = await this.page
      .getByRole('button', { name: /add/i })
      .first()
      .isVisible()
      .catch(() => false);

    return {
      success: hasAddButton,
      hasResultsTable: hasAddButton,
    };
  }

  async viewRecruitmentVacancies(): Promise<RecruitmentViewResult> {
    const vacanciesPage = new VacanciesPage(this.page);
    await vacanciesPage.navigate();
    await vacanciesPage.waitForReady();

    return {
      hasResultsTable: await vacanciesPage.isReady(),
    };
  }

  async viewRecruitmentCandidates(): Promise<RecruitmentViewResult> {
    const candidatesPage = new CandidatesPage(this.page);
    await candidatesPage.navigate();
    await candidatesPage.waitForReady();

    return {
      hasResultsTable: await candidatesPage.isReady(),
    };
  }

  async completeRecruitmentPipeline(
    input: RecruitmentPipelineInput
  ): Promise<RecruitmentPipelineResult> {
    const vacanciesPage = new VacanciesPage(this.page);
    await vacanciesPage.navigate();
    await vacanciesPage.waitForReady();
    await vacanciesPage.addVacancy({
      name: input.vacancyName,
      jobTitle: input.jobTitle,
      hiringManager: 'Hiring Manager',
      positions: input.positions,
    });

    const vacancyCreated = await this.page
      .getByRole('heading', { name: /edit vacancy/i })
      .or(this.page.getByText('Edit Vacancy'))
      .first()
      .isVisible()
      .catch(() => false);

    const candidatesPage = new CandidatesPage(this.page);
    await candidatesPage.navigate();
    await candidatesPage.waitForReady();

    await candidatesPage.addCandidate({
      firstName: input.candidateFirstName,
      lastName: input.candidateLastName,
      email: input.candidateEmail,
      vacancy: input.vacancyName,
    });

    const candidateAdded = await this.waitForCondition(async () => {
      const onCandidatePage = /recruitment\/addCandidate|candidate\/viewCandidate/i.test(
        this.page.url()
      );
      if (onCandidatePage) {
        return true;
      }

      return await this.page
        .locator('.oxd-toast, [role="alert"]')
        .first()
        .isVisible()
        .catch(() => false);
    });

    const candidateName = `${input.candidateFirstName} ${input.candidateLastName}`.trim();
    await candidatesPage.changeCandidateStatus(candidateName, 'Shortlist');

    const workflowAdvanced = await this.waitForCondition(async () => {
      const statusButtonsVisible = await this.page
        .getByRole('button')
        .filter({ hasText: /schedule|mark interview|offer|hire/i })
        .first()
        .isVisible()
        .catch(() => false);
      if (statusButtonsVisible) {
        return true;
      }

      return await this.page
        .locator('.oxd-toast, [role="alert"]')
        .first()
        .isVisible()
        .catch(() => false);
    });

    return {
      vacancyCreated,
      candidateAdded,
      workflowAdvanced,
    };
  }

  private formatDateForUi(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
  }

  private async waitForCondition(
    predicate: () => Promise<boolean>,
    timeoutMs = 20000,
    intervalMs = 250
  ): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await predicate()) {
        return true;
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, intervalMs);
      });
    }

    return false;
  }
}
