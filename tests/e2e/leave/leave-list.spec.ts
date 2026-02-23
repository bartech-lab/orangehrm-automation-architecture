import { test, expect } from '../../../infra/test-runner/index.js';
import { LeaveDomain } from '../../../domain/leave-domain.js';

test.describe('Leave - Leave List', () => {
  test('should view all leave requests', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const leaveList = await leaveDomain.viewAllLeaveRequests();

    expect(leaveList.hasResultsTable).toBe(true);
    expect(leaveList.searchCompleted).toBe(true);
  });

  test('should filter by status', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const leaveList = await leaveDomain.filterLeaveRequestsByStatus('Pending');

    expect(leaveList.hasResultsTable).toBe(true);
    expect(leaveList.searchCompleted).toBe(true);
  });

  test('should filter by leave type', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const leaveList = await leaveDomain.filterLeaveRequestsByType('Vacation');

    expect(leaveList.hasResultsTable).toBe(true);
    expect(leaveList.searchCompleted).toBe(true);
  });

  test('should search by employee', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const leaveList = await leaveDomain.searchLeaveRequestsByEmployee('Admin');

    expect(leaveList.hasResultsTable).toBe(true);
    expect(leaveList.searchCompleted).toBe(true);
  });
});
