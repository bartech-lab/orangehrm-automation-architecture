import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base-component.js';

export class DataTableComponent extends BaseComponent {
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
    await this.page
      .getByRole('row')
      .or(this.page.locator('.oxd-table-card'))
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
    const rows = this.page.getByRole('row').or(this.page.locator('.oxd-table-card'));
    return rows.count();
  }

  async getCellText(row: number, column: number): Promise<string> {
    await this.waitForTableBody();
    const rows = this.page.getByRole('row').or(this.page.locator('.oxd-table-card'));
    const cells = rows.nth(row).getByRole('cell').or(rows.nth(row).locator('.oxd-table-cell'));
    const text = await cells.nth(column).textContent();
    return text ?? '';
  }

  async clickRow(row: number): Promise<void> {
    await this.waitForTableBody();
    const rows = this.page.getByRole('row').or(this.page.locator('.oxd-table-card'));
    const targetRow = rows.nth(row);
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
}
