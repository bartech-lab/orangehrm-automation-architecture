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

  private getFormRoot(): Locator {
    return this.root.getByRole('form').or(this.root).first();
  }

  private getFieldLocator(fieldName: string): Locator {
    const pattern = toFlexiblePattern(fieldName);
    const formRoot = this.getFormRoot();
    const byRole = formRoot.getByRole('textbox', { name: pattern });
    const bySpinbutton = formRoot.getByRole('spinbutton', { name: pattern });
    const byLabel = formRoot.getByLabel(pattern);
    const byPlaceholder = formRoot.getByPlaceholder(pattern);
    const byName = formRoot.locator(`input[name="${fieldName}"]`);
    const byNameContains = formRoot.locator(`input[name*="${fieldName}" i]`);
    const byNearbyText = formRoot.getByText(pattern).first().locator('xpath=following::input[1]');

    return byRole
      .or(bySpinbutton)
      .or(byLabel)
      .or(byPlaceholder)
      .or(byName)
      .or(byNameContains)
      .or(byNearbyText);
  }

  async waitForReady(): Promise<void> {
    await this.getFormRoot().waitFor({ state: 'visible' });
  }

  async isVisible(): Promise<boolean> {
    return this.getFormRoot()
      .isVisible()
      .catch(() => false);
  }

  async fillField(fieldName: string, value: string): Promise<void> {
    const input = this.getFieldLocator(fieldName);
    await input.fill(value);
  }

  async selectOption(fieldName: string, option: string): Promise<void> {
    const pattern = toFlexiblePattern(fieldName);
    const formRoot = this.getFormRoot();
    const dropdown = formRoot
      .getByRole('combobox', { name: pattern })
      .or(formRoot.getByRole('button', { name: pattern }).first())
      .or(formRoot.getByText(pattern).first());

    await dropdown.click();
    await this.page.getByRole('option', { name: new RegExp(option, 'i') }).click();
  }

  async submit(): Promise<void> {
    const formRoot = this.getFormRoot();
    const submitBtn = formRoot
      .getByRole('button', { name: /save|submit|add/i })
      .first()
      .or(formRoot.locator('button[type="submit"]').first());
    await submitBtn.click();
  }

  async clearField(fieldName: string): Promise<void> {
    const input = this.getFieldLocator(fieldName);
    await input.clear();
  }

  async getValidationErrors(): Promise<string[]> {
    const formRoot = this.getFormRoot();
    const errors = formRoot.getByRole('alert').or(formRoot.getByText(/required|invalid/i));
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
    const input = this.getFieldLocator(fieldName);
    const value = await input.inputValue().catch(() => '');

    if (!value.trim()) {
      const errors = await this.getValidationErrors();
      if (errors.length > 0) return false;
    }

    const ariaInvalid = await input.getAttribute('aria-invalid').catch(() => null);
    if (ariaInvalid === 'true') return false;

    const describedBy = await input.getAttribute('aria-describedby').catch(() => null);
    if (describedBy) {
      const ids = describedBy.split(/\s+/).filter(Boolean);
      for (const id of ids) {
        const describedError = this.page
          .locator(`#${id}`)
          .getByText(/required|invalid/i)
          .first();
        if (await describedError.isVisible().catch(() => false)) return false;
      }
    }

    const fieldError = input
      .locator('xpath=ancestor::*[self::div or self::fieldset][1]')
      .getByRole('alert')
      .first()
      .or(
        input
          .locator('xpath=ancestor::*[self::div or self::fieldset][1]')
          .getByText(/required|invalid/i)
          .first()
      );
    return !(await fieldError.isVisible().catch(() => false));
  }

  async submitForm(data: Record<string, string>): Promise<void> {
    await this.waitForReady();

    for (const [fieldName, value] of Object.entries(data)) {
      await this.fillField(fieldName, value);
    }

    await this.submit();

    await this.page
      .waitForResponse(
        (response) =>
          response.request().method() === 'POST' || response.request().method() === 'PUT',
        { timeout: 10_000 }
      )
      .catch(() => {});

    await this.page.waitForTimeout(500);
  }
}
