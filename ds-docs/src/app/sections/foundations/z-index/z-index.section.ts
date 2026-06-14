import { Component, ViewEncapsulation } from '@angular/core';

interface LayerRow {
  readonly token: string;
  readonly value: string;
  readonly use: string;
}

const LAYERS: readonly LayerRow[] = [
  { token: '--layer-base',     value: '0',    use: 'Default flow. No stacking context.' },
  { token: '--layer-raised',   value: '1',    use: 'Subtle elevation — table sticky cells, hover lifts.' },
  { token: '--layer-sticky',   value: '100',  use: 'Sticky page headers, sticky filters.' },
  { token: '--layer-dropdown', value: '1000', use: '<ds-select>, <ds-menu>, <ds-date-picker> panels.' },
  { token: '--layer-overlay',  value: '1100', use: 'Generic CDK overlay panels.' },
  { token: '--layer-drawer',   value: '1200', use: '<ds-drawer> slide-in panel.' },
  { token: '--layer-modal',    value: '1300', use: '<ds-modal> + scrim layer.' },
  { token: '--layer-popover',  value: '1400', use: '<ds-popover> + <ds-combobox> dropdown.' },
  { token: '--layer-toast',    value: '1500', use: '<ds-toast-region> portal.' },
  { token: '--layer-tooltip',  value: '1600', use: '[dsTooltip] panel — must sit above toasts.' },
];

@Component({
  selector: 'section-foundations-z-index',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './z-index.section.html',
  styleUrl: './z-index.section.scss',
})
export class ZIndexSection {
  protected readonly layers = LAYERS;
}
