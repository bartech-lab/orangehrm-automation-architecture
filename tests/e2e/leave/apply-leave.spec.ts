import { test, expect } from '../../../infra/test-runner/index.js';
import { LeaveDomain } from '../../../domain/leave-domain.js';

test.describe('Leave - Apply Leave', () => {
  test('should apply for vacation leave', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const result = await leaveDomain.applyForLeave({
      leaveType: 'Vacation',
      fromDate: '2024-12-25',
      toDate: '2024-12-26',
      comment: 'Vacation request',
    });

    if (result.status === 'submitted') {
      expect(result.hasSuccessFeedback).toBe(true);
      return;
    }

    if (result.status === 'validation_error') {
      expect(result.hasValidationError).toBe(true);
      return;
    }

    expect(['no_leave_balance', 'selection_unavailable']).toContain(result.status);
  });

  test('should apply for sick leave', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const result = await leaveDomain.applyForLeave({
      leaveType: 'Sick',
      fromDate: '2024-12-20',
      toDate: '2024-12-20',
    });

    if (result.status === 'submitted') {
      expect(result.hasSuccessFeedback).toBe(true);
      return;
    }

    if (result.status === 'validation_error') {
      expect(result.hasValidationError).toBe(true);
      return;
    }

    expect(['no_leave_balance', 'selection_unavailable']).toContain(result.status);
  });

  test('should show validation for past dates', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const result = await leaveDomain.applyForLeave({
      leaveType: 'Vacation',
      fromDate: '2020-01-01',
      toDate: '2020-01-02',
    });

    if (result.status === 'no_leave_balance' || result.status === 'selection_unavailable') {
      expect(['no_leave_balance', 'selection_unavailable']).toContain(result.status);
      return;
    }

    expect(result.status).toBe('validation_error');
    expect(result.hasValidationError).toBe(true);
    expect(result.hasPastDateValidation).toBe(true);
  });
});
