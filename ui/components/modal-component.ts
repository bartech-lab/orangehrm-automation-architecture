import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base-component.js';

export class ModalComponent extends BaseComponent {
  constructor(page: Page, selector?: string | Locator) {
    super(page, selector ?? page.getByRole('dialog').or(page.locator('.oxd-dialog-sheet')));
  }

  async waitForReady(): Promise<void> {
    await this.root.waitFor({ state: 'visible', timeout: 10_000 });
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible().catch(() => false);
  }

  async close(): Promise<void> {
    const closeBtn = this.root.getByRole('button', { name: /close|cancel/i });
    await closeBtn.click();
    await this.root.waitFor({ state: 'hidden' }).catch(() => {});
  }

  async confirm(): Promise<void> {
    const confirmBtn = this.root.getByRole('button', { name: /confirm|yes|ok|save/i });
    await confirmBtn.click();
    await this.root.waitFor({ state: 'hidden' }).catch(() => {});
  }

  async cancel(): Promise<void> {
    const cancelBtn = this.root.getByRole('button', { name: /cancel|no/i });
    await cancelBtn.click();
    await this.root.waitFor({ state: 'hidden' }).catch(() => {});
  }

  async getTitle(): Promise<string> {
    const heading = this.root.getByRole('heading');
    return (await heading.textContent()) ?? '';
  }

  async getMessage(): Promise<string> {
    const body = this.root
      .locator(
        '.oxd-dialog-content-text, .oxd-dialog-content, .oxd-dialog-body, [role="document"] p'
      )
      .first();
    return ((await body.textContent()) ?? '').trim();
  }

  async isClosable(): Promise<boolean> {
    const closeBtn = this.root.getByRole('button', { name: /close|cancel/i });
    return closeBtn.isVisible().catch(() => false);
  }
}
