import { Component, ViewEncapsulation } from '@angular/core';
import { DividerComponent } from 'ds';

interface WidthRow {
  readonly token: string;
  readonly value: string;
  readonly use: string;
}

interface RoleRow {
  readonly token: string;
  readonly use: string;
}

const WIDTHS: readonly WidthRow[] = [
  { token: '--bw-default', value: '1 px', use: 'Every border, divider, field outline' },
  { token: '--bw-strong',  value: '2 px', use: 'Radio dot, slider thumb, tabs underline, focus ring inner band, dropzone dash' },
];

const ROLES: readonly RoleRow[] = [
  { token: '--border-default',  use: 'Default field / card / table cell' },
  { token: '--border-strong',   use: 'Hover field, emphasised separation' },
  { token: '--border-subtle',   use: 'Faint section separation inside cards' },
  { token: '--border-divider',  use: 'Horizontal rules, list-row separators' },
  { token: '--border-inverted', use: 'Borders on dark surfaces' },
];

@Component({
  selector: 'section-foundations-borders',
  standalone: true,
  imports: [DividerComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-borders" data-anchor="borders" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Borders &amp; dividers</h2>
      <p class="lede t-m">
        Two widths × five roles. Width carries semantic weight: hairline for everything,
        regular for inputs, strong for emphasis (selected radio, slider thumb, focus rings).
      </p>

      <h3 class="block-title t-h4">Widths</h3>
      <div class="widths">
        @for (width of widths; track width.token) {
          <div class="width-cell">
            <div class="width-cell__stage" [style.border-width]="'var(' + width.token + ')'"></div>
            <div class="width-cell__val t-s-bold">{{ width.value }}</div>
            <code class="t-mono width-cell__tok">{{ width.token }}</code>
            <div class="t-xs width-cell__use">{{ width.use }}</div>
          </div>
        }
      </div>

      <h3 class="block-title t-h4">Border colour roles</h3>
      <table class="roles">
        <thead><tr><th>Token</th><th>Use</th><th>Sample</th></tr></thead>
        <tbody>
          @for (role of roles; track role.token) {
            <tr>
              <td><code class="t-mono">{{ role.token }}</code></td>
              <td>{{ role.use }}</td>
              <td><span class="role-swatch" [style.border-color]="'var(' + role.token + ')'"></span></td>
            </tr>
          }
        </tbody>
      </table>

      <h3 class="block-title t-h4">Divider component</h3>
      <div class="divider-demo">
        <p class="t-s demo-label">Plain divider</p>
        <ds-divider />
        <p class="t-s demo-label">Strong divider</p>
        <ds-divider variant="strong" />
        <p class="t-s demo-label">Labelled divider</p>
        <ds-divider variant="label">Recently viewed</ds-divider>
        <p class="t-s demo-label">Vertical divider</p>
        <div class="divider-vertical-row">
          <span class="t-s">Item one</span>
          <ds-divider variant="vertical" />
          <span class="t-s">Item two</span>
          <ds-divider variant="vertical" />
          <span class="t-s">Item three</span>
        </div>
      </div>

      <h3 class="block-title t-h4">Divider spacing</h3>
      <p class="block-desc t-s">
        <code class="t-mono">[spacing]</code> controls the vertical gap above and below the rule.
        Defaults to <code class="t-mono">"md"</code> — pick <code class="t-mono">"none"</code> when the parent owns spacing.
      </p>
      <div class="divider-demo">
        <p class="t-s demo-label">spacing="none"</p>
        <span class="t-s">Before</span>
        <ds-divider spacing="none" />
        <span class="t-s">After</span>
        <p class="t-s demo-label">spacing="sm"</p>
        <span class="t-s">Before</span>
        <ds-divider spacing="sm" />
        <span class="t-s">After</span>
        <p class="t-s demo-label">spacing="lg"</p>
        <span class="t-s">Before</span>
        <ds-divider spacing="lg" />
        <span class="t-s">After</span>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }

    .widths {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: var(--s-4);
      margin-top: var(--s-3);
    }
    .width-cell { display: flex; flex-direction: column; gap: var(--s-1); }
    .width-cell__stage {
      height: 60px;
      border-radius: var(--r-md);
      background: var(--surface-default);
      border-style: solid;
      border-color: var(--text-primary);
    }
    .width-cell__val { margin-top: var(--s-2); }
    .width-cell__tok { font-size: 11px; color: var(--text-secondary); }
    .width-cell__use { color: var(--text-secondary); margin-top: var(--s-1); line-height: 1.5; }

    .roles {
      width: 100%;
      margin-top: var(--s-3);
      border-collapse: collapse;
      font: var(--fw-regular) var(--fs-s)/var(--lh-base) var(--font-sans);
    }
    .roles th, .roles td {
      text-align: left;
      padding: var(--s-3) var(--s-4);
      border-bottom: var(--bw-default) solid var(--border-divider);
    }
    .roles th {
      font: var(--fw-bold) var(--fs-xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }
    .role-swatch {
      display: inline-block;
      width: 80px;
      height: 24px;
      background: var(--surface-default);
      border: var(--bw-default) solid;
      border-radius: var(--r-sm);
    }

    .divider-demo {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
    }
    .demo-label { color: var(--text-secondary); margin: var(--s-3) 0 var(--s-2); }
    .demo-label:first-child { margin-top: 0; }
    .divider-vertical-row {
      display: flex;
      align-items: center;
      margin-top: var(--s-2);
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
export class BordersSection {
  protected readonly widths = WIDTHS;
  protected readonly roles = ROLES;
}
