import { BasePage } from '../base-page.js';
import type { Locator, Page } from '@playwright/test';

export interface ReviewData {
  employee: string;
  reviewer: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  dueDate: string;
}

export class PerformanceReviewsPage extends BasePage {
  private readonly formContainer: Locator;
  private readonly successFeedback: Locator;

  constructor(page: Page) {
    super(page, '/web/index.php/performance/searchEvaluatePerformanceReview');
    this.formContainer = this.page.locator('.oxd-form').first();
    this.successFeedback = this.page
      .locator('.oxd-toast')
      .filter({ hasText: /success|successfully|saved|added/i })
      .first()
      .or(this.page.getByText(/successfully|saved/i).first());
  }

  private employeeNameInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /employee name/i })
      .or(this.page.locator('input[name="review[employeeName]"]'))
      .first();
  }

  private reviewerInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /supervisor reviewer|reviewer/i })
      .or(this.page.locator('input[name="review[reviewerName]"]'))
      .first();
  }

  private fromDateInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /from/i })
      .or(this.page.locator('input[name="review[reviewPeriodStartDate]"]'))
      .first();
  }

  private toDateInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /to/i })
      .or(this.page.locator('input[name="review[reviewPeriodEndDate]"]'))
      .first();
  }

  private dueDateInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /due date/i })
      .or(this.page.locator('input[name="review[dueDate]"]'))
      .first();
  }

  private ratingInput(): Locator {
    return this.page
      .getByRole('spinbutton', { name: /rating/i })
      .or(this.page.locator('input[name="rating"]'))
      .first();
  }

  private commentsInput(): Locator {
    return this.page
      .getByRole('textbox', { name: /comment/i })
      .or(this.page.locator('textarea[name="comments"]'))
      .first();
  }

  async navigate(): Promise<void> {
    await this.page.goto(this.baseUrl);
  }

  async waitForReady(): Promise<void> {
    await this.page
      .getByRole('heading', { name: /performance|review/i })
      .or(this.formContainer)
      .first()
      .waitFor({ state: 'visible' });
  }

  async isReady(): Promise<boolean> {
    return this.page
      .getByRole('heading', { name: /performance|review/i })
      .or(this.formContainer)
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
    await this.page
      .getByRole('table')
      .or(this.page.locator('.oxd-table'))
      .first()
      .waitFor({ state: 'visible' });
  }

  async createReview(review: ReviewData): Promise<void> {
    await this.page.getByRole('button', { name: /add/i }).click();
    await this.formContainer.waitFor({ state: 'visible' });

    await this.employeeNameInput().fill(review.employee);
    await this.page
      .getByRole('option', { name: new RegExp(review.employee, 'i') })
      .first()
      .click()
      .catch(() => {});

    await this.reviewerInput().fill(review.reviewer);
    await this.page
      .getByRole('option', { name: new RegExp(review.reviewer, 'i') })
      .first()
      .click()
      .catch(() => {});

    await this.fromDateInput().fill(review.reviewPeriodStart);
    await this.toDateInput().fill(review.reviewPeriodEnd);
    await this.dueDateInput().fill(review.dueDate);

    await this.page.getByRole('button', { name: /save/i }).click();
    await this.successFeedback.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async evaluateReview(employeeName: string, rating: number, comments: string): Promise<void> {
    await this.searchReview(employeeName);
    await this.page
      .getByRole('button', { name: /edit/i })
      .or(this.page.locator('.oxd-table-cell-action-edit'))
      .first()
      .click();

    await this.formContainer.waitFor({ state: 'visible' });
    await this.ratingInput().fill(rating.toString());
    await this.commentsInput().fill(comments);
    await this.page.getByRole('button', { name: /complete/i }).click();
    await this.successFeedback.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
  }

  async findReview(employeeName: string): Promise<boolean> {
    await this.searchReview(employeeName);
    const row = this.page
      .getByRole('row')
      .filter({ hasText: new RegExp(employeeName, 'i') })
      .first();
    return row.isVisible().catch(() => false);
  }
}
