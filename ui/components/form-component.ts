import type { Locator, Page } from '@playwright/test';
import { BaseComponent } from './base-component.js';

function toFlexiblePattern(fieldName: string): RegExp {
  const camelToSpace = fieldName.replace(/([a-z])([A-Z])/g, '$1 $2');
  return new RegExp(camelToSpace, 'i');
}

export class FormComponent extends BaseComponent {
  constructor(page: Page, selector: string | Locator) {
    super(page, selector);
  }

  async waitForReady(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible().catch(() => false);
  }

  async fillField(fieldName: string, value: string): Promise<void> {
    const pattern = toFlexiblePattern(fieldName);
    const byPlaceholder = this.root.getByPlaceholder(pattern);
    const byName = this.root.locator(`input[name="${fieldName}"]`);
    const byNameContains = this.root.locator(`input[name*="${fieldName}" i]`);
    const byInputLabel = this.root
      .locator('.oxd-input-group')
      .filter({ hasText: pattern })
      .locator('input');

    const input = byPlaceholder.or(byName).or(byNameContains).or(byInputLabel);

    await input.fill(value);
  }

  async selectOption(fieldName: string, option: string): Promise<void> {
    const pattern = toFlexiblePattern(fieldName);
    const dropdown = this.root
      .locator('.oxd-input-group')
      .filter({ hasText: pattern })
      .locator('.oxd-select-text');

    await dropdown.click();
    await this.page.getByRole('option', { name: new RegExp(option, 'i') }).click();
  }

  async submit(): Promise<void> {
    const submitBtn = this.root.locator('button[type="submit"]');
    await submitBtn.click();
  }

  async clearField(fieldName: string): Promise<void> {
    const pattern = toFlexiblePattern(fieldName);
    const byPlaceholder = this.root.getByPlaceholder(pattern);
    const byName = this.root.locator(`input[name="${fieldName}"]`);
    const byNameContains = this.root.locator(`input[name*="${fieldName}" i]`);
    const byInputLabel = this.root
      .locator('.oxd-input-group')
      .filter({ hasText: pattern })
      .locator('input');

    const input = byPlaceholder.or(byName).or(byNameContains).or(byInputLabel);

    await input.clear();
  }

  async getValidationErrors(): Promise<string[]> {
    const errors = this.root.locator('.oxd-input-field-error-message');
    await errors
      .first()
      .waitFor({ state: 'visible', timeout: 5000 })
      .catch(() => {});
    const count = await errors.count();
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await errors.nth(i).textContent();
      if (text) result.push(text.trim());
    }
    return result;
  }

  async isFieldValid(fieldName: string): Promise<boolean> {
    const pattern = toFlexiblePattern(fieldName);
    const input = this.root.getByPlaceholder(pattern);

    const classes = (await input.getAttribute('class').catch(() => '')) ?? '';
    if (classes.includes('oxd-input--error')) return false;

    const inputGroup = input.locator('xpath=ancestor::div[contains(@class, "oxd-input-group")][1]');
    const errorEl = inputGroup.locator('.oxd-input-field-error-message');
    return !(await errorEl.isVisible().catch(() => false));
  }
}
