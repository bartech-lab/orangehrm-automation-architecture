import { ApplyLeavePage } from '../ui/pages/leave/apply-leave-page.js';
import { AssignLeavePage } from '../ui/pages/leave/assign-leave-page.js';
import { LeaveListPage } from '../ui/pages/leave/leave-list-page.js';

type LeaveDomainPage = ConstructorParameters<typeof ApplyLeavePage>[0];

export interface ApplyLeaveRequestInput {
  leaveType: string;
  fromDate: string;
  toDate: string;
  comment?: string;
}

export interface ApplyLeaveAttemptResult {
  status: 'submitted' | 'validation_error' | 'no_leave_balance' | 'selection_unavailable';
  hasSuccessFeedback: boolean;
  hasValidationError: boolean;
  hasPastDateValidation: boolean;
}

export interface ApplyLeaveAvailability {
  isReady: boolean;
  hasLeaveTypes: boolean;
  noLeaveBalanceMessageVisible: boolean;
}

export interface AssignLeaveFormState {
  isReady: boolean;
  canAssign: boolean;
  canSearchEmployees: boolean;
}

export interface AssignLeaveValidationResult {
  hasValidationErrors: boolean;
}

export interface LeaveListResult {
  hasResultsTable: boolean;
  searchCompleted: boolean;
  resultCount: number;
}

export interface LeaveAssignmentAttemptResult {
  assigned: boolean;
}

export interface LeaveApprovalResult {
  approved: boolean;
}

const SHORT_TIMEOUT_MS = 3000;
const STANDARD_TIMEOUT_MS = 15000;
const POLL_INTERVAL_MS = 250;
const ASSIGN_WORKFLOW_BUDGET_MS = 6000;
const ASSIGN_EMPLOYEE_OPTION_WAIT_MS = 800;
const ASSIGN_LEAVE_TYPE_OPTION_WAIT_MS = 800;
const ASSIGN_SUBMIT_WAIT_MS = 4000;
const MAX_ASSIGN_EMPLOYEE_OPTIONS = 1;
const MAX_ASSIGN_LEAVE_TYPE_OPTIONS = 2;
const LEAVE_LIST_INTERACTION_TIMEOUT_MS = 1500;

export class LeaveDomain {
  private readonly applyLeavePage: ApplyLeavePage;
  private readonly assignLeavePage: AssignLeavePage;
  private readonly leaveListPage: LeaveListPage;

  constructor(private readonly page: LeaveDomainPage) {
    this.applyLeavePage = new ApplyLeavePage(page);
    this.assignLeavePage = new AssignLeavePage(page);
    this.leaveListPage = new LeaveListPage(page);
  }

  async openApplyLeaveForm(): Promise<ApplyLeaveAvailability> {
    await this.applyLeavePage.navigate();
    await this.applyLeavePage.waitForReady();

    const [isReady, hasLeaveTypes, noLeaveBalanceMessageVisible] = await Promise.all([
      this.applyLeavePage.isReady(),
      this.applyLeavePage.hasLeaveTypes(),
      this.page
        .getByText('No Leave Types with Leave Balance')
        .first()
        .isVisible()
        .catch(() => false),
    ]);

    return {
      isReady,
      hasLeaveTypes,
      noLeaveBalanceMessageVisible,
    };
  }

  async applyForLeave(input: ApplyLeaveRequestInput): Promise<ApplyLeaveAttemptResult> {
    const availability = await this.openApplyLeaveForm();
    if (!availability.hasLeaveTypes || availability.noLeaveBalanceMessageVisible) {
      return {
        status: 'no_leave_balance',
        hasSuccessFeedback: false,
        hasValidationError: false,
        hasPastDateValidation: false,
      };
    }

    const leaveTypeSelected = await this.trySelectLeaveType(input.leaveType);
    if (!leaveTypeSelected) {
      return {
        status: 'selection_unavailable',
        hasSuccessFeedback: false,
        hasValidationError: false,
        hasPastDateValidation: false,
      };
    }

    await this.applyLeavePage.setDateRange(input.fromDate, input.toDate);
    if (input.comment) {
      await this.applyLeavePage.addComments(input.comment);
    }
    await this.applyLeavePage.apply();

    const feedback = await this.waitForApplyFeedback();
    return {
      status: feedback.hasSuccessFeedback ? 'submitted' : 'validation_error',
      hasSuccessFeedback: feedback.hasSuccessFeedback,
      hasValidationError: feedback.hasValidationError,
      hasPastDateValidation: feedback.hasPastDateValidation,
    };
  }

  async openAssignLeaveForm(): Promise<AssignLeaveFormState> {
    await this.assignLeavePage.navigate();
    await this.assignLeavePage.waitForReady();

    const [isReady, canAssign, canSearchEmployees] = await Promise.all([
      this.assignLeavePage.isReady(),
      this.page
        .getByRole('button', { name: /assign/i })
        .first()
        .isVisible()
        .catch(() => false),
      this.page
        .getByPlaceholder(/type for hints/i)
        .first()
        .isVisible()
        .catch(() => false),
    ]);

    return {
      isReady,
      canAssign,
      canSearchEmployees,
    };
  }

  async validateAssignRequiredFields(): Promise<AssignLeaveValidationResult> {
    await this.assignLeavePage.navigate();
    await this.assignLeavePage.waitForReady();
    await this.assignLeavePage.assign();

    const hasValidationErrors = await this.waitForCondition(async () => {
      const messages = await this.page
        .locator('.oxd-input-group__message, .oxd-input-field-error-message')
        .allTextContents()
        .catch(() => []);
      return messages.some((text) => text.trim().length > 0);
    }, STANDARD_TIMEOUT_MS);

    return { hasValidationErrors };
  }

  async viewAllLeaveRequests(): Promise<LeaveListResult> {
    await this.leaveListPage.navigate();
    await this.leaveListPage.waitForReady();

    const resultCount = await this.leaveListPage.dataTable.getRowCount().catch(() => 0);
    const hasResultsTable = await this.leaveListPage.isReady();

    return {
      hasResultsTable,
      searchCompleted: hasResultsTable,
      resultCount,
    };
  }

  async filterLeaveRequestsByStatus(status: string): Promise<LeaveListResult> {
    if (!this.isOnLeaveListPage()) {
      await this.leaveListPage.navigate();
      await this.leaveListPage.waitForReady();
    }

    const statusDropdown = this.page
      .locator('.oxd-input-group')
      .filter({ hasText: /status/i })
      .locator('.oxd-select-text')
      .first();
    const opened = await statusDropdown
      .click({ timeout: LEAVE_LIST_INTERACTION_TIMEOUT_MS })
      .then(() => true)
      .catch(() => false);

    if (opened) {
      await this.page
        .getByRole('option', { name: new RegExp(status, 'i') })
        .first()
        .click({ timeout: LEAVE_LIST_INTERACTION_TIMEOUT_MS })
        .catch(() => {});
    }

    await this.page
      .getByRole('button', { name: /^Search$/ })
      .first()
      .click({ timeout: LEAVE_LIST_INTERACTION_TIMEOUT_MS })
      .catch(() => {});

    return await this.quickReadLeaveListResult();
  }

  async filterLeaveRequestsByType(type: string): Promise<LeaveListResult> {
    await this.leaveListPage.navigate();
    await this.leaveListPage.waitForReady();
    try {
      await this.leaveListPage.filterByType(type);
    } catch {
      const leaveTypeDropdown = this.page
        .locator('.oxd-input-group')
        .filter({ hasText: 'Leave Type' })
        .locator('.oxd-select-text')
        .first();
      const dropdownOpened = await leaveTypeDropdown.click({ timeout: SHORT_TIMEOUT_MS }).then(
        () => true,
        () => false
      );
      if (dropdownOpened) {
        await this.page
          .locator('.oxd-select-option, .oxd-dropdown-option, [role="option"]')
          .first()
          .click({ timeout: SHORT_TIMEOUT_MS })
          .catch(() => {});
      }
    }
    return await this.executeLeaveListSearch();
  }

  async searchLeaveRequestsByEmployee(name: string): Promise<LeaveListResult> {
    await this.leaveListPage.navigate();
    await this.leaveListPage.waitForReady();
    await this.leaveListPage.searchEmployee(name);
    return await this.executeLeaveListSearch();
  }

  async assignLeaveForApprovalWorkflow(comment: string): Promise<LeaveAssignmentAttemptResult> {
    await this.assignLeavePage.navigate();
    await this.assignLeavePage.waitForReady();

    const budgetDeadline = Date.now() + ASSIGN_WORKFLOW_BUDGET_MS;

    const noBalanceMessageVisible = await this.page
      .getByText(/No Leave Types with Leave Balance/i)
      .first()
      .isVisible()
      .catch(() => false);
    if (noBalanceMessageVisible) {
      return { assigned: false };
    }

    const employeeInput = this.page.getByPlaceholder(/type for hints/i).first();
    const employeeInvalid = this.page
      .locator('.oxd-input-group')
      .filter({ hasText: /employee name/i })
      .getByText(/invalid/i)
      .first();
    const leaveTypeDropdown = this.page
      .locator('.oxd-input-group')
      .filter({ hasText: /leave type/i })
      .locator('.oxd-select-text')
      .first();
    const leaveBalanceText = this.page
      .locator('.oxd-input-group')
      .filter({ hasText: /leave balance/i })
      .locator('p')
      .last();

    let assignableSelectionFound = false;
    const withinBudget = (): boolean => Date.now() < budgetDeadline;

    for (
      let employeeIndex = 0;
      employeeIndex < MAX_ASSIGN_EMPLOYEE_OPTIONS && !assignableSelectionFound && withinBudget();
      employeeIndex++
    ) {
      await employeeInput.click();
      await employeeInput.clear();
      await employeeInput.fill('a');

      const employeeOptions = this.page.locator('.oxd-autocomplete-option');
      const optionsVisible = await employeeOptions
        .first()
        .waitFor({ state: 'visible', timeout: ASSIGN_EMPLOYEE_OPTION_WAIT_MS })
        .then(() => true)
        .catch(() => false);
      if (!optionsVisible) {
        return { assigned: false };
      }

      const employeeOptionCount = await employeeOptions.count().catch(() => 0);
      if (employeeOptionCount <= employeeIndex) {
        break;
      }
      await employeeOptions.nth(employeeIndex).click();

      if (await employeeInvalid.isVisible().catch(() => false)) {
        continue;
      }

      for (
        let leaveTypeIndex = 1;
        leaveTypeIndex <= MAX_ASSIGN_LEAVE_TYPE_OPTIONS && withinBudget();
        leaveTypeIndex++
      ) {
        await leaveTypeDropdown.click();
        const leaveTypeOptions = this.page.locator('.oxd-select-dropdown .oxd-select-option');
        const leaveTypeVisible = await leaveTypeOptions
          .nth(leaveTypeIndex)
          .waitFor({ state: 'visible', timeout: ASSIGN_LEAVE_TYPE_OPTION_WAIT_MS })
          .then(() => true)
          .catch(() => false);
        if (!leaveTypeVisible) {
          break;
        }
        await leaveTypeOptions.nth(leaveTypeIndex).click();

        const balanceText = ((await leaveBalanceText.textContent().catch(() => '')) ?? '').trim();
        if (/not sufficient/i.test(balanceText)) {
          continue;
        }

        const numericBalance = Number.parseFloat(balanceText.replace(/[^0-9.]/g, ''));
        if (!Number.isFinite(numericBalance) || numericBalance <= 0) {
          continue;
        }

        assignableSelectionFound = true;
        break;
      }
    }

    if (!assignableSelectionFound || !withinBudget()) {
      return { assigned: false };
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    const fromDateInput = this.page.getByPlaceholder(/yyyy-dd-mm/i).first();
    const toDateInput = this.page.getByPlaceholder(/yyyy-dd-mm/i).nth(1);
    await fromDateInput.click();
    await fromDateInput.clear();
    await fromDateInput.fill(this.formatAssignDate(startDate));
    await toDateInput.click();
    await toDateInput.clear();
    await toDateInput.fill(this.formatAssignDate(endDate));

    await this.page
      .locator('.oxd-form textarea')
      .first()
      .fill(comment)
      .catch(() => {});
    await this.assignLeavePage.assign();

    const confirmDialog = this.page.locator('.oxd-dialog, [role="dialog"]').first();
    const remainingBudgetMs = Math.max(1, budgetDeadline - Date.now());
    const dialogVisible = await confirmDialog
      .waitFor({ state: 'visible', timeout: Math.min(3000, remainingBudgetMs) })
      .then(() => true)
      .catch(() => false);
    if (dialogVisible) {
      const confirmButton = confirmDialog.getByRole('button', { name: /ok|confirm|yes/i }).first();
      if ((await confirmButton.count()) > 0) {
        await confirmButton.click();
      }
    }

    const assigned = await this.waitForCondition(
      async () => {
        const toastText =
          (await this.page
            .locator('.oxd-toast')
            .first()
            .textContent()
            .catch(() => null)) ?? '';
        if (/success|saved|assigned|submitted/i.test(toastText)) {
          return true;
        }

        return /leave\/viewLeaveList/.test(this.page.url());
      },
      Math.min(ASSIGN_SUBMIT_WAIT_MS, Math.max(1, budgetDeadline - Date.now()))
    );

    return { assigned };
  }

  async approveFirstPendingLeaveRequest(): Promise<LeaveApprovalResult> {
    if (!this.isOnLeaveListPage()) {
      await this.filterLeaveRequestsByStatus('Pending');
    }

    const pendingResult = await this.quickReadLeaveListResult();

    if (pendingResult.resultCount === 0) {
      return { approved: false };
    }

    await this.leaveListPage.viewLeaveDetails(0);
    await this.page
      .getByRole('button', { name: /approve/i })
      .first()
      .click();

    const approved = await this.waitForCondition(async () => {
      const toastText =
        (await this.page
          .locator('.oxd-toast')
          .first()
          .textContent()
          .catch(() => null)) ?? '';
      return /success|approved|updated/i.test(toastText);
    }, STANDARD_TIMEOUT_MS);

    return { approved };
  }

  private async executeLeaveListSearch(): Promise<LeaveListResult> {
    await this.leaveListPage.waitForReady();

    const [hasResultsTable, resultCount] = await Promise.all([
      this.leaveListPage.isReady(),
      this.leaveListPage.dataTable.getRowCount().catch(() => 0),
    ]);

    return {
      hasResultsTable,
      searchCompleted: hasResultsTable,
      resultCount,
    };
  }

  private isOnLeaveListPage(): boolean {
    return /leave\/viewLeaveList/i.test(this.page.url());
  }

  private async quickReadLeaveListResult(): Promise<LeaveListResult> {
    const hasResultsTable = await this.page
      .getByRole('table')
      .or(this.page.locator('.oxd-table'))
      .first()
      .isVisible()
      .catch(() => false);

    const noRecordsFound = await this.page
      .getByText(/No Records Found/i)
      .first()
      .isVisible()
      .catch(() => false);

    let resultCount = 0;
    if (!noRecordsFound) {
      const cardRows = await this.page
        .locator('.oxd-table-card')
        .count()
        .catch(() => 0);
      if (cardRows > 0) {
        resultCount = cardRows;
      } else {
        const semanticRows = await this.page
          .getByRole('row')
          .filter({ has: this.page.getByRole('cell') })
          .count()
          .catch(() => 0);
        resultCount = semanticRows;
      }
    }

    return {
      hasResultsTable,
      searchCompleted: hasResultsTable,
      resultCount,
    };
  }

  private async trySelectLeaveType(type: string): Promise<boolean> {
    try {
      await this.applyLeavePage.selectLeaveType(type);
      return true;
    } catch {
      const dropdown = this.page
        .locator('.oxd-input-group')
        .filter({ hasText: 'Leave Type' })
        .locator('.oxd-select-text')
        .first();

      const dropdownOpened = await dropdown.click({ timeout: SHORT_TIMEOUT_MS }).then(
        () => true,
        () => false
      );
      if (!dropdownOpened) {
        return false;
      }

      const fallbackSelected = await this.page
        .locator('.oxd-select-option, .oxd-dropdown-option, [role="option"]')
        .first()
        .click({ timeout: SHORT_TIMEOUT_MS })
        .then(
          () => true,
          () => false
        );

      return fallbackSelected;
    }
  }

  private async waitForApplyFeedback(): Promise<{
    hasSuccessFeedback: boolean;
    hasValidationError: boolean;
    hasPastDateValidation: boolean;
  }> {
    const completed = await this.waitForCondition(async () => {
      const [successText, errors] = await Promise.all([
        this.page
          .locator('.oxd-toast, [role="alert"]')
          .first()
          .textContent()
          .catch(() => null),
        this.page
          .locator('.oxd-input-group__message, .oxd-input-field-error-message')
          .allTextContents()
          .catch(() => []),
      ]);

      const hasSuccessFeedback = (successText ?? '').trim().length > 0;
      const hasValidationError = errors.some((text) => text.trim().length > 0);
      return hasSuccessFeedback || hasValidationError;
    }, STANDARD_TIMEOUT_MS);

    if (!completed) {
      return {
        hasSuccessFeedback: false,
        hasValidationError: false,
        hasPastDateValidation: false,
      };
    }

    const [successText, errors] = await Promise.all([
      this.page
        .locator('.oxd-toast, [role="alert"]')
        .first()
        .textContent()
        .catch(() => null),
      this.page
        .locator('.oxd-input-group__message, .oxd-input-field-error-message')
        .allTextContents()
        .catch(() => []),
    ]);

    const hasSuccessFeedback = (successText ?? '').trim().length > 0;
    const hasValidationError = errors.some((text) => text.trim().length > 0);
    const hasPastDateValidation = errors.some((text) => /past|invalid|required/i.test(text));

    return {
      hasSuccessFeedback,
      hasValidationError,
      hasPastDateValidation,
    };
  }

  private async waitForCondition(
    condition: () => Promise<boolean>,
    timeoutMs: number
  ): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await condition()) {
        return true;
      }

      await new Promise<void>((resolve) => {
        setTimeout(resolve, POLL_INTERVAL_MS);
      });
    }

    return false;
  }

  private formatAssignDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${day}-${month}`;
  }
}
