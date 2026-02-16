import { test, expect } from '../../../infra/test-runner/index.js';
import { PerformanceReviewsPage } from '../../../ui/pages/performance/performance-reviews-page.js';

test.describe('Performance - Reviews', () => {
  test('should view performance reviews', async ({ auth }) => {
    const reviewsPage = new PerformanceReviewsPage(auth);
    await reviewsPage.navigate();
    await expect(auth.locator('.oxd-form')).toBeVisible();
  });

  test('should search for review', async ({ auth }) => {
    const reviewsPage = new PerformanceReviewsPage(auth);
    await reviewsPage.navigate();
    await reviewsPage.searchReview('Admin');
    await expect(auth.locator('.oxd-table')).toBeVisible();
  });

  test('should add performance review', async ({ auth }) => {
    const reviewsPage = new PerformanceReviewsPage(auth);
    await reviewsPage.navigate();
    await reviewsPage.addReview({
      employee: 'Admin',
      reviewer: 'Admin',
      reviewPeriodStart: '2024-01-01',
      reviewPeriodEnd: '2024-06-30',
      dueDate: '2024-07-15',
    });
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });

  test('should evaluate review', async ({ auth }) => {
    const reviewsPage = new PerformanceReviewsPage(auth);
    await reviewsPage.navigate();
    await reviewsPage.evaluateReview('Admin', 5, 'Excellent performance');
    await expect(auth.locator('.oxd-toast')).toBeVisible();
  });
});
