import { Component, ViewEncapsulation } from '@angular/core';

interface RadiusStop {
  readonly name: string;
  readonly value: string;
  readonly desc: string;
}

const RADII: readonly RadiusStop[] = [
  { name: '0',    value: '0px',    desc: 'Squared surfaces — middle of btn-group, in-range datepicker' },
  { name: 'sm',   value: '4px',    desc: 'kbd, indeterminate-checkbox tick, link focus halo' },
  { name: 'md',   value: '8px',    desc: 'Buttons, fields, tooltips, search, segmented, tags' },
  { name: 'lg',   value: '12px',   desc: 'Menus, popovers, dropdowns, cards, modals, drawers, toasts, empty-state icons' },
  { name: '2xl',  value: '24px',   desc: 'Heroic surfaces — reserved, no current consumer' },
  { name: 'pill', value: '999px',  desc: 'Pills, status chips, switches, avatars, segmented thumb' },
];

@Component({
  selector: 'section-foundations-radius',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './radius.section.html',
  styleUrl: './radius.section.scss',
})
export class RadiusSection {
  protected readonly radii = RADII;
}
