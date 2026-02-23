import { test, expect } from '../../infra/test-runner/fixtures.js';
import type { Credentials } from '../../domain/auth/types.js';
import { HRMSystem } from '../../domain/hrm-system.js';

test.describe('Login Functionality', () => {
  let hrmSystem: HRMSystem;

  test.beforeEach(async ({ page }) => {
    hrmSystem = new HRMSystem(page);
  });

  test('@auth @smoke - Valid login with Admin credentials', async () => {
    const credentials: Credentials = {
      username: 'Admin',
      password: 'admin123',
    };

    const loginAttempt = await hrmSystem.attemptLogin(credentials);

    expect(loginAttempt.isLoggedIn).toBe(true);
  });

  test('@auth - Invalid credentials show error message', async () => {
    const credentials: Credentials = {
      username: 'InvalidUser',
      password: 'wrongpassword',
    };

    const loginAttempt = await hrmSystem.attemptLogin(credentials);

    expect(loginAttempt.hasError).toBe(true);

    expect(loginAttempt.errorMessage).toContain('Invalid');
  });

  test('@auth - Empty fields validation', async () => {
    const credentials: Credentials = {
      username: '',
      password: '',
    };

    const loginAttempt = await hrmSystem.attemptLogin(credentials);

    expect(loginAttempt.currentUrl).toContain('/auth/login');

    expect(loginAttempt.isLoginPageReady).toBe(true);
  });
});
