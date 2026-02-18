import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base-component.js';

export class ModalComponent extends BaseComponent {
  private dialog: Locator;

  constructor(page: Page, selector: string | Locator) {
    super(page, selector);
    this.dialog = this.root.getByRole('dialog');
  }

  async waitForReady(): Promise<void> {
    await this.dialog.waitFor({ state: 'visible' });
  }

  async isVisible(): Promise<boolean> {
    return this.dialog.isVisible().catch(() => false);
  }

  async close(): Promise<void> {
    const closeBtn = this.dialog.getByRole('button', { name: /close|cancel/i });
    await closeBtn.click();
  }

  async confirm(): Promise<void> {
    const confirmBtn = this.dialog.getByRole('button', { name: /confirm|yes|ok|save/i });
    await confirmBtn.click();
  }

  async cancel(): Promise<void> {
    const cancelBtn = this.dialog.getByRole('button', { name: /cancel|no/i });
    await cancelBtn.click();
  }

  async getTitle(): Promise<string> {
    const heading = this.dialog.getByRole('heading');
    return (await heading.textContent()) ?? '';
  }

  async getMessage(): Promise<string> {
    const body = this.dialog.locator('[class*="body"], [class*="content"]');
    return (await body.textContent()) ?? '';
  }

  async isClosable(): Promise<boolean> {
    const closeBtn = this.dialog.getByRole('button', { name: /close|cancel/i });
    return closeBtn.isVisible().catch(() => false);
  }
}
