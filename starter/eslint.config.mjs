import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import sheriff from '@softarc/eslint-plugin-sheriff';

export default defineConfig(
  {
    ignores: ['**/*.yml', '**/*.yaml', '**/index.html', 'dist/**', '.angular/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    plugins: { unicorn },
    rules: {
      // Ban abbreviations: full unicorn default set + project-specific ones.
      'unicorn/prevent-abbreviations': [
        'error',
        {
          // Enforce on identifiers, not on the established *.utils.ts / *.prod.ts
          // file-naming conventions (the latter is also wired into angular.json).
          checkFilenames: false,
          replacements: {
            // Banned → suggested full form.
            qp: { queryParams: true },
            ctrl: { control: true },
            // Allowed domain / idiomatic words (kept short on purpose).
            param: false,
            params: false,
            req: false,
            fn: false,
            qty: false,
            env: false,
            ref: false,
            dev: false,
          },
          allowList: {
            props: true,
            args: true,
          },
        },
      ],
      // Ban single-letter identifiers (p, e, r, x, …); use full words.
      'id-length': [
        'error',
        { min: 2, properties: 'never', exceptions: ['_'] },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: ['app', 'dev'], style: 'camelCase' },
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: ['app', 'dev'], style: 'kebab-case' },
      ],
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      '@angular-eslint/template/attributes-order': 'warn',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'off',
    },
  },
  prettier,
  {
    files: ['**/*.ts'],
    rules: {
      curly: 'error',
    },
  },
  // Sheriff — module boundaries (deep-import / dependency-rule / encapsulation).
  {
    files: ['projects/**/*.ts'],
    extends: [sheriff.configs.all],
  },
);
