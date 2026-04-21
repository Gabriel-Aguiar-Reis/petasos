// @ts-check
const tseslint = require('@typescript-eslint/eslint-plugin')
const tsParser = require('@typescript-eslint/parser')

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'android/**',
      'coverage/**',
      '*.config.js',
      'babel.config.js',
      'metro.config.js',
      'tailwind.config.js',
      'eslint.config.js',
    ],
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      // Treat Prettier formatting issues as ESLint errors. Install
      // `eslint-plugin-prettier` and (optionally) `eslint-config-prettier`.
      'prettier/prettier': 'error',
    },
  },
  {
    // Domain purity: domain layer must not import from Expo, React Native,
    // Drizzle, rrule, infra, or components. (FR-031)
    files: ['src/domain/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            'expo*',
            'react-native*',
            'drizzle-orm*',
            'rrule*',
            '@/src/infra/*',
            '@/src/components/*',
          ],
        },
      ],
    },
  },
]
