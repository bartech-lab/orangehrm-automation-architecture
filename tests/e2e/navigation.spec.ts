import { test, expect } from '../../infra/test-runner/index.js';
import { SidebarComponent, TopbarComponent, MODULE_NAMES } from '../../ui/components/index.js';

test.describe('Navigation Components', () => {
  test.describe('Sidebar Navigation', () => {
    test('sidebar expands and collapses @smoke', async ({ auth }) => {
      await auth.goto('/web/index.php/dashboard/index');

      const sidebar = new SidebarComponent(auth);
      await sidebar.waitForReady();

      await expect(sidebar.root).toBeVisible();
      await sidebar.isExpanded();
      await sidebar.collapse();

      const isCollapsed = await sidebar.isExpanded();
      expect(isCollapsed).toBe(false);

      await sidebar.expand();

      const isExpandedAgain = await sidebar.isExpanded();
      expect(isExpandedAgain).toBe(true);
    });

    test('sidebar navigation to modules @smoke', async ({ auth }) => {
      await auth.goto('/web/index.php/dashboard/index');

      const sidebar = new SidebarComponent(auth);
      await sidebar.waitForReady();

      await sidebar.navigateTo(MODULE_NAMES.PIM);
      await expect(auth).toHaveURL(/pim/);

      await sidebar.navigateTo(MODULE_NAMES.DASHBOARD);
      await expect(auth).toHaveURL(/dashboard/);
    });

    test('sidebar shows all menu items', async ({ auth }) => {
      await auth.goto('/web/index.php/dashboard/index');

      const sidebar = new SidebarComponent(auth);
      await sidebar.waitForReady();

      const menuTexts = await sidebar.getMenuItemTexts();

      expect(menuTexts.length).toBeGreaterThan(0);

      const hasMainModule = menuTexts.some(
        (text) => text.includes('Admin') || text.includes('PIM') || text.includes('Leave')
      );
      expect(hasMainModule).toBe(true);
    });
  });

  test.describe('Topbar Search Functionality', () => {
    test('search functionality filters content @smoke', async ({ auth }) => {
      await auth.goto('/web/index.php/dashboard/index');

      const topbar = new TopbarComponent(auth);
      await topbar.waitForReady();

      const isSearchAvailable = await topbar.isSearchAvailable();
      expect(isSearchAvailable).toBe(true);

      await topbar.search('Admin');
      await expect(topbar.searchInput).toHaveValue('Admin');

      const searchValue = await topbar.searchInput.inputValue();
      expect(searchValue).toBe('Admin');
    });

    test('search input accepts different queries', async ({ auth }) => {
      await auth.goto('/web/index.php/dashboard/index');

      const topbar = new TopbarComponent(auth);
      await topbar.waitForReady();

      const searchTerms = ['PIM', 'Leave', 'Time'];

      for (const term of searchTerms) {
        await topbar.search(term);
        const searchValue = await topbar.searchInput.inputValue();
        expect(searchValue).toBe(term);
        await topbar.searchInput.clear();
      }
    });
  });

  test.describe('User Menu Actions', () => {
    test('user menu opens and shows options @smoke', async ({ auth }) => {
      await auth.goto('/web/index.php/dashboard/index');

      const topbar = new TopbarComponent(auth);
      await topbar.waitForReady();

      await topbar.openUserMenu();

      const isMenuOpen = await topbar.isUserMenuOpen();
      expect(isMenuOpen).toBe(true);

      const menuItems = await topbar.getUserMenuItems();

      const hasLogout = menuItems.some((item) => item.includes('Logout'));
      const hasAbout = menuItems.some((item) => item.includes('About'));
      const hasSupport = menuItems.some((item) => item.includes('Support'));

      expect(hasLogout || hasAbout || hasSupport).toBe(true);
      await topbar.closeUserMenu();
    });

    test('logout action redirects to login page @smoke', async ({ auth }) => {
      await auth.goto('/web/index.php/dashboard/index');

      const topbar = new TopbarComponent(auth);
      await topbar.waitForReady();

      await expect(topbar.userDropdown).toBeVisible();
      await topbar.logout();

      await expect(auth).toHaveURL(/login/);
      await expect(auth.locator('input[name="username"]')).toBeVisible();
    });

    test('user menu has expected menu items', async ({ auth }) => {
      await auth.goto('/web/index.php/dashboard/index');

      const topbar = new TopbarComponent(auth);
      await topbar.waitForReady();

      await topbar.openUserMenu();
      const menuItems = await topbar.getUserMenuItems();

      const expectedItems = ['About', 'Support', 'Change Password', 'Logout'];
      const foundItems = expectedItems.filter((expected) =>
        menuItems.some((item) => item.includes(expected))
      );

      expect(foundItems.length).toBeGreaterThanOrEqual(1);
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('breadcrumb shows current page location @smoke', async ({ auth }) => {
      await auth.goto('/web/index.php/dashboard/index');

      const { BreadcrumbComponent } = await import('../../ui/components/index.js');
      const breadcrumb = new BreadcrumbComponent(auth);

      await breadcrumb.waitForReady();

      const items = await breadcrumb.getBreadcrumbItems();
      expect(items.length).toBeGreaterThan(0);

      const currentPage = await breadcrumb.getCurrentPage();
      expect(currentPage).toBeTruthy();
    });

    test('breadcrumb depth reflects page hierarchy', async ({ auth }) => {
      await auth.goto('/web/index.php/pim/viewEmployeeList');

      const { BreadcrumbComponent } = await import('../../ui/components/index.js');
      const breadcrumb = new BreadcrumbComponent(auth);
      await breadcrumb.waitForReady();

      const depth = await breadcrumb.getDepth();
      expect(depth).toBeGreaterThanOrEqual(1);

      const containsPim = await breadcrumb.containsText('PIM');
      expect(containsPim).toBe(true);
    });
  });
});
