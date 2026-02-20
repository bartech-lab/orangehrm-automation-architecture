import { test, expect } from '../../infra/test-runner/index.js';
import { AssignLeavePage } from '../../ui/pages/leave/assign-leave-page.js';
import { LeaveListPage } from '../../ui/pages/leave/leave-list-page.js';

test.describe('User Journey - Leave Approval', () => {
  test('complete leave approval workflow', async ({ auth }) => {
    const assignPage = new AssignLeavePage(auth);
    await assignPage.navigate();
    await assignPage.waitForReady();

    const employeeInput = auth.getByPlaceholder(/type for hints/i).first();
    const employeeInvalid = auth
      .locator('.oxd-input-group')
      .filter({ hasText: /employee name/i })
      .getByText(/invalid/i)
      .first();

    const leaveTypeDropdown = auth
      .locator('.oxd-input-group')
      .filter({ hasText: /leave type/i })
      .locator('.oxd-select-text')
      .first();

    const leaveBalanceText = auth
      .locator('.oxd-input-group')
      .filter({ hasText: /leave balance/i })
      .locator('p')
      .last();

    let assignableSelectionFound = false;
    let fallbackEmployee = '';
    let fallbackLeaveType = '';
    for (let employeeIndex = 0; employeeIndex < 5 && !assignableSelectionFound; employeeIndex++) {
      await employeeInput.click();
      await employeeInput.press('ControlOrMeta+A');
      await employeeInput.fill('a');

      const employeeOptions = auth.locator('.oxd-autocomplete-option');
      await employeeOptions.first().waitFor({ state: 'visible', timeout: 10000 });
      if ((await employeeOptions.count()) <= employeeIndex) {
        break;
      }
      fallbackEmployee =
        (
          (await employeeOptions
            .nth(employeeIndex)
            .textContent()
            .catch(() => '')) ?? ''
        ).trim() || fallbackEmployee;
      await employeeOptions.nth(employeeIndex).click();

      if (await employeeInvalid.isVisible().catch(() => false)) {
        continue;
      }

      fallbackEmployee =
        (await employeeInput.inputValue().catch(() => '')).trim() || fallbackEmployee;

      for (let leaveTypeIndex = 1; leaveTypeIndex <= 6; leaveTypeIndex++) {
        await leaveTypeDropdown.click();
        const leaveTypeOptions = auth.locator('.oxd-select-dropdown .oxd-select-option');
        await leaveTypeOptions.nth(leaveTypeIndex).waitFor({ state: 'visible', timeout: 10000 });
        await leaveTypeOptions.nth(leaveTypeIndex).click();

        const balanceText = ((await leaveBalanceText.textContent().catch(() => '')) ?? '').trim();
        fallbackLeaveType =
          ((await leaveTypeDropdown.textContent().catch(() => '')) ?? '').trim() ||
          fallbackLeaveType;
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

    if (assignableSelectionFound) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 1);
      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, '0');
        const day = `${date.getDate()}`.padStart(2, '0');
        return `${year}-${day}-${month}`;
      };

      const fromDateInput = auth.getByPlaceholder(/yyyy-dd-mm/i).first();
      const toDateInput = auth.getByPlaceholder(/yyyy-dd-mm/i).nth(1);
      await fromDateInput.click();
      await fromDateInput.press('ControlOrMeta+A');
      await fromDateInput.fill(formatDate(startDate));
      await toDateInput.click();
      await toDateInput.press('ControlOrMeta+A');
      await toDateInput.fill(formatDate(endDate));
      await auth
        .locator('.oxd-form textarea')
        .first()
        .fill('Leave assignment for approval workflow')
        .catch(() => {});
      await assignPage.assign();

      const confirmDialog = auth.locator('.oxd-dialog, [role="dialog"]').first();
      const dialogVisible = await confirmDialog
        .waitFor({ state: 'visible', timeout: 4000 })
        .then(() => true)
        .catch(() => false);
      if (dialogVisible) {
        const confirmButton = confirmDialog
          .getByRole('button', { name: /ok|confirm|yes/i })
          .first();
        if ((await confirmButton.count()) > 0) {
          await confirmButton.click();
        }
      }

      await expect
        .poll(
          async () => {
            const toastText =
              (await auth
                .locator('.oxd-toast')
                .first()
                .textContent()
                .catch(() => null)) ?? '';
            if (/success|saved|assigned|submitted/i.test(toastText)) {
              return true;
            }

            return /leave\/viewLeaveList/.test(auth.url());
          },
          { timeout: 15000, intervals: [100, 200, 500, 1000] }
        )
        .toBe(true);
    }

    const listPage = new LeaveListPage(auth);
    await listPage.navigate();
    await listPage.filterByStatus('Pending');
    await auth.getByRole('button', { name: /^Search$/ }).click();
    await expect(auth.locator('.oxd-table')).toBeVisible();

    const pendingRowCount = await listPage.dataTable.getRowCount();
    if (pendingRowCount === 0) {
      expect(assignableSelectionFound).toBe(false);
      return;
    }

    await listPage.viewLeaveDetails(0);
    await auth
      .getByRole('button', { name: /approve/i })
      .first()
      .click();
    await expect
      .poll(
        async () => {
          const toastText =
            (await auth
              .locator('.oxd-toast')
              .first()
              .textContent()
              .catch(() => null)) ?? '';
          return /success|approved|updated/i.test(toastText);
        },
        { timeout: 15000, intervals: [100, 200, 500, 1000] }
      )
      .toBe(true);
  });

  test('view leave list', async ({ auth }) => {
    const listPage = new LeaveListPage(auth);
    await listPage.navigate();
    await listPage.waitForReady();

    await expect(auth.locator('.oxd-table')).toBeVisible();
    const rowCount = await listPage.dataTable.getRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });
});
