import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      '**/node_modules/',
      '**/dist/',
      '**/build/',
      '**/test-output/',
      '**/coverage/',
      '**/*.js',
    ],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',

      parserOptions: {
        project: './tsconfig.json',
      },
    },

    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  // Tests must use domain layer, not import UI or infra directly
  {
    files: ['tests/**/*.ts', 'tests/**/*.spec.ts'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../ui/**', '../../ui/**', '**/ui/**'],
              message: 'Tests must not import UI directly. Use domain/workflow layer instead.',
            },
            {
              group: ['../infra/**', '../../infra/**', '**/infra/**'],
              message:
                'Tests must not import infra directly. Use the custom test fixtures from infra/test-runner/fixtures.js instead.',
            },
            {
              group: ['../data/**', '../../data/**', '**/data/**'],
              message:
                'Tests must not import data layer directly. Use domain builders through fixtures.',
            },
            {
              group: ['tests/**/*'],
              message: 'Tests should not import from other test files.',
            },
          ],
        },
      ],
    },
  },
  // Domain (workflows) can import UI - this is the intended architecture
  // tests → domain → ui → playwright
  {
    files: ['domain/**/*.ts'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@playwright/test', '@playwright/test/*'],
              message:
                'Domain layer must not depend on Playwright test APIs. Page objects from UI layer should encapsulate Playwright.',
            },
            {
              group: ['../infra/**', '../../infra/**', '**/infra/**'],
              message:
                'Domain layer must not import from infrastructure layer. Use fixtures from infra/test-runner instead.',
            },
            {
              group: ['../tests/**', '../../tests/**', '**/tests/**'],
              message: 'Domain layer must not import from tests layer.',
            },
          ],
        },
      ],
    },
  },
  // UI layer must not import domain (enforces separation)
  {
    files: ['ui/**/*.ts'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../domain/**', '../../domain/**', '**/domain/**'],
              message:
                'UI layer must not import from domain layer. Page objects should accept primitive types or define their own interfaces.',
            },
            {
              group: ['../tests/**', '../../tests/**', '**/tests/**'],
              message: 'UI layer must not import from tests layer.',
            },
          ],
        },
      ],
    },
  },
  // Infrastructure layer protections
  {
    files: ['infra/**/*.ts'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../tests/**', '../../tests/**', '**/tests/**'],
              message: 'Infrastructure layer must not import from tests layer.',
            },
          ],
        },
      ],
    },
  },
  // Data layer protections
  {
    files: ['data/**/*.ts'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../ui/**', '../../ui/**', '**/ui/**'],
              message: 'Data layer must not import from UI layer.',
            },
            {
              group: ['../infra/**', '../../infra/**', '**/infra/**'],
              message: 'Data layer must not import from infrastructure layer.',
            },
            {
              group: ['../tests/**', '../../tests/**', '**/tests/**'],
              message: 'Data layer must not import from tests layer.',
            },
          ],
        },
      ],
    },
  },
];
