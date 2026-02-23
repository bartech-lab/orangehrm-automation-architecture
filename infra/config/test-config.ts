/**
 * Supported test environments
 */
export type TestEnvironment = 'local' | 'staging' | 'production';

/**
 * Resolves the current test environment from TEST_ENV env var
 */
function resolveEnvironment(): TestEnvironment {
  const env = process.env.TEST_ENV;
  if (env === 'local' || env === 'staging' || env === 'production') {
    return env;
  }
  return 'local';
}

export interface TestConfig {
  baseUrl: string;
  credentials: {
    admin: {
      username: string;
      password: string;
    };
  };
  timeouts: {
    action: number;
    navigation: number;
    expect: number;
    test: number;
  };
  browser: {
    viewport: {
      width: number;
      height: number;
    };
    screenshotOnFailure: boolean;
    traceOnFailure: boolean;
    videoOnFailure: boolean;
  };
}

/**
 * Environment-specific base configurations
 */
const environmentConfigs: Record<TestEnvironment, Partial<TestConfig>> = {
  local: {
    baseUrl: 'https://opensource-demo.orangehrmlive.com',
    credentials: {
      admin: {
        username: 'Admin',
        password: 'admin123',
      },
    },
  },
  staging: {
    baseUrl: 'https://staging.orangehrmlive.com',
    // Credentials should be provided via env vars for staging
  },
  production: {
    baseUrl: 'https://production.orangehrmlive.com',
    // Credentials MUST be provided via env vars for production
  },
};

/**
 * Default timeout and browser configuration (shared across environments)
 */
const sharedDefaults: Omit<TestConfig, 'baseUrl' | 'credentials'> = {
  timeouts: {
    action: 15000,
    navigation: 30000,
    expect: 10000,
    test: 60000,
  },
  browser: {
    viewport: {
      width: 1920,
      height: 1080,
    },
    screenshotOnFailure: true,
    traceOnFailure: true,
    videoOnFailure: false,
  },
};

/**
 * Resolves a value with environment variable precedence:
 * 1. Explicit env var (if set and non-empty)
 * 2. Fallback value from environment config
 */
function resolveEnvVar(envVar: string | undefined, fallback: string): string {
  return envVar && envVar.trim() !== '' ? envVar : fallback;
}

/**
 * Builds a complete TestConfig for the specified environment
 * Environment variables take precedence over environment defaults
 */
function buildConfig(env: TestEnvironment): TestConfig {
  const envConfig = environmentConfigs[env];
  const defaultCreds = envConfig.credentials?.admin ?? { username: '', password: '' };

  return {
    baseUrl: resolveEnvVar(process.env.BASE_URL, envConfig.baseUrl ?? 'https://opensource-demo.orangehrmlive.com'),
    credentials: {
      admin: {
        username: resolveEnvVar(process.env.ADMIN_USERNAME, defaultCreds.username),
        password: resolveEnvVar(process.env.ADMIN_PASSWORD, defaultCreds.password),
      },
    },
    timeouts: sharedDefaults.timeouts,
    browser: sharedDefaults.browser,
  };
}

/**
 * Current resolved environment
 */
export const currentEnvironment: TestEnvironment = resolveEnvironment();

/**
 * Default config - resolves based on TEST_ENV with env var precedence
 * Maintains backward compatibility for existing consumers
 */
export const defaultConfig: TestConfig = buildConfig(currentEnvironment);

export const selectors = {
  loginForm: {
    usernameInput: 'input[name="username"]',
    passwordInput: 'input[name="password"]',
    submitButton: 'button[type="submit"]',
  },
  navigation: {
    userDropdown: '.oxd-userdropdown',
    logoutLink: 'text=Logout',
  },
  common: {
    toast: '.oxd-toast',
    table: '.oxd-table',
    modal: '.oxd-dialog',
    form: '.oxd-form',
  },
} as const;
