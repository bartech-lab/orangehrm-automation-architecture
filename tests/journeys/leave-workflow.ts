import { Employee } from '../../domain/employee/types.js';
import { LeaveRequest } from '../../domain/leave/types.js';
import { ApplyLeavePage } from '../../ui/pages/leave/apply-leave-page.js';
import { LeaveListPage } from '../../ui/pages/leave/leave-list-page.js';
import { Page } from '@playwright/test';

export async function submitLeaveRequest(
  page: Page,
  _employee: Employee,
  leaveRequest: LeaveRequest
): Promise<void> {
  const applyPage = new ApplyLeavePage(page);
  await applyPage.navigate();
  await applyPage.selectLeaveType(leaveRequest.leaveType);
  await applyPage.setDateRange(
    leaveRequest.startDate.toISOString().split('T')[0],
    leaveRequest.endDate.toISOString().split('T')[0]
  );
  await applyPage.addComments(leaveRequest.reason || '');
  await applyPage.apply();
}

export async function approveLeaveRequest(page: Page, _requestId: string): Promise<void> {
  const leaveList = new LeaveListPage(page);
  await leaveList.navigate();
  await leaveList.filterByStatus('Pending');
  await leaveList.viewLeaveDetails(0);
  await page.click('.oxd-button:has-text("Approve")');
}

export async function rejectLeaveRequest(
  page: Page,
  _requestId: string,
  reason: string
): Promise<void> {
  const leaveList = new LeaveListPage(page);
  await leaveList.navigate();
  await leaveList.filterByStatus('Pending');
  await leaveList.viewLeaveDetails(0);
  await page.click('.oxd-button:has-text("Reject")');
  await page.fill('textarea[name="comment"]', reason);
  await page.click('.oxd-button:has-text("Confirm")');
}

export async function cancelLeaveRequest(page: Page, _requestId: string): Promise<void> {
  const leaveList = new LeaveListPage(page);
  await leaveList.navigate();
  await leaveList.viewLeaveDetails(0);
  await page.click('.oxd-button:has-text("Cancel")');
  await page.click('.oxd-button:has-text("Yes, Confirm")');
}
