import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base-component.js';

export class FileUploadComponent extends BaseComponent {
  private uploadArea: Locator;

  constructor(page: Page, selector: string | Locator) {
    super(page, selector);
    this.uploadArea = typeof selector === 'string' ? page.locator(selector) : selector;
  }

  async waitForReady(): Promise<void> {
    const fileInput = this.uploadArea.locator('input[type="file"]');
    await fileInput.waitFor({ state: 'attached' });
  }

  async isVisible(): Promise<boolean> {
    const uploadBtn = this.uploadArea.getByRole('button', { name: /browse|upload|choose/i });
    return uploadBtn.isVisible().catch(() => false);
  }

  async uploadFile(filePath: string): Promise<void> {
    const fileInput = this.uploadArea.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  async uploadMultipleFiles(filePaths: string[]): Promise<void> {
    const fileInput = this.uploadArea.locator('input[type="file"]');
    await fileInput.setInputFiles(filePaths);
  }

  async clearSelection(): Promise<void> {
    const fileInput = this.uploadArea.locator('input[type="file"]');
    await fileInput.setInputFiles([]);
  }

  async getSelectedFileName(): Promise<string> {
    const fileName = this.uploadArea.getByText(/\.[a-z]{2,4}$/).first();
    return (await fileName.textContent()) ?? '';
  }

  async getSelectedFileNames(): Promise<string[]> {
    const fileNames = this.uploadArea.getByText(/\.[a-z]{2,4}$/);
    const count = await fileNames.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await fileNames.nth(i).textContent();
      if (text) result.push(text);
    }
    return result;
  }

  async isValidFileType(): Promise<boolean> {
    const error = this.uploadArea
      .getByRole('alert')
      .or(this.uploadArea.getByText(/invalid|not allowed/i));
    return !(await error.isVisible().catch(() => false));
  }

  async getValidationMessage(): Promise<string> {
    const error = this.uploadArea
      .getByRole('alert')
      .or(this.uploadArea.locator('[class*="error"]'));
    return (await error.textContent()) ?? '';
  }
}
