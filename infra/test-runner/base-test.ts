import { test as base, type Page } from '@playwright/test';
import { AuthHelper } from '../auth/auth-helper.js';

export interface TestFixtures {
  authenticatedPage: Page;
  authHelper: AuthHelper;
  testData: Map<string, unknown>;
}

export interface TestOptions {
  baseUrl: string;
  credentials: {
    username: string;
    password: string;
  };
}

export const test = base.extend<TestFixtures & TestOptions>({
  baseUrl: ['https://opensource-demo.orangehrmlive.com', { option: true }],
  credentials: [{ username: 'Admin', password: 'admin123' }, { option: true }],

  authHelper: async ({ page, baseUrl, credentials }, use) => {
    const authHelper = new AuthHelper(page, baseUrl, credentials);
    await use(authHelper);
  },

  authenticatedPage: async ({ page, authHelper }, use) => {
    await authHelper.login();
    await use(page);
    await authHelper.logout();
  },

  testData: async ({}, use) => {
    const testData = new Map<string, unknown>();
    await use(testData);
  },
});

export { expect, type Page } from '@playwright/test';
