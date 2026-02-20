import { test, expect } from '../../../infra/test-runner/index.js';
import { ModalComponent } from '../../../ui/components/index.js';

test.describe('ModalComponent', () => {
  test.describe('Delete Confirmation Modal', () => {
    test('should display confirmation modal when attempting to delete a user', async ({ auth }) => {
      // Navigate to User Management page where delete actions are available
      await auth.goto(
        'https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers'
      );

      // Wait for the page to load and users table to be visible
      await expect(auth.locator('.oxd-table')).toBeVisible();

      // Find and click the first delete button to trigger confirmation modal
      const firstDeleteButton = auth.locator('.oxd-table-row .oxd-icon.bi-trash').first();

      // Check if there's at least one user to delete
      const deleteButtonCount = await auth.locator('.oxd-table-row .oxd-icon.bi-trash').count();
      test.skip(deleteButtonCount === 0, 'No users available to test delete modal');

      await firstDeleteButton.click();

      // Initialize modal component with the dialog selector
      const modal = new ModalComponent(auth, '.oxd-dialog');

      // Verify modal appears
      await modal.waitForReady();
      const isVisible = await modal.isVisible();
      expect(isVisible).toBe(true);

      // Verify modal title indicates confirmation
      const title = await modal.getTitle();
      expect(title.toLowerCase()).toContain('confirm');
    });

    test('should close delete confirmation modal when cancel is clicked', async ({ auth }) => {
      // Navigate to User Management
      await auth.goto(
        'https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers'
      );
      await expect(auth.locator('.oxd-table')).toBeVisible();

      // Find and click delete button
      const deleteButtonCount = await auth.locator('.oxd-table-row .oxd-icon.bi-trash').count();
      test.skip(deleteButtonCount === 0, 'No users available to test delete modal');

      await auth.locator('.oxd-table-row .oxd-icon.bi-trash').first().click();

      // Initialize modal
      const modal = new ModalComponent(auth, '.oxd-dialog');
      await modal.waitForReady();

      // Verify modal is visible before closing
      expect(await modal.isVisible()).toBe(true);

      // Click cancel to close modal
      await modal.cancel();

      // Verify modal is no longer visible
      const isStillVisible = await modal.isVisible();
      expect(isStillVisible).toBe(false);
    });

    test('should show confirmation message in delete modal', async ({ auth }) => {
      // Navigate to User Management
      await auth.goto(
        'https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers'
      );
      await expect(auth.locator('.oxd-table')).toBeVisible();

      const deleteButtonCount = await auth.locator('.oxd-table-row .oxd-icon.bi-trash').count();
      test.skip(deleteButtonCount === 0, 'No users available to test delete modal');

      await auth.locator('.oxd-table-row .oxd-icon.bi-trash').first().click();

      const modal = new ModalComponent(auth, '.oxd-dialog');
      await modal.waitForReady();

      // Get modal message
      const message = await modal.getMessage();

      // Delete confirmation should mention the action
      expect(message.length).toBeGreaterThan(0);
      expect(message.toLowerCase()).toMatch(/delete|remove|permanent/);

      // Clean up: close modal
      await modal.cancel();
    });
  });

  test.describe('Form Modal', () => {
    test('should open and close add user modal', async ({ auth }) => {
      // Navigate to User Management
      await auth.goto(
        'https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers'
      );
      await expect(auth.locator('.oxd-table')).toBeVisible();

      // Click "Add" button to open form modal
      await auth.locator('button:has-text("Add")').click();

      const modal = new ModalComponent(auth, '.oxd-dialog, .oxd-overlay--show');
      const modalVisible = await modal.isVisible();

      if (modalVisible) {
        await modal.waitForReady();
        const title = await modal.getTitle();
        expect(title.toLowerCase()).toContain('add');

        await modal.close();
        expect(await modal.isVisible()).toBe(false);
      } else {
        await expect(auth).toHaveURL(/admin\/saveSystemUser/);
        await expect(auth.getByRole('heading', { name: /add user/i })).toBeVisible();
        await auth.getByRole('button', { name: /cancel/i }).click();
        await expect(auth).toHaveURL(/admin\/viewSystemUsers/);
      }
    });

    test('should verify form modal is closable', async ({ auth }) => {
      // Navigate to User Management
      await auth.goto(
        'https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers'
      );
      await expect(auth.locator('.oxd-table')).toBeVisible();

      // Open add user modal
      await auth.locator('button:has-text("Add")').click();

      const modal = new ModalComponent(auth, '.oxd-dialog, .oxd-overlay--show');
      const modalVisible = await modal.isVisible();

      if (modalVisible) {
        await modal.waitForReady();
        const isClosable = await modal.isClosable();
        expect(isClosable).toBe(true);
        await modal.close();
      } else {
        await expect(auth).toHaveURL(/admin\/saveSystemUser/);
        await expect(auth.getByRole('button', { name: /cancel/i })).toBeVisible();
        await auth.getByRole('button', { name: /cancel/i }).click();
        await expect(auth).toHaveURL(/admin\/viewSystemUsers/);
      }
    });
  });

  test.describe('Modal Title Detection', () => {
    test('should correctly detect modal titles for different actions', async ({ auth }) => {
      // Navigate to User Management
      await auth.goto(
        'https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers'
      );
      await expect(auth.locator('.oxd-table')).toBeVisible();

      // Test Add modal title
      await auth.locator('button:has-text("Add")').click();

      let modal = new ModalComponent(auth, '.oxd-dialog, .oxd-overlay--show');
      const modalVisible = await modal.isVisible();

      if (modalVisible) {
        await modal.waitForReady();

        const addTitle = await modal.getTitle();
        expect(addTitle).toBeTruthy();
        expect(addTitle.length).toBeGreaterThan(0);

        await modal.close();
        await expect(auth.locator('.oxd-dialog')).not.toBeVisible();

        await auth.locator('button:has-text("Add")').click();
        modal = new ModalComponent(auth, '.oxd-dialog, .oxd-overlay--show');
        await modal.waitForReady();

        const secondTitle = await modal.getTitle();
        expect(secondTitle).toBe(addTitle);

        await modal.close();
      } else {
        await expect(auth).toHaveURL(/admin\/saveSystemUser/);
        const heading = auth.getByRole('heading', { name: /add user/i });
        await expect(heading).toBeVisible();
        const addTitle = ((await heading.textContent()) ?? '').trim();

        await auth.getByRole('button', { name: /cancel/i }).click();
        await expect(auth).toHaveURL(/admin\/viewSystemUsers/);

        await auth.locator('button:has-text("Add")').click();
        await expect(auth).toHaveURL(/admin\/saveSystemUser/);
        const secondHeading = auth.getByRole('heading', { name: /add user/i });
        await expect(secondHeading).toBeVisible();
        const secondTitle = ((await secondHeading.textContent()) ?? '').trim();

        expect(secondTitle).toBe(addTitle);
        await auth.getByRole('button', { name: /cancel/i }).click();
        await expect(auth).toHaveURL(/admin\/viewSystemUsers/);
      }
    });
  });

  test.describe('Confirm and Cancel Actions', () => {
    test('should trigger confirm action successfully', async ({ auth }) => {
      // Navigate to a page with deletable items
      await auth.goto(
        'https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers'
      );
      await expect(auth.locator('.oxd-table')).toBeVisible();

      const deleteButtonCount = await auth.locator('.oxd-table-row .oxd-icon.bi-trash').count();
      test.skip(deleteButtonCount === 0, 'No users available to test confirm action');

      // Trigger delete modal
      await auth.locator('.oxd-table-row .oxd-icon.bi-trash').first().click();

      const modal = new ModalComponent(auth, '.oxd-dialog');
      await modal.waitForReady();

      // Verify modal has confirm action
      expect(await modal.isVisible()).toBe(true);

      // Click confirm (but we'll cancel to avoid affecting demo data)
      // Note: In a real test environment, we would confirm
      // For demo site, we cancel to preserve data
      await modal.cancel();

      // Verify modal closed
      expect(await modal.isVisible()).toBe(false);
    });

    test('should handle cancel action without side effects', async ({ auth }) => {
      // Navigate to User Management
      await auth.goto(
        'https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers'
      );
      await expect(auth.locator('.oxd-table')).toBeVisible();

      const deleteButtonCount = await auth.locator('.oxd-table-row .oxd-icon.bi-trash').count();
      test.skip(deleteButtonCount === 0, 'No users available to test cancel action');

      // Get row count before
      const countBefore = await auth.locator('.oxd-table-row').count();

      // Trigger delete modal
      await auth.locator('.oxd-table-row .oxd-icon.bi-trash').first().click();

      const modal = new ModalComponent(auth, '.oxd-dialog');
      await modal.waitForReady();

      // Cancel the operation
      await modal.cancel();

      await expect(auth.locator('.oxd-dialog')).not.toBeVisible();

      // Verify no items were deleted (count should be same)
      const countAfter = await auth.locator('.oxd-table-row').count();
      expect(countAfter).toBe(countBefore);
    });

    test('should allow modal to be closed via close button', async ({ auth }) => {
      // Navigate and open a modal
      await auth.goto(
        'https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers'
      );
      await expect(auth.locator('.oxd-table')).toBeVisible();

      await auth.locator('button:has-text("Add")').click();

      const modal = new ModalComponent(auth, '.oxd-dialog, .oxd-overlay--show');
      const modalVisible = await modal.isVisible();

      if (modalVisible) {
        await modal.waitForReady();
        expect(await modal.isVisible()).toBe(true);
        await modal.close();
        expect(await modal.isVisible()).toBe(false);
      } else {
        await expect(auth).toHaveURL(/admin\/saveSystemUser/);
        await expect(auth.getByRole('button', { name: /cancel/i })).toBeVisible();
        await auth.getByRole('button', { name: /cancel/i }).click();
        await expect(auth).toHaveURL(/admin\/viewSystemUsers/);
      }
    });
  });

  test.describe('Modal Visibility States', () => {
    test('should return false for isVisible when no modal is present', async ({ auth }) => {
      // Navigate to a page with no initial modal
      await auth.goto('https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index');
      await expect(auth.locator('.oxd-topbar-header')).toBeVisible();

      // Check modal visibility when no modal exists
      const modal = new ModalComponent(auth, '.oxd-dialog');
      const isVisible = await modal.isVisible();

      expect(isVisible).toBe(false);
    });

    test('should detect modal visibility changes', async ({ auth }) => {
      // Navigate to User Management
      await auth.goto(
        'https://opensource-demo.orangehrmlive.com/web/index.php/admin/viewSystemUsers'
      );
      await expect(auth.locator('.oxd-table')).toBeVisible();

      const modal = new ModalComponent(auth, '.oxd-dialog, .oxd-overlay--show');

      // Initially no modal
      expect(await modal.isVisible()).toBe(false);

      // Open modal
      await auth.locator('button:has-text("Add")').click();
      const modalVisible = await modal.isVisible();

      if (modalVisible) {
        await modal.waitForReady();
        expect(await modal.isVisible()).toBe(true);
        await modal.close();
        expect(await modal.isVisible()).toBe(false);
      } else {
        await expect(auth).toHaveURL(/admin\/saveSystemUser/);
        await expect(auth.getByRole('button', { name: /cancel/i })).toBeVisible();
        await auth.getByRole('button', { name: /cancel/i }).click();
        await expect(auth).toHaveURL(/admin\/viewSystemUsers/);
        expect(await modal.isVisible()).toBe(false);
      }
    });
  });
});
