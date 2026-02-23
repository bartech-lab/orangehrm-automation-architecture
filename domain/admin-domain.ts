import { JobTitlesPage } from '../ui/pages/admin/job/job-titles-page.js';
import { OrganizationPage } from '../ui/pages/admin/organization/organization-page.js';
import { UserManagementPage } from '../ui/pages/admin/user-management-page.js';

type AdminDomainPage = ConstructorParameters<typeof UserManagementPage>[0];

export interface AdminTableViewResult {
  hasResultsTable: boolean;
}

export interface AdminPageLoadResult {
  hasExpectedUrl: boolean;
  hasResultsTable: boolean;
  hasContextHeading: boolean;
  hasPrimaryAction: boolean;
  isLoaded: boolean;
}

export interface OrganizationInfoResult {
  isVisible: boolean;
}

export class AdminDomain {
  private readonly userManagementPage: UserManagementPage;
  private readonly jobTitlesPage: JobTitlesPage;
  private readonly organizationPage: OrganizationPage;

  constructor(private readonly page: AdminDomainPage) {
    this.userManagementPage = new UserManagementPage(page);
    this.jobTitlesPage = new JobTitlesPage(page);
    this.organizationPage = new OrganizationPage(page);
  }

  async searchSystemUser(username: string): Promise<AdminTableViewResult> {
    await this.userManagementPage.navigate();
    await this.userManagementPage.waitForReady();
    await this.userManagementPage.searchUser(username);
    return {
      hasResultsTable: await this.userManagementPage.isReady(),
    };
  }

  async openUserManagement(): Promise<AdminPageLoadResult> {
    await this.userManagementPage.navigate();
    await this.userManagementPage.waitForReady();

    const [hasResultsTable, hasPrimaryAction] = await Promise.all([
      this.userManagementPage.isReady(),
      this.page
        .getByRole('button', { name: /add/i })
        .first()
        .isVisible()
        .catch(() => false),
    ]);
    const hasExpectedUrl = /admin/i.test(this.page.url());

    return {
      hasExpectedUrl,
      hasResultsTable,
      hasContextHeading: false,
      hasPrimaryAction,
      isLoaded: hasExpectedUrl || hasResultsTable || hasPrimaryAction,
    };
  }

  async viewJobTitles(): Promise<AdminTableViewResult> {
    await this.jobTitlesPage.navigate();
    await this.jobTitlesPage.waitForReady();
    return {
      hasResultsTable: await this.jobTitlesPage.isReady(),
    };
  }

  async openJobTitles(): Promise<AdminPageLoadResult> {
    await this.jobTitlesPage.navigate();
    await this.jobTitlesPage.waitForReady();

    const [hasResultsTable, hasContextHeading] = await Promise.all([
      this.jobTitlesPage.isReady(),
      this.page
        .getByRole('heading')
        .first()
        .isVisible()
        .catch(() => false),
    ]);
    const hasExpectedUrl = /jobTitle|admin/i.test(this.page.url());

    return {
      hasExpectedUrl,
      hasResultsTable,
      hasContextHeading,
      hasPrimaryAction: false,
      isLoaded: hasExpectedUrl || hasResultsTable || hasContextHeading,
    };
  }

  async openOrganizationInfo(): Promise<OrganizationInfoResult> {
    await this.organizationPage.navigate();
    await this.organizationPage.waitForReady();

    const isVisible = await this.page
      .getByRole('heading', { name: /organization|general information/i })
      .first()
      .isVisible()
      .catch(() => false);

    return { isVisible };
  }

  async openOrganizationLocations(): Promise<AdminPageLoadResult> {
    await this.organizationPage.navigate();
    await this.organizationPage.waitForReady();
    await this.organizationPage.navigateToLocations();

    const [hasResultsTable, hasContextHeading] = await Promise.all([
      this.page
        .getByRole('table')
        .or(this.page.locator('.oxd-table'))
        .first()
        .isVisible()
        .catch(() => false),
      this.page
        .getByRole('heading')
        .first()
        .isVisible()
        .catch(() => false),
    ]);
    const hasExpectedUrl = /location/i.test(this.page.url());

    return {
      hasExpectedUrl,
      hasResultsTable,
      hasContextHeading,
      hasPrimaryAction: false,
      isLoaded: hasExpectedUrl || hasResultsTable || hasContextHeading,
    };
  }
}
