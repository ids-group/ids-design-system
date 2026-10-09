import { Component, ViewEncapsulation } from '@angular/core';
import { IconComponent } from 'ds/icons';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface TokenPair {
  readonly title: string;
  readonly why: string;
  readonly good: string;
  readonly bad: string;
}

@Component({
  selector: 'practice-token-discipline',
  standalone: true,
  imports: [DocsSectionComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './token-discipline.section.html',
  styleUrl: './token-discipline.section.scss',
})
export class TokenDisciplineSection {
  protected readonly stylelintSnippet = `// .stylelintrc.json
{
  "plugins": ["@ids-group-ltd/ids-design-system/stylelint"],
  "rules": { "ids-design-system/no-removed-tokens": true }
}`;

  protected readonly eslintSnippet = `// eslint.config.mjs
import idsDesignSystem from '@ids-group-ltd/ids-design-system/eslint';

export default [
  // ...your TypeScript and template blocks
  idsDesignSystem.configs.recommended,
];`;

  protected readonly lede =
    'Every padding, colour, radius, border, font size and motion curve in component CSS reads a token.';

  protected readonly pairs: TokenPair[] = [
    {
      title: 'Spacing',
      why: 'Density change or rebrand should propagate without code edits.',
      good: 'padding: var(--space-2) var(--space-3);',
      bad: 'padding: 8px 12px;',
    },
    {
      title: 'Colours',
      why: 'Dark mode and theme swaps work through semantic roles — literals bypass the contract.',
      good: 'color: var(--text-secondary);\nborder-color: var(--border-default);',
      bad: 'color: #555;\nborder-color: #ccc;',
    },
    {
      title: 'Radii',
      why: 'Sharp-vs-soft rebrand requires every radius configurable from one place.',
      good: 'border-radius: var(--radius-md);',
      bad: 'border-radius: 12px;',
    },
    {
      title: 'Borders',
      why: 'Width and colour both move through tokens — keeps the system coherent under hi-DPI.',
      good: 'border: var(--border-width-default) solid var(--border-default);',
      bad: 'border: 1px solid #ddd;',
    },
    {
      title: 'Typography',
      why: 'The type ramp is governed centrally — a one-line edit re-tunes every component.',
      good: 'font: var(--font-weight-medium) var(--font-size-m)/var(--line-height-base) var(--font-sans);',
      bad: 'font: 500 16px/1.5 -apple-system, sans-serif;',
    },
    {
      title: 'Motion',
      why: 'Motion taste varies per client; one set of curves keeps the product feeling like one product.',
      good: 'transition: opacity var(--duration-fast) var(--ease-standard);',
      bad: 'transition: opacity 200ms cubic-bezier(.4, 0, .2, 1);',
    },
  ];
}
