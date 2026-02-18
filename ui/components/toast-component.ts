import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base-component.js';

export class ToastComponent extends BaseComponent {
  constructor(page: Page, selector: string | Locator) {
    super(page, selector);
  }

  async waitForReady(): Promise<void> {
    await this.root.getByRole('alert').or(this.root).waitFor({ state: 'visible' });
  }

  async isVisible(): Promise<boolean> {
    return this.root
      .getByRole('alert')
      .or(this.root)
      .isVisible()
      .catch(() => false);
  }

  async getMessage(): Promise<string> {
    const alert = this.root.getByRole('alert').or(this.root);
    return (await alert.textContent()) ?? '';
  }

  async getType(): Promise<'success' | 'error' | 'warning' | 'info'> {
    const classes = (await this.root.getAttribute('class')) ?? '';
    if (classes.includes('success')) return 'success';
    if (classes.includes('error') || classes.includes('danger')) return 'error';
    if (classes.includes('warning')) return 'warning';
    return 'info';
  }

  async close(): Promise<void> {
    const closeBtn = this.root.getByRole('button', { name: /close|dismiss/i });
    await closeBtn.click();
  }

  async waitForDisappearance(): Promise<void> {
    await this.root.getByRole('alert').or(this.root).waitFor({ state: 'hidden' });
  }

  async isDismissible(): Promise<boolean> {
    const closeBtn = this.root.getByRole('button', { name: /close|dismiss/i });
    return closeBtn.isVisible().catch(() => false);
  }
}
