import { Component, ViewEncapsulation } from '@angular/core';

interface ShadowTier {
  readonly name: string;
  readonly value: string;
  readonly desc: string;
}

interface AppliedDemo {
  readonly token: string;
  readonly label: string;
  readonly desc: string;
  readonly stage: 'card' | 'popover' | 'toast' | 'modal';
}

interface TruncRow {
  readonly field: string;
  readonly behaviour: string;
}

const PRIMITIVE_TIERS: ShadowTier[] = [
  {
    name: 'z100',
    value: '0 1px 2px / 0 1px 3px',
    desc: 'Subtle lift — cards at rest, raised rows',
  },
  {
    name: 'z200',
    value: '0 4px 8px / 0 4px 16px',
    desc: 'Popovers, dropdowns, command palette',
  },
  {
    name: 'z300',
    value: '0 8px 16px / 0 16px 32px',
    desc: 'Toasts, larger floating surfaces',
  },
  {
    name: 'z400',
    value: '0 16px 32px / 0 24px 48px',
    desc: 'Modals, drawers, max-elevation chrome',
  },
];

const SEMANTIC_TIERS: ShadowTier[] = [
  { name: 'shadow-card',    value: 'alias → --z100', desc: 'Card at rest' },
  { name: 'shadow-popover', value: 'alias → --z200', desc: 'Popovers, dropdowns, combobox' },
  { name: 'shadow-toast',   value: 'alias → --z300', desc: 'Toasts, floating notifications' },
  { name: 'shadow-modal',   value: 'alias → --z400', desc: 'Modals, drawers' },
];

const APPLIED: AppliedDemo[] = [
  {
    token: 'shadow-card',
    label: 'Card · shadow-card',
    desc: 'Surface that sits on the canvas.',
    stage: 'card',
  },
  {
    token: 'shadow-popover',
    label: 'Popover · shadow-popover',
    desc: 'Anchored floating menu.',
    stage: 'popover',
  },
  {
    token: 'shadow-toast',
    label: 'Toast · shadow-toast',
    desc: 'Transient overlay above content.',
    stage: 'toast',
  },
  {
    token: 'shadow-modal',
    label: 'Modal · shadow-modal',
    desc: 'Max-elevation chrome above scrim.',
    stage: 'modal',
  },
];

const TRUNC: TruncRow[] = [
  {
    field: 'Primitive vs semantic',
    behaviour: 'Components consume semantic tokens (--shadow-popover, --shadow-modal). Never reach for --z200 / --z400 directly.',
  },
  {
    field: 'Theme tinting',
    behaviour: 'Shadows are channel-split through --shadow-tint-h/s/l. Dark themes override --shadow-tint-l to render the same alphas as soft light glows.',
  },
  {
    field: 'Stacking',
    behaviour: 'Elevation communicates depth visually. Use --layer-* tokens for actual z-index stacking — never compose your own.',
  },
];

@Component({
  selector: 'section-foundations-elevation',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './elevation.section.html',
  styleUrl: './elevation.section.scss',
})
export class ElevationSection {
  protected readonly primitive = PRIMITIVE_TIERS;
  protected readonly semantic = SEMANTIC_TIERS;
  protected readonly applied = APPLIED;
  protected readonly trunc = TRUNC;
}
