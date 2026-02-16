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

export const defaultConfig: TestConfig = {
  baseUrl: 'https://opensource-demo.orangehrmlive.com',
  credentials: {
    admin: {
      username: 'Admin',
      password: 'admin123',
    },
  },
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
