import { test as baseTest, expect } from '@playwright/test';
import type { Page, TestInfo } from '@playwright/test';
import { AuthHelper } from '../auth/auth-helper';

// Types for fixture definitions
export interface TestFixtures {
  auth: Page;
  hrmPage: Page;
  testData: TestDataFactory;
}

export interface WorkerFixtures {
  // Worker-scoped fixtures if needed
}

export interface TestDataFactory {
  createUser(overrides?: Partial<UserData>): UserData;
  createEmployee(overrides?: Partial<EmployeeData>): EmployeeData;
  getUniqueString(prefix?: string): string;
}

export interface UserData {
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export interface EmployeeData {
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
}

// Test data factory implementation
function createTestDataFactory(): TestDataFactory {
  let counter = 0;

  return {
    createUser(overrides: Partial<UserData> = {}): UserData {
      counter++;
      return {
        username: `testuser_${Date.now()}_${counter}`,
        password: 'TestPassword123!',
        role: 'user',
        ...overrides,
      };
    },

    createEmployee(overrides: Partial<EmployeeData> = {}): EmployeeData {
      counter++;
      const uniqueId = `${Date.now()}_${counter}`;
      return {
        firstName: 'Test',
        lastName: `Employee_${uniqueId}`,
        employeeId: `EMP${uniqueId}`,
        email: `test.employee_${uniqueId}@example.com`,
        ...overrides,
      };
    },

    getUniqueString(prefix = 'test'): string {
      counter++;
      return `${prefix}_${Date.now()}_${counter}`;
    },
  };
}

// Extended test with all fixtures
export const test = baseTest.extend<TestFixtures & WorkerFixtures>({
  // ==================== Core Fixtures ====================

  /**
   * Pre-authenticated page fixture
   * Returns a page with user already logged in
   */
  auth: async ({ page }, use, testInfo) => {
    const baseUrl = testInfo.project.use?.baseURL || 'https://opensource-demo.orangehrmlive.com';
    const credentials = {
      username: process.env.TEST_USERNAME || 'Admin',
      password: process.env.TEST_PASSWORD || 'admin123',
    };

    const authHelper = new AuthHelper(page, baseUrl, credentials);
    await authHelper.login();
    
    await use(page);
    
    // Cleanup: logout after test
    await authHelper.logout();
  },

  /**
   * HRM Page fixture - composite page object placeholder
   * Provides a ready-to-use page with common HRM context
   */
  hrmPage: async ({ auth: page }, use) => {
    // Additional HRM-specific setup could go here
    // e.g., setting default timeouts, HRM-specific headers
    
    await use(page);
  },

  /**
   * Test data factory fixture
   * Provides utilities for generating test data
   */
  testData: async ({}, use) => {
    const factory = createTestDataFactory();
    await use(factory);
  },

  // ==================== Auto-Fixtures ====================

  /**
   * Auto-fixture: Failure capture
   * Takes screenshot on test failure
   */
  failureCapture: [
    async ({ page }, use, testInfo) => {
      await use(undefined);

      // After test, check if it failed
      if (testInfo.status !== testInfo.expectedStatus) {
        const screenshotPath = testInfo.outputPath(`failure-${testInfo.retry}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        testInfo.attachments.push({
          name: 'failure-screenshot',
          path: screenshotPath,
          contentType: 'image/png',
        });
      }
    },
    { auto: true },
  ],

  /**
   * Auto-fixture: Test logger
   * Logs test start and end with timing
   */
  testLogger: [
    async ({}, use, testInfo) => {
      const startTime = Date.now();
      console.log(`[TEST START] ${testInfo.titlePath.join(' > ')}`);
      
      await use(undefined);
      
      const duration = Date.now() - startTime;
      const status = testInfo.status === testInfo.expectedStatus ? 'PASSED' : 'FAILED';
      console.log(`[TEST ${status}] ${testInfo.titlePath.join(' > ')} (${duration}ms)`);
    },
    { auto: true },
  ],
});

// Re-export expect for convenience
export { expect };

// Export types for consumers
export type { Page, TestInfo } from '@playwright/test';
