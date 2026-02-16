# OrangeHRM Playwright Test Framework

A comprehensive end-to-end test automation framework for OrangeHRM using Playwright, TypeScript, and the Page Object Model pattern.

## Architecture Overview

This framework follows a layered architecture:

```
┌─────────────────────────────────────┐
│         Test Layer (tests/)         │
│  - E2E tests, User journeys, API    │
├─────────────────────────────────────┤
│         UI Layer (ui/)              │
│  - Page Objects, Components         │
├─────────────────────────────────────┤
│      Domain Layer (domain/)         │
│  - Entities, Types, Builders        │
├─────────────────────────────────────┤
│    Infrastructure (infra/)          │
│  - Fixtures, Config, Auth           │
├─────────────────────────────────────┤
│       Data Layer (data/)            │
│  - Builders, Fixtures, Seeds        │
└─────────────────────────────────────┘
```

## Features

- **Page Object Model**: Maintainable page classes with reusable components
- **Domain-Driven Design**: Type-safe entities and builders for test data
- **Fixture-Based Auth**: Pre-authenticated pages with auto-cleanup
- **Multi-Browser Support**: Chromium, Firefox, WebKit
- **Mobile Testing**: Responsive design testing
- **Allure Reporting**: Beautiful HTML reports with screenshots
- **CI/CD Ready**: GitHub Actions workflows for PR checks and regression
- **TypeScript**: Full type safety with strict mode

## Project Structure

```
├── api/                    # API client and endpoints
├── data/                   # Test data builders and fixtures
│   ├── builders/          # Data builders (Employee, Leave, etc.)
│   └── fixtures/          # JSON fixtures and test files
├── domain/                # Domain entities and types
│   ├── auth/
│   ├── employee/
│   └── leave/
├── infra/                 # Infrastructure and configuration
│   ├── auth/             # Authentication handling
│   ├── config/           # Test configuration
│   └── test-runner/      # Fixtures and test setup
├── tests/                 # Test suites
│   ├── e2e/              # End-to-end tests
│   │   ├── admin/        # Admin module tests
│   │   ├── leave/        # Leave module tests
│   │   ├── performance/  # Performance module tests
│   │   ├── pim/          # PIM module tests
│   │   ├── recruitment/  # Recruitment module tests
│   │   └── time/         # Time module tests
│   └── journeys/         # User journey tests
├── ui/                    # Page objects and components
│   ├── components/       # Reusable UI components
│   └── pages/           # Page objects
│       ├── admin/
│       ├── leave/
│       ├── performance/
│       ├── pim/
│       ├── recruitment/
│       └── time/
├── playwright.config.ts   # Playwright configuration
├── allure-categories.json # Allure report categories
└── package.json
```

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
npx playwright install
```

### Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/e2e/login.spec.ts

# Run with UI mode
npx playwright test --ui

# Run in headed mode
npx playwright test --headed

# Run specific project (browser)
npx playwright test --project=chromium
```

### Viewing Reports

```bash
# Generate and open Allure report
npm run test:allure

# View Playwright HTML report
npx playwright show-report
```

## Test Data

The framework uses builders for generating realistic test data:

```typescript
import { EmployeeBuilder } from './data/builders/employee-builder';

const employee = new EmployeeBuilder()
  .withFirstName('John')
  .withLastName('Doe')
  .withJobTitle('Software Engineer')
  .build();
```

## Page Objects

Example of using page objects:

```typescript
import { test } from './infra/test-runner';
import { LoginPage } from './ui/pages/login-page';

test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('Admin', 'admin123');
});
```

## CI/CD

### GitHub Actions

- **PR Checks**: Runs on every pull request
- **Regression**: Runs daily at 2 AM UTC on weekdays
- **Allure Reports**: Published to GitHub Pages

## License

MIT
