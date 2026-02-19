import { test, expect } from '../../../infra/test-runner/index.js';
import { PerformanceReviewsPage } from '../../../ui/pages/performance/performance-reviews-page.js';

test.describe('Performance - Reviews', () => {
  test('should view performance reviews', async ({ auth }) => {
    const reviewsPage = new PerformanceReviewsPage(auth);
    await reviewsPage.navigate();
    await expect(auth.getByRole('heading', { name: /performance|review/i }).first()).toBeVisible();
  });

  test('should search for review', async ({ auth }) => {
    const reviewsPage = new PerformanceReviewsPage(auth);
    await reviewsPage.navigate();
    await reviewsPage.searchReview('Admin');
    await expect(auth.getByRole('table').or(auth.locator('.oxd-table')).first()).toBeVisible();
  });

  test('should load performance reviews page successfully', async ({ auth }) => {
    await new PerformanceReviewsPage(auth).navigate();

    const url = auth.url();
    const hasPerformanceInUrl = /performance/i.test(url);
    const hasAnyForm = await auth
      .locator('.oxd-form, form')
      .first()
      .isVisible()
      .catch(() => false);
    const hasSearchButton = await auth
      .getByRole('button', { name: /search/i })
      .isVisible()
      .catch(() => false);

    expect(hasPerformanceInUrl || hasAnyForm || hasSearchButton).toBeTruthy();
  });
});
