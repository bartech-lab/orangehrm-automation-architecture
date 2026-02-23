import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base-component.js';

export class DataTableComponent extends BaseComponent {
  private readonly cardRowSelector = '.oxd-table-card';

  constructor(page: Page, selector: string | Locator) {
    super(page, selector);
  }

  async waitForReady(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  async isVisible(): Promise<boolean> {
    await this.root.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    return this.root.isVisible().catch(() => false);
  }

  async isReady(): Promise<boolean> {
    return this.isVisible();
  }

  private async waitForTableBody(): Promise<void> {
    const cardRows = this.page.locator(this.cardRowSelector);
    await cardRows
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});

    const semanticDataRows = this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell') });
    await semanticDataRows
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});
  }

  private async waitForTableHeader(): Promise<void> {
    await this.page
      .getByRole('columnheader')
      .or(this.page.locator('.oxd-table-header-cell'))
      .first()
      .waitFor({ state: 'visible', timeout: 10000 })
      .catch(() => {});
  }

  async getRowCount(): Promise<number> {
    await this.waitForTableBody();
    const cardRows = this.page.locator(this.cardRowSelector);
    const cardRowCount = await cardRows.count();
    if (cardRowCount > 0) {
      return cardRowCount;
    }

    const semanticDataRows = this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell') });
    return semanticDataRows.count();
  }

  async getCellText(row: number, column: number): Promise<string> {
    await this.waitForTableBody();

    const cardRows = this.page.locator(this.cardRowSelector);
    if ((await cardRows.count()) > 0) {
      const cells = cardRows
        .nth(row)
        .getByRole('cell')
        .or(cardRows.nth(row).locator('.oxd-table-cell'));
      const text = await cells.nth(column).textContent();
      return text ?? '';
    }

    const semanticDataRows = this.page
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell') });
    const text = await semanticDataRows.nth(row).getByRole('cell').nth(column).textContent();
    return text ?? '';
  }

  async clickRow(row: number): Promise<void> {
    await this.waitForTableBody();

    const cardRows = this.page.locator(this.cardRowSelector);
    const targetRow =
      (await cardRows.count()) > 0
        ? cardRows.nth(row)
        : this.page
            .getByRole('row')
            .filter({ has: this.page.getByRole('cell') })
            .nth(row);
    await targetRow.scrollIntoViewIfNeeded();
    await targetRow.click();
  }

  async sortByColumn(column: number): Promise<void> {
    await this.waitForTableHeader();
    const headers = this.page
      .getByRole('columnheader')
      .or(this.page.locator('.oxd-table-header-cell'));
    await headers.nth(column).click();
  }

  async search(query: string): Promise<void> {
    const searchInput = this.page
      .getByRole('searchbox')
      .or(this.page.getByPlaceholder(/search/i))
      .or(this.page.locator('.oxd-input').first());
    await searchInput.fill(query);
  }

  async getHeaders(): Promise<string[]> {
    await this.waitForTableHeader();
    const headers = this.page
      .getByRole('columnheader')
      .or(this.page.locator('.oxd-table-header-cell'));
    const count = await headers.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await headers.nth(i).textContent();
      if (text) result.push(text.trim());
    }
    return result;
  }

  async findRow(criteria: Record<string, string | RegExp>): Promise<number> {
    await this.waitForTableBody();
    const rowCount = await this.getRowCount();

    for (let i = 0; i < rowCount; i++) {
      let matches = true;
      for (const [columnText, searchValue] of Object.entries(criteria)) {
        const headers = await this.getHeaders();
        const columnIndex = headers.findIndex((h) =>
          h.toLowerCase().includes(columnText.toLowerCase())
        );
        if (columnIndex === -1) {
          matches = false;
          break;
        }
        const cellText = await this.getCellText(i, columnIndex);
        const pattern =
          typeof searchValue === 'string' ? new RegExp(searchValue, 'i') : searchValue;
        if (!pattern.test(cellText)) {
          matches = false;
          break;
        }
      }
      if (matches) return i;
    }
    return -1;
  }

  async clickRowByContent(content: string | RegExp): Promise<void> {
    await this.waitForTableBody();
    const pattern = typeof content === 'string' ? new RegExp(content, 'i') : content;

    const cardRows = this.page.locator(this.cardRowSelector);
    if ((await cardRows.count()) > 0) {
      const matchingRow = cardRows.filter({ hasText: pattern }).first();
      await matchingRow.scrollIntoViewIfNeeded();
      await matchingRow.click();
      return;
    }

    const semanticRows = this.page.getByRole('row').filter({ has: this.page.getByRole('cell') });
    const matchingRow = semanticRows.filter({ hasText: pattern }).first();
    await matchingRow.scrollIntoViewIfNeeded();
    await matchingRow.click();
  }
}
