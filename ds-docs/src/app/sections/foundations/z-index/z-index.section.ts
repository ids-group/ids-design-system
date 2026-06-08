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
  template: `
    <section id="section-z-index" data-anchor="z-index" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Z-index</h2>
      <p class="lede t-m">
        One stacking contract. Components consume by name, never by raw number.
      </p>

      <table class="tbl">
        <thead><tr><th>Token</th><th>Value</th><th>Use</th></tr></thead>
        <tbody>
          @for (l of layers; track l.token) {
            <tr>
              <td><code class="t-mono">{{ l.token }}</code></td>
              <td><code class="t-mono">{{ l.value }}</code></td>
              <td>{{ l.use }}</td>
            </tr>
          }
        </tbody>
      </table>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }

    .tbl {
      width: 100%;
      margin-top: var(--s-6);
      border-collapse: collapse;
      font: var(--fw-regular) var(--fs-s)/var(--lh-base) var(--font-sans);
    }
    .tbl th, .tbl td {
      text-align: left;
      padding: var(--s-3) var(--s-4);
      border-bottom: var(--bw-default) solid var(--border-divider);
    }
    .tbl th {
      font: var(--fw-bold) var(--fs-xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }
    code.t-mono {
      font: var(--fw-regular) var(--fs-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--s-1);
      border-radius: var(--r-sm);
      color: var(--text-primary);
    }
  `],
})
export class ZIndexSection {
  protected readonly layers = LAYERS;
}
