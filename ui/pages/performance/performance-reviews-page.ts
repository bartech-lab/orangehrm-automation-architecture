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
    await this.page.waitForSelector('.oxd-form');
  }

  async isReady(): Promise<boolean> {
    return await this.page.isVisible('.oxd-form');
  }

  async searchReview(employeeName: string): Promise<void> {
    await this.page.fill('input[placeholder="Type for hints..."]', employeeName);
    await this.page.click('.oxd-autocomplete-dropdown-option');
    await this.page.click('.oxd-button:has-text("Search")');
  }

  async addReview(review: {
    employee: string;
    reviewer: string;
    reviewPeriodStart: string;
    reviewPeriodEnd: string;
    dueDate: string;
  }): Promise<void> {
    await this.page.click('.oxd-button:has-text("Add")');
    await this.page.fill('input[name="review[employeeName]"]', review.employee);
    await this.page.fill('input[name="review[reviewerName]"]', review.reviewer);
    await this.page.fill('input[name="review[reviewPeriodStartDate]"]', review.reviewPeriodStart);
    await this.page.fill('input[name="review[reviewPeriodEndDate]"]', review.reviewPeriodEnd);
    await this.page.fill('input[name="review[dueDate]"]', review.dueDate);
    await this.page.click('.oxd-button:has-text("Save")');
  }

  async evaluateReview(employeeName: string, rating: number, comments: string): Promise<void> {
    await this.searchReview(employeeName);
    await this.page.click('.oxd-table-cell-action-edit');
    await this.page.fill('input[name="rating"]', rating.toString());
    await this.page.fill('textarea[name="comments"]', comments);
    await this.page.click('.oxd-button:has-text("Complete")');
  }
}
