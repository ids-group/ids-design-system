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
    desc: 'Subtle lift - raised cards, slider thumb',
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

const ROLE_TIERS: ShadowTier[] = [
  {
    name: 'ds-elevation-raised',
    value: '→ --shadow-1',
    desc: 'Segmented selected thumb',
  },
  {
    name: 'ds-elevation-overlay',
    value: '→ --shadow-2',
    desc: 'Popover, tooltip, date and time picker panels',
  },
  {
    name: 'ds-elevation-floating',
    value: '→ --shadow-3',
    desc: 'Toasts, through --shadow-toast',
  },
  {
    name: 'ds-elevation-modal',
    value: '→ --shadow-4',
    desc: 'Modal, drawer, app-layout mobile rail',
  },
];

const SEMANTIC_TIERS: ShadowTier[] = [
  {
    name: 'shadow-card',
    value: 'alias → --ds-elevation-raised',
    desc: 'Raised surfaces (slider thumb, colour-picker swatch); ds-card is flat by default, elevation="raised" uses --shadow-1',
  },
  {
    name: 'shadow-popover',
    value: 'alias → --ds-elevation-overlay',
    desc: 'Shared dropdown panel, table columns panel, colour-picker panel',
  },
  {
    name: 'shadow-toast',
    value: 'alias → --ds-elevation-floating',
    desc: 'Toasts, floating notifications',
  },
  {
    name: 'shadow-modal',
    value: 'alias → --ds-elevation-modal',
    desc: 'For app surfaces; ds-modal and ds-drawer read --ds-elevation-modal directly',
  },
];

const APPLIED: AppliedDemo[] = [
  {
    token: 'shadow-card',
    label: 'Card · shadow-card',
    desc: 'Raised surface on the canvas.',
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
  protected readonly roles = ROLE_TIERS;
  protected readonly semantic = SEMANTIC_TIERS;
  protected readonly applied = APPLIED;
}
