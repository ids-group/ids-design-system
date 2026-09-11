import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

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

const PRIMITIVE_TIERS: ShadowTier[] = [
  {
    name: 'shadow-1',
    value: '0 1px 2px / 0 1px 3px',
    desc: 'Subtle lift — cards at rest, raised rows',
  },
  {
    name: 'shadow-2',
    value: '0 4px 8px / 0 4px 16px',
    desc: 'Popovers, dropdowns, command palette',
  },
  {
    name: 'shadow-3',
    value: '0 8px 16px / 0 16px 32px',
    desc: 'Toasts, larger floating surfaces',
  },
  {
    name: 'shadow-4',
    value: '0 16px 32px / 0 24px 48px',
    desc: 'Modals, drawers, max-elevation chrome',
  },
];

const SEMANTIC_TIERS: ShadowTier[] = [
  { name: 'shadow-card', value: 'alias → --shadow-1', desc: 'Card at rest' },
  {
    name: 'shadow-popover',
    value: 'alias → --shadow-2',
    desc: 'Popovers, dropdowns, autocomplete',
  },
  {
    name: 'shadow-toast',
    value: 'alias → --shadow-3',
    desc: 'Toasts, floating notifications',
  },
  {
    name: 'shadow-modal',
    value: 'alias → --shadow-4',
    desc: 'Modals, drawers',
  },
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

@Component({
  selector: 'section-foundations-elevation',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './elevation.section.html',
  styleUrl: './elevation.section.scss',
})
export class ElevationSection {
  protected readonly primitive = PRIMITIVE_TIERS;
  protected readonly semantic = SEMANTIC_TIERS;
  protected readonly applied = APPLIED;
}
