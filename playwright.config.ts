import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';

/**
 * Get environment info for Allure reporting
 */
const getAllureEnvironmentInfo = () => ({
  OS: `${os.platform()} ${os.release()}`,
  'Node Version': process.version,
  'Playwright Version': require('@playwright/test/package.json').version,
  'Test Environment': process.env.NODE_ENV || 'development',
});

/**
 * Read environment variables from .env file
 */
dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Determine if running in CI environment
 */
const isCI = !!process.env.CI;

/**
 * Playwright configuration
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',

  use: {
    baseURL: 'https://opensource-demo.orangehrmlive.com',
    trace: 'on-first-retry',
  },

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: isCI,

  /* Retry on CI only */
  retries: isCI ? 1 : 0,

  /* Opt out of parallel tests on CI */
  workers: isCI ? 1 : 4,

  /* Timeout for each test */
  timeout: 60000,

  /* Reporter to use */
  reporter: [
    ['line'],
    ['html'],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        suiteTitle: true,
        environmentInfo: getAllureEnvironmentInfo(),
      },
    ],
  ],

  /* Run local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !isCI,
  // },
});
