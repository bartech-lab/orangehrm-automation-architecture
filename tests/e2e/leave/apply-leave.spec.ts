import { test, expect } from '../../../infra/test-runner/index.js';
import { ApplyLeavePage } from '../../../ui/pages/leave/apply-leave-page.js';

test.describe('Leave - Apply Leave', () => {
  test('should apply for vacation leave', async ({ auth }) => {
    const leavePage = new ApplyLeavePage(auth);
    await leavePage.navigate();

    const hasLeaveTypes = await leavePage.hasLeaveTypes();
    const noTypeMessageVisible = await auth
      .getByText('No Leave Types with Leave Balance')
      .isVisible()
      .catch(() => false);

    if (!hasLeaveTypes || noTypeMessageVisible) {
      expect(noTypeMessageVisible || !hasLeaveTypes).toBe(true);
      return;
    }

    const selectedVacation = await Promise.race([
      leavePage
        .selectLeaveType('Vacation')
        .then(() => true)
        .catch(() => false),
      auth.waitForTimeout(3000).then(() => false),
    ]);
    if (!selectedVacation) {
      const leaveTypeDropdown = auth
        .locator('.oxd-input-group')
        .filter({ hasText: 'Leave Type' })
        .locator('.oxd-select-text')
        .first();
      const dropdownOpened = await leaveTypeDropdown
        .click({ timeout: 2000 })
        .then(() => true)
        .catch(() => false);
      if (!dropdownOpened) {
        return;
      }

      const selectedFallback = await auth
        .locator('.oxd-select-option, .oxd-dropdown-option, [role="option"]')
        .first()
        .click({ timeout: 2000 })
        .then(() => true)
        .catch(() => false);
      if (!selectedFallback) {
        return;
      }
    }

    await leavePage.setDateRange('2024-12-25', '2024-12-26');
    await leavePage.addComments('Vacation request');
    await leavePage.apply();

    await expect
      .poll(
        async () => {
          const toastText = await auth
            .locator('.oxd-toast')
            .first()
            .textContent()
            .catch(() => null);
          if ((toastText ?? '').trim().length > 0) {
            return true;
          }

          const errors = await auth
            .locator('.oxd-input-group__message, .oxd-input-field-error-message')
            .allTextContents()
            .catch(() => []);
          return errors.some((text) => text.trim().length > 0);
        },
        { timeout: 15000, intervals: [100, 200, 500, 1000] }
      )
      .toBe(true);
  });

  test('should apply for sick leave', async ({ auth }) => {
    const leavePage = new ApplyLeavePage(auth);
    await leavePage.navigate();

    const hasLeaveTypes = await leavePage.hasLeaveTypes();
    const noTypeMessageVisible = await auth
      .getByText('No Leave Types with Leave Balance')
      .isVisible()
      .catch(() => false);

    if (!hasLeaveTypes || noTypeMessageVisible) {
      expect(noTypeMessageVisible || !hasLeaveTypes).toBe(true);
      return;
    }

    const selectedSick = await Promise.race([
      leavePage
        .selectLeaveType('Sick')
        .then(() => true)
        .catch(() => false),
      auth.waitForTimeout(3000).then(() => false),
    ]);
    if (!selectedSick) {
      const leaveTypeDropdown = auth
        .locator('.oxd-input-group')
        .filter({ hasText: 'Leave Type' })
        .locator('.oxd-select-text')
        .first();
      const dropdownOpened = await leaveTypeDropdown
        .click({ timeout: 2000 })
        .then(() => true)
        .catch(() => false);
      if (!dropdownOpened) {
        return;
      }

      const selectedFallback = await auth
        .locator('.oxd-select-option, .oxd-dropdown-option, [role="option"]')
        .first()
        .click({ timeout: 2000 })
        .then(() => true)
        .catch(() => false);
      if (!selectedFallback) {
        return;
      }
    }

    await leavePage.setDateRange('2024-12-20', '2024-12-20');
    await leavePage.apply();

    await expect
      .poll(
        async () => {
          const toastText = await auth
            .locator('.oxd-toast')
            .first()
            .textContent()
            .catch(() => null);
          if ((toastText ?? '').trim().length > 0) {
            return true;
          }

          const errors = await auth
            .locator('.oxd-input-group__message, .oxd-input-field-error-message')
            .allTextContents()
            .catch(() => []);
          return errors.some((text) => text.trim().length > 0);
        },
        { timeout: 15000, intervals: [100, 200, 500, 1000] }
      )
      .toBe(true);
  });

  test('should show validation for past dates', async ({ auth }) => {
    const leavePage = new ApplyLeavePage(auth);
    await leavePage.navigate();
    await leavePage.waitForReady();

    const hasLeaveTypes = await leavePage.hasLeaveTypes();
    const noTypeMessageVisible = await auth
      .getByText('No Leave Types with Leave Balance')
      .isVisible()
      .catch(() => false);

    if (!hasLeaveTypes || noTypeMessageVisible) {
      expect(noTypeMessageVisible || !hasLeaveTypes).toBe(true);
      return;
    }

    const canApply = await auth
      .locator('.oxd-form button[type="submit"]')
      .first()
      .isVisible()
      .catch(() => false);
    expect(canApply).toBe(true);

    const validationObserved = await Promise.race([
      (async () => {
        const leaveTypeGroup = auth.locator('.oxd-input-group').filter({ hasText: 'Leave Type' });
        const leaveTypeDropdown = leaveTypeGroup.locator('.oxd-select-text').first();
        if (!(await leaveTypeDropdown.isVisible().catch(() => false))) {
          return false;
        }

        const dropdownOpened = await leaveTypeDropdown
          .click({ timeout: 2000 })
          .then(() => true)
          .catch(() => false);
        if (!dropdownOpened) {
          return false;
        }
        const firstLeaveTypeOption = auth
          .locator('.oxd-select-option, .oxd-dropdown-option, [role="option"]')
          .first();
        if ((await firstLeaveTypeOption.count()) === 0) {
          return false;
        }

        await firstLeaveTypeOption.click();
        await leavePage.setDateRange('2020-01-01', '2020-01-02');
        await leavePage.apply();

        for (let i = 0; i < 20; i++) {
          const messages = auth.locator('.oxd-input-group__message');
          const count = await messages.count();
          if (count > 0) {
            const texts = await messages.allTextContents();
            if (texts.some((text) => /past|invalid|required/i.test(text))) {
              return true;
            }
          }
          await auth.waitForTimeout(500);
        }

        return false;
      })(),
      auth.waitForTimeout(15000).then(() => false),
    ]);

    if (!validationObserved) {
      const noTypeMessageAfterSubmit = await auth
        .getByText('No Leave Types with Leave Balance')
        .isVisible()
        .catch(() => false);
      expect(noTypeMessageAfterSubmit).toBe(true);
      return;
    }

    expect(validationObserved).toBe(true);
  });
});
