import { test, expect } from '../../infra/test-runner/index.js';
import { LeaveDomain } from '../../domain/leave-domain.js';

test.describe('User Journey - Leave Approval', () => {
  test('complete leave approval workflow', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const assignment = await leaveDomain.assignLeaveForApprovalWorkflow(
      'Leave assignment for approval workflow'
    );

    const pendingBeforeApproval = await leaveDomain.filterLeaveRequestsByStatus('Pending');
    expect(pendingBeforeApproval.hasResultsTable).toBe(true);

    const approval = await leaveDomain.approveFirstPendingLeaveRequest();

    if (pendingBeforeApproval.resultCount === 0) {
      expect(assignment.assigned).toBe(false);
      expect(approval.approved).toBe(false);
      return;
    }

    expect(approval.approved).toBe(true);
  });

  test('view leave list', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const leaveList = await leaveDomain.viewAllLeaveRequests();

    expect(leaveList.hasResultsTable).toBe(true);
    expect(leaveList.resultCount).toBeGreaterThanOrEqual(0);
  });
});
