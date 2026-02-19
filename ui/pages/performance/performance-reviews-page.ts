import { BasePage } from '../base-page.js';
import type { Page } from '@playwright/test';

export class PerformanceReviewsPage extends BasePage {
  constructor(page: Page) {
    super(page, '/web/index.php/performance/searchEvaluatePerformanceReview');
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.page
      .getByRole('heading', { name: /performance|review/i })
      .or(this.page.locator('.oxd-form'))
      .first()
      .waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.page
      .getByRole('heading', { name: /performance|review/i })
      .or(this.page.locator('.oxd-form'))
      .first()
      .isVisible()
      .catch(() => false);
  }

  async searchReview(employeeName: string): Promise<void> {
    await this.page
      .getByPlaceholder(/type for hints/i)
      .first()
      .fill(employeeName);
    await this.page
      .getByRole('option', { name: new RegExp(employeeName, 'i') })
      .or(this.page.locator('.oxd-autocomplete-option, .oxd-autocomplete-dropdown-option').first())
      .first()
      .click();
    await this.page.getByRole('button', { name: /search/i }).click();
  }

  async addReview(review: {
    employee: string;
    reviewer: string;
    reviewPeriodStart: string;
    reviewPeriodEnd: string;
    dueDate: string;
  }): Promise<void> {
    await this.page.getByRole('button', { name: /add/i }).click();
    await this.page
      .getByRole('textbox', { name: /employee name/i })
      .or(this.page.locator('input[name="review[employeeName]"]'))
      .first()
      .fill(review.employee);
    await this.page
      .getByRole('textbox', { name: /supervisor reviewer|reviewer/i })
      .or(this.page.locator('input[name="review[reviewerName]"]'))
      .first()
      .fill(review.reviewer);
    await this.page
      .getByRole('textbox', { name: /from/i })
      .or(this.page.locator('input[name="review[reviewPeriodStartDate]"]'))
      .first()
      .fill(review.reviewPeriodStart);
    await this.page
      .getByRole('textbox', { name: /to/i })
      .or(this.page.locator('input[name="review[reviewPeriodEndDate]"]'))
      .first()
      .fill(review.reviewPeriodEnd);
    await this.page
      .getByRole('textbox', { name: /due date/i })
      .or(this.page.locator('input[name="review[dueDate]"]'))
      .first()
      .fill(review.dueDate);
    await this.page.getByRole('button', { name: /save/i }).click();
  }

  async evaluateReview(employeeName: string, rating: number, comments: string): Promise<void> {
    await this.searchReview(employeeName);
    await this.page
      .getByRole('button', { name: /edit/i })
      .or(this.page.locator('.oxd-table-cell-action-edit'))
      .first()
      .click();
    await this.page
      .getByRole('spinbutton', { name: /rating/i })
      .or(this.page.locator('input[name="rating"]'))
      .first()
      .fill(rating.toString());
    await this.page
      .getByRole('textbox', { name: /comment/i })
      .or(this.page.locator('textarea[name="comments"]'))
      .first()
      .fill(comments);
    await this.page.getByRole('button', { name: /complete/i }).click();
  }
}
