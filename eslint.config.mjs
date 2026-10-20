import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import unicorn from 'eslint-plugin-unicorn';
import sheriff from '@softarc/eslint-plugin-sheriff';
import dsPlugin from './eslint-rules/index.mjs';

export default defineConfig(
  {
    ignores: [
      '**/*.yml',
      '**/*.yaml',
      '**/index.html',
      'dist/**',
      '.angular/**',
      // Standalone decks: single-file HTML with inline scripts, written to be
      // opened straight from disk. They are not part of the app or the library,
      // and the app's rules (Angular templates, module syntax) do not apply.
      'decks/**',
    ],
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
    plugins: {
      ds: dsPlugin,
      unicorn,
    },
    rules: {
      'unicorn/prevent-abbreviations': [
        'warn',
        {
          extendDefaultReplacements: false,
          replacements: {
            ctrl: { control: true },
            u: { user: true },
            ct: { container: true },
            ctId: { containerId: true },
            pos: { position: true },
            v: { value: true },
            e: { event: true, error: true },
            el: { element: true },
            els: { elements: true },
            ro: { resizeObserver: true },
            p: { params: true, path: true },
            n: { name: true, note: true, node: true },
            s: { slug: true, segment: true, state: true },
            c: { container: true, country: true, context: true, char: true },
            pi: { item: true, productItem: true },
            svg: { svgElement: true },
            idx: { index: true },
            qty: { quantity: true },
          },
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: ['ds', 'app', 'docs'],
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: [
            'ds',
            'app',
            'docs',
            'page',
            'section',
            'pattern',
            'tweaks',
            'practice',
          ],
          style: 'kebab-case',
        },
      ],
      'padding-line-between-statements': [
        'warn',
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-for-of': 'warn',
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
    plugins: {
      ds: dsPlugin,
    },
    rules: {
      'ds/template/sibling-blank-line': 'warn',
      'ds/template/element-content-newline': 'warn',
      'ds/template/control-flow-condition-newline': 'warn',
      '@angular-eslint/template/attributes-order': 'warn',
      '@angular-eslint/template/click-events-have-key-events': 'warn',
      '@angular-eslint/template/interactive-supports-focus': 'warn',
      '@angular-eslint/template/label-has-associated-control': 'off',
      // ds-input exposes `autofocus` as a deliberate opt-in API; the consumer
      // owns the a11y decision. Off (not warn) — eslint --fix removes autofocus
      // even at warn level, which silently broke the binding once already.
      '@angular-eslint/template/no-autofocus': 'off',
    },
  },
  prettier,
  {
    files: ['**/*.ts'],
    rules: {
      curly: 'error',
    },
  },
  // Entry-point boundary inside the published library. OFF until per-component entry
  // points land (docs/todo.md → A3): it reports every existing cross-folder relative
  // import, and that count IS the size of that refactor. Flip to 'error' in the same
  // commit that finishes the rewrites — after that it is what stops a missed one from
  // surfacing as an unrelated-looking ng-packagr crash.
  {
    files: ['src/lib/**/*.ts'],
    rules: {
      'ds/entry-point-boundary': 'off',
    },
  },
  // Sheriff module boundaries — scoped to the ds-docs showcase only (NOT src/lib).
  // Sections can't import each other; see sheriff.config.ts. Encapsulation relaxed
  // so existing deep relative imports into shared/layout keep working.
  {
    files: ['ds-docs/src/**/*.ts'],
    extends: [sheriff.configs.all],
    rules: {
      '@softarc/sheriff/encapsulation': 'off',
    },
  },
);
