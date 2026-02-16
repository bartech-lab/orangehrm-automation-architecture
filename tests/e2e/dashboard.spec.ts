import { test, expect } from '../../infra/test-runner/index.js';
import { DashboardPage, type ModuleName } from '../../ui/pages/dashboard-page.js';

const ALL_MODULES: ModuleName[] = [
  'Admin',
  'PIM',
  'Leave',
  'Time',
  'Recruitment',
  'Performance',
  'My Info',
  'Claim',
  'Buzz',
  'Directory',
];

test.describe('Dashboard Page', () => {
  test.describe('Basic Functionality', () => {
    test('dashboard loads after login', async ({ auth }) => {
      const dashboardPage = new DashboardPage(auth, '');

      await dashboardPage.navigate();
      await dashboardPage.waitForReady();

      await expect(auth).toHaveURL(/dashboard/);
      await expect(dashboardPage.topbarHeader).toBeVisible();
      await expect(dashboardPage.sidebar).toBeVisible();
    });

    test('welcome message is displayed', async ({ auth }) => {
      const dashboardPage = new DashboardPage(auth, '');

      await dashboardPage.navigate();
      await dashboardPage.waitForReady();

      const welcomeText = await dashboardPage.getWelcomeMessage();
      expect(welcomeText.length).toBeGreaterThan(0);
    });

    test('user name is displayed', async ({ auth }) => {
      const dashboardPage = new DashboardPage(auth, '');

      await dashboardPage.navigate();
      await dashboardPage.waitForReady();

      const userName = await dashboardPage.getCurrentUser();
      expect(userName.length).toBeGreaterThan(0);
    });
  });

  test.describe('Navigation', () => {
    for (const moduleName of ALL_MODULES) {
      test(`can navigate to ${moduleName} module`, async ({ auth }) => {
        const dashboardPage = new DashboardPage(auth, '');

        await dashboardPage.navigate();
        await dashboardPage.waitForReady();

        await dashboardPage.navigateTo(moduleName);

        const moduleUrlMap: Record<ModuleName, RegExp> = {
          Admin: /admin/,
          PIM: /pim/,
          Leave: /leave/,
          Time: /time/,
          Recruitment: /recruitment/,
          Performance: /performance/,
          'My Info': /pim\/viewPersonalDetails/,
          Claim: /claim/,
          Buzz: /buzz/,
          Directory: /directory/,
          Maintenance: /maintenance/,
        };

        await expect(auth).toHaveURL(moduleUrlMap[moduleName]);
      });
    }
  });

  test.describe('User Actions', () => {
    test('user dropdown opens', async ({ auth }) => {
      const dashboardPage = new DashboardPage(auth, '');

      await dashboardPage.navigate();
      await dashboardPage.waitForReady();

      await dashboardPage.openUserDropdown();

      await expect(dashboardPage.userDropdownMenu).toBeVisible();
      await expect(dashboardPage.logoutLink).toBeVisible();
    });

    test('logout functionality works', async ({ page }) => {
      const baseUrl = 'https://opensource-demo.orangehrmlive.com';
      const dashboardPage = new DashboardPage(page, baseUrl);

      await page.goto(`${baseUrl}/web/index.php/auth/login`);
      await page.fill('input[name="username"]', 'Admin');
      await page.fill('input[name="password"]', 'admin123');
      await page.click('button[type="submit"]');
      await page.waitForURL(/dashboard/);

      await dashboardPage.waitForReady();
      await dashboardPage.logout();

      await expect(page).toHaveURL(/auth\/login/);
      await expect(page.locator('input[name="username"]')).toBeVisible();
    });
  });

  test.describe('Mobile Viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('dashboard loads on mobile viewport', async ({ auth }) => {
      const dashboardPage = new DashboardPage(auth, '');

      await dashboardPage.navigate();
      await dashboardPage.topbarHeader.waitFor({ state: 'visible' });

      await expect(auth).toHaveURL(/dashboard/);
      await expect(dashboardPage.topbarHeader).toBeVisible();
    });

    test('navigation works on mobile viewport', async ({ auth }) => {
      await auth.goto('/web/index.php/pim/viewPimModule');
      await expect(auth).toHaveURL(/pim/);
    });

    test('user dropdown works on mobile viewport', async ({ auth }) => {
      const dashboardPage = new DashboardPage(auth, '');

      await dashboardPage.navigate();
      await dashboardPage.topbarHeader.waitFor({ state: 'visible' });

      await dashboardPage.openUserDropdown();

      await expect(dashboardPage.userDropdownMenu).toBeVisible();
    });
  });
});
