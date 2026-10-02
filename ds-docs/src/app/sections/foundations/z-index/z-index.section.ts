import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface LayerRow {
  readonly token: string;
  readonly value: string;
  readonly use: string;
}

const LAYERS: readonly LayerRow[] = [
  {
    token: '--layer-base',
    value: '0',
    use: 'Default flow. No stacking context.',
  },
  {
    token: '--layer-raised',
    value: '1',
    use: 'Table sticky cells, button focus, loading overlay.',
  },
  {
    token: '--layer-sticky',
    value: '100',
    use: 'Reserved for app use; no DS component reads it.',
  },
  {
    token: '--layer-dropdown',
    value: '1000',
    use: 'Reserved; DS dropdown panels sit at --layer-popover.',
  },
  {
    token: '--layer-overlay',
    value: '1100',
    use: 'Reserved for app use; no DS component reads it.',
  },
  {
    token: '--layer-drawer',
    value: '1200',
    use: '<ds-app-layout> mobile rail.',
  },
  {
    token: '--layer-modal',
    value: '1300',
    use: '<ds-modal>, <ds-drawer>, <ds-bottom-sheet> + scrim.',
  },
  {
    token: '--layer-popover',
    value: '1400',
    use: '<ds-popover> and the shared dropdown panel (select, multi-select, autocomplete).',
  },
  { token: '--layer-toast', value: '1500', use: '<ds-toast-region> portal.' },
  {
    token: '--layer-tooltip',
    value: '1600',
    use: '[dsTooltip] panel — must sit above toasts.',
  },
];

const COMPONENT_LAYERS: readonly LayerRow[] = [
  {
    token: '--table-sticky-header-z',
    value: '--layer-raised',
    use: 'Sticky table header cells.',
  },
  {
    token: '--table-sticky-col-z',
    value: '--layer-raised',
    use: 'Sticky table column cells.',
  },
  {
    token: '--table-sticky-corner-z',
    value: '2',
    use: 'Cell where a sticky header meets a sticky column.',
  },
  {
    token: '--btn-focus-z',
    value: '--layer-raised',
    use: 'A focused button above its neighbours.',
  },
  {
    token: '--btn-group-focus-z',
    value: '2',
    use: 'A focused segment in a button group or split button.',
  },
];

@Component({
  selector: 'section-foundations-z-index',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './z-index.section.html',
  styleUrl: './z-index.section.scss',
})
export class ZIndexSection {
  protected readonly layers = LAYERS;
  protected readonly componentLayers = COMPONENT_LAYERS;
}
