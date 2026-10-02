import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface RadiusStop {
  readonly name: string;
  readonly value: string;
  readonly desc: string;
}

const RADII: readonly RadiusStop[] = [
  {
    name: '0',
    value: '0px',
    desc: 'Squared surfaces — middle of btn-group, in-range datepicker',
  },
  {
    name: 'sm',
    value: '4px',
    desc: 'kbd, indeterminate-checkbox tick, link focus halo',
  },
  {
    name: 'md',
    value: '8px',
    desc: 'Buttons, fields, tooltips, search, segmented, tags',
  },
  {
    name: 'lg',
    value: '12px',
    desc: 'Menus, popovers, dropdowns, cards, modals, drawers, toasts, empty-state icons',
  },
  {
    name: 'xl',
    value: '16px',
    desc: 'Reserved, no current consumer',
  },
  {
    name: '2xl',
    value: '24px',
    desc: 'Heroic surfaces — reserved, no current consumer',
  },
  {
    name: 'pill',
    value: '999px',
    desc: 'Pills, status chips, switches, avatars, segmented thumb',
  },
];

interface RadiusRole {
  readonly token: string;
  readonly resolves: string;
  readonly desc: string;
}

const ROLES: readonly RadiusRole[] = [
  {
    token: '--ds-radius-inner',
    resolves: '--radius-sm',
    desc: 'Nested INSIDE a control — a tick, a kbd cap, a focus halo, a segment',
  },
  {
    token: '--ds-radius-control',
    resolves: '--radius-md',
    desc: 'The control itself — button, field, tag, tooltip, segmented, search',
  },
  {
    token: '--ds-radius-panel',
    resolves: '--radius-lg',
    desc: 'A surface that CONTAINS controls — card, menu, popover, modal, drawer, toast',
  },
  {
    token: '--ds-radius-pill',
    resolves: '--radius-pill',
    desc: 'Round by meaning, not by size — avatar, badge, radio, progress track',
  },
];
@Component({
  selector: 'section-foundations-radius',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './radius.section.html',
  styleUrl: './radius.section.scss',
})
export class RadiusSection {
  protected readonly radii = RADII;
  protected readonly roles = ROLES;
}
