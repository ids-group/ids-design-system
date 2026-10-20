import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface PagePattern {
  readonly name: string;
  readonly madeOf: string;
  readonly missed: string;
}

interface CompositionCheck {
  readonly rule: string;
  readonly how: string;
}

const PATTERNS: readonly PagePattern[] = [
  {
    name: 'List + filters',
    madeOf: 'page header · filter bar · table (or a card list) · pagination',
    missed: 'Filters above the data, pagination below it, both full width',
  },
  {
    name: 'Record detail',
    madeOf:
      'page header with [meta] · 8+4 grid — main left, meta sidebar right',
    missed: 'The sidebar is metadata, never navigation',
  },
  {
    name: 'Form',
    madeOf: 'page header · one card per section · actions in the last card',
    missed: 'One primary; submit stays enabled until the first error',
  },
  {
    name: 'Dashboard',
    madeOf: 'page header · a row of stat tiles · charts or tables below',
    missed: 'Tiles are one row that wraps, not a grid you hand-place',
  },
  {
    name: 'Empty / error',
    madeOf:
      'an empty state centred in the region that would have held the data',
    missed: 'It replaces the region, not the page — header and filters stay',
  },
];

const CHECKS: readonly CompositionCheck[] = [
  {
    rule: 'Every gap is a token',
    how: 'A literal px will not follow [data-density]. Grep the diff for px outside a token declaration.',
  },
  {
    rule: 'Every span is a column',
    how: 'col-span-* on .page-grid, and the split is 8+4, 6+6 or 9+3. If a region needs 7+5, the content is wrong, not the grid.',
  },
  {
    rule: 'One grid per page',
    how: 'A sub-region aligns to the page tracks. A local display:grid with its own columns is how alignment drifts one screen at a time.',
  },
  {
    rule: 'Nested radii decrease',
    how: 'inner < control < panel. Two nested surfaces with the same radius is a defect you can see once you look for it.',
  },
  {
    rule: 'One primary per region',
    how: 'One solid button per header, card and modal footer.',
  },
  {
    rule: 'Prose is capped',
    how: '--col-cap-text (720px) regardless of grid width.',
  },
];

@Component({
  selector: 'pattern-page-composition',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './page-composition.section.html',
  styleUrl: './page-composition.section.scss',
})
export class PageCompositionSection {
  protected readonly patterns = PATTERNS;
  protected readonly checks = CHECKS;
}
