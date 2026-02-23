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

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['tests/**/*'],
              message: 'Tests should not import from other test files. Use fixtures instead.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['tests/**/*.ts', 'tests/**/*.spec.ts'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../ui/**', '../../ui/**', '**/ui/**'],
              message:
                'LAYER VIOLATION: Tests must not import from UI layer. Tests should only import from domain layer for types. Use fixtures from infra/test-runner for page objects.',
            },
            {
              group: ['../infra/**', '../../infra/**', '**/infra/**'],
              message:
                'LAYER VIOLATION: Tests must not import from infra layer directly. Use the custom test fixtures from infra/test-runner/fixtures.js instead.',
            },
            {
              group: ['../data/**', '../../data/**', '**/data/**'],
              message:
                'LAYER VIOLATION: Tests must not import from data layer. Test data should be created via domain builders or passed through fixtures.',
            },
          ],
        },
      ],
    },
  },
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
                'LAYER VIOLATION: Domain layer must not depend on Playwright. Domain types should be pure TypeScript with no framework dependencies.',
            },
            {
              group: ['../ui/**', '../../ui/**', '**/ui/**'],
              message:
                'LAYER VIOLATION: Domain layer must not import from UI layer. Domain is the core layer with no upward dependencies.',
            },
            {
              group: ['../infra/**', '../../infra/**', '**/infra/**'],
              message:
                'LAYER VIOLATION: Domain layer must not import from infrastructure layer. Domain is the core layer with no upward dependencies.',
            },
            {
              group: ['../data/**', '../../data/**', '**/data/**'],
              message:
                'LAYER VIOLATION: Domain layer must not import from data layer. Domain defines types; data layer implements builders for those types.',
            },
            {
              group: ['../tests/**', '../../tests/**', '**/tests/**'],
              message: 'LAYER VIOLATION: Domain layer must not import from tests layer.',
            },
          ],
        },
      ],
    },
  },
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
                'LAYER VIOLATION: UI layer must not import from domain layer. Page objects should accept primitive types or define their own interfaces. This enforces UI/domain separation.',
            },
            {
              group: ['../tests/**', '../../tests/**', '**/tests/**'],
              message: 'LAYER VIOLATION: UI layer must not import from tests layer.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['infra/**/*.ts'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../tests/**', '../../tests/**', '**/tests/**'],
              message: 'LAYER VIOLATION: Infrastructure layer must not import from tests layer.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['data/**/*.ts'],

    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../ui/**', '../../ui/**', '**/ui/**'],
              message: 'LAYER VIOLATION: Data layer must not import from UI layer.',
            },
            {
              group: ['../infra/**', '../../infra/**', '**/infra/**'],
              message: 'LAYER VIOLATION: Data layer must not import from infrastructure layer.',
            },
            {
              group: ['../tests/**', '../../tests/**', '**/tests/**'],
              message: 'LAYER VIOLATION: Data layer must not import from tests layer.',
            },
          ],
        },
      ],
    },
  },
];
