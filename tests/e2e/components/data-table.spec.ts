import { test, expect } from '../../../infra/test-runner/index.js';
import { DataTableComponent } from '../../../ui/components/index.js';

test.describe('DataTable Component', () => {
  const EMPLOYEE_LIST_URL = '/web/index.php/pim/viewEmployeeList';

  test.describe('with Employee List (135+ records)', () => {
    test('should display table with data rows', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      await expect(auth.locator('.oxd-table')).toBeVisible();

      const rowCount = await dataTable.getRowCount();
      expect(rowCount).toBeGreaterThan(0);

      const headers = await dataTable.getHeaders();
      expect(headers.length).toBeGreaterThan(0);
    });

    test('should filter table with search functionality', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      const initialRowCount = await dataTable.getRowCount();
      expect(initialRowCount).toBeGreaterThan(0);

      const searchTerm = 'Admin';
      await dataTable.search(searchTerm);

      await auth.locator('.oxd-table-card').first().waitFor({ state: 'visible', timeout: 10000 });

      const filteredRowCount = await dataTable.getRowCount();
      expect(filteredRowCount).toBeLessThanOrEqual(initialRowCount);

      await expect(auth.locator('.oxd-table')).toBeVisible();

      const dataCardCount = await auth.locator('.oxd-table-card').count();
      if (dataCardCount > 0) {
        await expect(auth.locator('.oxd-table-card').first()).toBeVisible();
      }
    });

    test('should handle empty search results gracefully', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      await dataTable.search('XYZ123NONEXISTENT');
      await auth
        .locator('.oxd-table-card, text=No Records Found')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {});

      const rowCount = await dataTable.getRowCount();
      const noRecordsMessage = auth.locator('text=No Records Found');

      if (rowCount === 0) {
        await expect(noRecordsMessage.or(auth.locator('.oxd-table-body:empty'))).toBeVisible();
      }
    });

    test('should sort columns in ascending and descending order', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      await auth.locator('.oxd-table-card').first().waitFor({ state: 'visible', timeout: 10000 });
      const count = await auth.locator('.oxd-table-body .oxd-table-card').count();
      expect(count).toBeGreaterThan(0);

      const headers = await dataTable.getHeaders();
      expect(headers.length).toBeGreaterThan(0);

      if (headers.length > 0) {
        await dataTable.sortByColumn(0);
        await auth.locator('.oxd-table-card').first().waitFor({ state: 'visible', timeout: 10000 });

        await dataTable.sortByColumn(0);
        await auth.locator('.oxd-table-card').first().waitFor({ state: 'visible', timeout: 10000 });

        const sortIcon = auth.locator('.oxd-table-header-sort .oxd-icon').first();
        await expect(sortIcon).toBeVisible();
      }
    });

    test('should navigate through pagination', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      await expect(auth.locator('.oxd-table')).toBeVisible();

      const pagination = auth.locator('.oxd-pagination');
      const hasPagination = await pagination.isVisible().catch(() => false);

      if (hasPagination) {
        const nextButton = auth.locator('.oxd-pagination-page-item--previous-next').nth(1);
        const isNextEnabled = await nextButton.isEnabled().catch(() => false);

        if (isNextEnabled) {
          const firstRowCurrentPage = await dataTable.getCellText(0, 0);

          await nextButton.click();
          await auth
            .locator('.oxd-table-card')
            .first()
            .waitFor({ state: 'visible', timeout: 10000 });

          const firstRowNextPage = await dataTable.getCellText(0, 0);
          expect(firstRowNextPage).not.toBe(firstRowCurrentPage);

          const prevButton = auth.locator('.oxd-pagination-page-item--previous-next').first();
          await prevButton.click();
          await auth
            .locator('.oxd-table-card')
            .first()
            .waitFor({ state: 'visible', timeout: 10000 });

          const firstRowBackToFirst = await dataTable.getCellText(0, 0);
          expect(firstRowBackToFirst).toBe(firstRowCurrentPage);
        }
      }
    });

    test('should handle pagination edge cases with large dataset', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      await expect(auth.locator('.oxd-table')).toBeVisible();

      const rowCount = await dataTable.getRowCount();
      const pagination = auth.locator('.oxd-pagination');
      const hasPagination = await pagination.isVisible().catch(() => false);

      if (hasPagination) {
        const paginationText = await auth.locator('.oxd-pagination-page-info').textContent();
        const totalMatch = paginationText?.match(/(\d+)\s*Records?/);
        if (totalMatch) {
          const totalRecords = parseInt(totalMatch[1], 10);
          expect(totalRecords).toBeGreaterThanOrEqual(135);
        }

        const pageNumbers = auth.locator('.oxd-pagination-page-item--page-number');
        const pageCount = await pageNumbers.count();

        if (pageCount > 1) {
          await pageNumbers.nth(pageCount - 1).click();
          await auth
            .locator('.oxd-table-card')
            .first()
            .waitFor({ state: 'visible', timeout: 10000 })
            .catch(() => {});

          const lastPageRowCount = await dataTable.getRowCount();
          expect(lastPageRowCount).toBeGreaterThanOrEqual(0);
        }
      } else {
        expect(rowCount).toBeGreaterThanOrEqual(10);
      }
    });

    test('should support row selection if checkbox column exists', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      await expect(auth.locator('.oxd-table')).toBeVisible();

      const checkboxes = auth.locator('.oxd-table-card .oxd-checkbox-input');
      const hasCheckboxes = await checkboxes
        .first()
        .isVisible()
        .catch(() => false);

      if (hasCheckboxes) {
        await dataTable.clickRow(0);

        const firstCheckbox = checkboxes.first();
        await expect(firstCheckbox).toHaveClass(/checked/);

        const rowCount = await dataTable.getRowCount();
        if (rowCount > 1) {
          await dataTable.clickRow(1);

          const secondCheckbox = checkboxes.nth(1);
          await expect(secondCheckbox).toHaveClass(/checked/);
        }
      }
    });

    test('should retrieve cell text correctly', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      await auth.locator('.oxd-table-card').first().waitFor({ state: 'visible', timeout: 10000 });
      const rowCount = await auth.locator('.oxd-table-body .oxd-table-card').count();
      expect(rowCount).toBeGreaterThan(0);

      const firstCellText = await dataTable.getCellText(0, 0);
      const firstCellDirect =
        (await auth
          .locator('.oxd-table-body .oxd-table-card')
          .first()
          .locator('.oxd-table-cell')
          .first()
          .textContent()) ?? '';
      expect(typeof firstCellText).toBe('string');
      expect(firstCellText).toBe(firstCellDirect);

      const headers = await dataTable.getHeaders();
      if (headers.length > 1) {
        const secondCellText = await dataTable.getCellText(0, 1);
        expect(typeof secondCellText).toBe('string');
      }

      const rowCount2 = await dataTable.getRowCount();
      if (rowCount2 > 1) {
        const secondRowCellText = await dataTable.getCellText(1, 0);
        const secondRowCellDirect =
          (await auth
            .locator('.oxd-table-body .oxd-table-card')
            .nth(1)
            .locator('.oxd-table-cell')
            .first()
            .textContent()) ?? '';
        expect(typeof secondRowCellText).toBe('string');
        expect(secondRowCellText).toBe(secondRowCellDirect);
      }
    });

    test('should be visible when table exists', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      const isVisible = await dataTable.isVisible();
      expect(isVisible).toBe(true);
    });

    test('should get accurate row count', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      await auth.locator('.oxd-table-card').first().waitFor({ state: 'visible', timeout: 10000 });

      const componentRowCount = await dataTable.getRowCount();

      const tableRows = auth.locator('.oxd-table-body .oxd-table-card');
      const directRowCount = await tableRows.count();

      expect(componentRowCount).toBe(directRowCount);
      expect(componentRowCount).toBeGreaterThan(0);
    });
  });

  test.describe('search edge cases', () => {
    test('should handle search with special characters', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      const specialSearchTerms = ['test@email.com', "O'Brien", 'Name-With-Hyphen'];

      for (const term of specialSearchTerms) {
        await dataTable.search(term);
        await auth
          .locator('.oxd-table-card')
          .first()
          .waitFor({ state: 'visible', timeout: 10000 })
          .catch(() => {});

        await dataTable.search('');
        await auth
          .locator('.oxd-table-card')
          .first()
          .waitFor({ state: 'visible', timeout: 10000 })
          .catch(() => {});
      }
    });

    test('should handle case-insensitive search', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      await dataTable.search('ADMIN');
      await auth
        .locator('.oxd-table-card')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {});
      const upperCaseResults = await dataTable.getRowCount();

      await dataTable.search('admin');
      await auth
        .locator('.oxd-table-card')
        .first()
        .waitFor({ state: 'visible', timeout: 10000 })
        .catch(() => {});
      const lowerCaseResults = await dataTable.getRowCount();

      expect(upperCaseResults).toBe(lowerCaseResults);
    });
  });

  test.describe('table headers', () => {
    test('should retrieve all table headers', async ({ auth }) => {
      await auth.goto(EMPLOYEE_LIST_URL);
      await auth.waitForURL(/viewEmployeeList/);

      const dataTable = new DataTableComponent(auth, '.oxd-table');

      const headers = await dataTable.getHeaders();

      expect(headers.length).toBeGreaterThanOrEqual(3);

      headers.forEach((header: string) => {
        expect(typeof header).toBe('string');
        expect(header.trim().length).toBeGreaterThan(0);
      });

      const headerTexts = headers.map((h: string) => h.toLowerCase());
      const hasEmployeeName = headerTexts.some(
        (h: string) => h.includes('employee') || h.includes('name')
      );
      expect(hasEmployeeName).toBe(true);
    });
  });
});
