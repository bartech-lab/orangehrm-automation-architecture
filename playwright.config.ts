import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import os from 'os';
import { fileURLToPath } from 'url';

const getAllureEnvironmentInfo = () => ({
  OS: `${os.platform()} ${os.release()}`,
  'Node Version': process.version,
  'Test Environment': process.env.NODE_ENV || 'development',
});

dotenv.config({ path: fileURLToPath(new URL('.env', import.meta.url)) });

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
  timeout: 45000,

  /* Reporter to use */
  reporter: [
    ['line'],
    ['json', { outputFile: 'playwright-report.json' }],
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
