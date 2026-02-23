import { test, expect } from '../../../infra/test-runner/index.js';
import { HRMSystem } from '../../../domain/hrm-system.js';

test.describe('PIM - Reports', () => {
  test.describe.configure({ mode: 'serial' });

  test('should view available reports', async ({ auth }) => {
    const hrmSystem = new HRMSystem(auth);
    const reportsView = await hrmSystem.viewPimReports();

    expect(reportsView.hasResultsTable).toBe(true);
  });

  test('should run predefined report', async ({ auth }) => {
    const hrmSystem = new HRMSystem(auth);
    const reportRun = await hrmSystem.runPredefinedPimReport('Employee');

    expect(reportRun.success || reportRun.hasResultsTable).toBe(true);
  });

  test('should search for report', async ({ auth }) => {
    const hrmSystem = new HRMSystem(auth);
    const searchResult = await hrmSystem.searchPimReport('Employee');

    expect(searchResult.success).toBe(true);
    expect(searchResult.hasResultsTable).toBe(true);
  });

  test('should configure custom report', async ({ auth }) => {
    const hrmSystem = new HRMSystem(auth);
    const configurationView = await hrmSystem.openPimCustomReportConfiguration();

    expect(configurationView.success).toBe(true);
    expect(configurationView.hasResultsTable).toBe(true);
  });
});
