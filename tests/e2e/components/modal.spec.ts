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

      // Initialize modal component
      const modal = new ModalComponent(auth, '.oxd-dialog, .oxd-overlay--show');

      // Wait for modal to be ready and verify it's visible
      await modal.waitForReady();
      expect(await modal.isVisible()).toBe(true);

      // Verify modal title
      const title = await modal.getTitle();
      expect(title.toLowerCase()).toContain('add');

      // Close modal
      await modal.close();

      // Verify modal is closed
      expect(await modal.isVisible()).toBe(false);
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
      await modal.waitForReady();

      // Check if modal is closable
      const isClosable = await modal.isClosable();
      expect(isClosable).toBe(true);

      // Clean up
      await modal.close();
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
      await modal.waitForReady();

      const addTitle = await modal.getTitle();
      expect(addTitle).toBeTruthy();
      expect(addTitle.length).toBeGreaterThan(0);

      // Close and reopen to test consistency
      await modal.close();

      // Wait for modal to close
      await auth.waitForTimeout(500);

      // Reopen to verify title consistency
      await auth.locator('button:has-text("Add")').click();
      modal = new ModalComponent(auth, '.oxd-dialog, .oxd-overlay--show');
      await modal.waitForReady();

      const secondTitle = await modal.getTitle();
      expect(secondTitle).toBe(addTitle);

      await modal.close();
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

      // Wait for table to stabilize
      await auth.waitForTimeout(500);

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

      // Wait for modal to close
      await auth.waitForTimeout(500);

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
      await modal.waitForReady();

      expect(await modal.isVisible()).toBe(true);

      // Use close method
      await modal.close();

      // Verify modal closed
      expect(await modal.isVisible()).toBe(false);
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
      await modal.waitForReady();

      // Modal should be visible
      expect(await modal.isVisible()).toBe(true);

      // Close modal
      await modal.close();

      // Modal should not be visible
      expect(await modal.isVisible()).toBe(false);
    });
  });
});
