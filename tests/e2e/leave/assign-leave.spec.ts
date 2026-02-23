import { test, expect } from '../../../infra/test-runner/index.js';
import { LeaveDomain } from '../../../domain/leave-domain.js';

test.describe('Leave - Assign Leave', () => {
  test('should assign vacation to employee', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const assignForm = await leaveDomain.openAssignLeaveForm();

    expect(assignForm.isReady).toBe(true);
    expect(assignForm.canAssign).toBe(true);
  });

  test('should assign sick leave', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const assignForm = await leaveDomain.openAssignLeaveForm();

    expect(assignForm.isReady).toBe(true);
    expect(assignForm.canSearchEmployees).toBe(true);
  });

  test('should validate required fields', async ({ auth }) => {
    const leaveDomain = new LeaveDomain(auth);
    const validation = await leaveDomain.validateAssignRequiredFields();

    expect(validation.hasValidationErrors).toBe(true);
  });
});
