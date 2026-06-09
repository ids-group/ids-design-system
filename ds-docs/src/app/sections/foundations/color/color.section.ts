import { Component, ViewEncapsulation } from '@angular/core';
import {
  BadgeComponent,
  PageHeaderComponent,
  SidenavComponent,
  SidenavItemComponent,
  StatusDotComponent,
  TabComponent,
  TabsComponent,
} from 'ds';

interface SemanticSwatch {
  readonly name: string;
  readonly token: string;
  readonly inverted?: boolean;
}

interface SemanticGroup {
  readonly label: string;
  readonly swatches: readonly SemanticSwatch[];
}

interface RampSpec {
  readonly label: string;
  readonly desc: string;
  readonly prefix: string;
  readonly stops: readonly number[];
}

@Component({
  selector: 'section-foundations-color',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  imports: [
    BadgeComponent,
    PageHeaderComponent,
    SidenavComponent,
    SidenavItemComponent,
    StatusDotComponent,
    TabComponent,
    TabsComponent,
  ],
  template: `
    <section id="section-color" data-anchor="color" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Colour</h2>
      <p class="lede t-m">
        Three layers: raw ramps (50&ndash;950) &rarr; semantic role tokens (surface, border, text, status) &rarr; component tokens.
        Components only consume role tokens, so a brand re-skin propagates without code changes.
      </p>

      <!-- ============================================================ Secondary role -->
      <h3 class="block-title t-h4">Secondary role</h3>
      <p class="block-desc t-s">
        The <code class="t-mono">--secondary</code> family is the DS's secondary colour role &mdash; a complementary tone for non-interactive emphasis (active rails, decorative indicators, accent pills).
        Defaults at <code class="t-mono">:root</code> alias <code class="t-mono">--secondary</code> to <code class="t-mono">--primary</code> so unbranded apps render unchanged; per-brand overrides introduce a true secondary hue.
        Secondary is <em>not</em> a second CTA &mdash; primary action stays on <code class="t-mono">--primary</code>. Opt-in adoptions: <code class="t-mono">&lt;ds-tabs class="secondary"&gt;</code>, <code class="t-mono">&lt;ds-badge variant="secondary"&gt;</code>, sidenav active rail, stat delta neutral.
      </p>
      <div class="role-grid">
        <div class="role-group">
          <div class="t-overline">Secondary</div>
          <div class="swatch">
            <div class="swatch__chip" [style.background]="'var(--secondary)'"></div>
            <div class="swatch__meta">
              <div class="t-s-bold">secondary</div>
              <code class="swatch__token t-mono">--secondary</code>
              <code class="swatch__value t-mono">var(--secondary)</code>
            </div>
          </div>
          <div class="swatch">
            <div class="swatch__chip" [style.background]="'var(--secondary-strong)'"></div>
            <div class="swatch__meta">
              <div class="t-s-bold">secondary-strong</div>
              <code class="swatch__token t-mono">--secondary-strong</code>
              <code class="swatch__value t-mono">var(--secondary-strong)</code>
            </div>
          </div>
          <div class="swatch">
            <div class="swatch__chip" [style.background]="'var(--secondary-subtle)'"></div>
            <div class="swatch__meta">
              <div class="t-s-bold">secondary-subtle</div>
              <code class="swatch__token t-mono">--secondary-subtle</code>
              <code class="swatch__value t-mono">var(--secondary-subtle)</code>
            </div>
          </div>
          <div class="swatch">
            <div class="swatch__chip" [style.background]="'var(--secondary-on)'"></div>
            <div class="swatch__meta">
              <div class="t-s-bold">secondary-on</div>
              <code class="swatch__token t-mono">--secondary-on</code>
              <code class="swatch__value t-mono">var(--secondary-on)</code>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================================ Secondary in use -->
      <h3 class="block-title t-h4">Secondary in use</h3>
      <p class="block-desc t-s">Live opt-in adoptions of <code class="t-mono">--secondary</code>. Default theme renders these identically to <code class="t-mono">--primary</code>; override via <code class="t-mono">[data-brand="..."]</code> to see the secondary hue.</p>
      <div class="secondary-demos">
        <div class="demo">
          <div class="t-overline">ds-badge</div>
          <ds-badge [variant]="secondaryVariant">Override 15%</ds-badge>
          <code class="t-mono">&lt;ds-badge variant="secondary"&gt;</code>
        </div>
        <div class="demo">
          <div class="t-overline">ds-tabs.secondary</div>
          <ds-tabs class="secondary">
            <ds-tab label="Overview" />
            <ds-tab label="Splits" />
            <ds-tab label="History" />
          </ds-tabs>
          <code class="t-mono">&lt;ds-tabs class="secondary"&gt;</code>
        </div>
        <div class="demo">
          <div class="t-overline">ds-sidenav-item (active rail)</div>
          <ds-sidenav>
            <ds-sidenav-item label="Inactive" icon="users" />
            <ds-sidenav-item label="Active" icon="layers" [active]="true" />
            <ds-sidenav-item label="Inactive" icon="settings" />
          </ds-sidenav>
          <code class="t-mono">&lt;ds-sidenav-item [active]="true"&gt;</code>
        </div>
        <div class="demo">
          <div class="t-overline">ds-status-dot status="secondary"</div>
          <div style="display: inline-flex; align-items: center; gap: 8px;">
            <ds-status-dot status="secondary" /> Custom state
          </div>
          <code class="t-mono">&lt;ds-status-dot status="secondary"&gt;</code>
        </div>
        <div class="demo">
          <div class="t-overline">ds-page-header.eyebrow-secondary</div>
          <ds-page-header class="eyebrow-secondary" eyebrow="Forecast" title="Q3 outlook" subtitle="Secondary-toned eyebrow" />
          <code class="t-mono">&lt;ds-page-header class="eyebrow-secondary"&gt;</code>
        </div>
        <div class="demo">
          <div class="t-overline">stat .delta.secondary</div>
          <div class="stat-demo">
            <div class="stat">
              <div class="label">Forecast</div>
              <div class="value">12.4k</div>
              <div class="delta secondary">+8% projected</div>
            </div>
          </div>
          <code class="t-mono">&lt;div class="delta secondary"&gt;</code>
        </div>
        <div class="demo">
          <div class="t-overline">ds-card — CSS override</div>
          <p class="t-s">No dedicated variant. If a consumer needs an accent stripe, style it inline — single-rule override, no new API surface:</p>
          <code class="t-mono">&lt;ds-card style="border-top: 3px solid var(--secondary)"&gt;</code>
        </div>
      </div>
      <p class="block-desc t-s">All adoptions are opt-in (use a class or variant input). Default theme aliases <code class="t-mono">--secondary</code> to <code class="t-mono">--primary</code> so unbranded apps see no visual difference. Under <code class="t-mono">[data-brand="manage-my"]</code>, <code class="t-mono">--secondary</code> is Coral (#FF6156) &mdash; these examples then render in the brand accent.</p>

      <!-- ============================================================ Semantic groups -->
      <h3 class="block-title t-h4">Semantic roles</h3>
      <p class="block-desc t-s">What components actually consume. Re-skinning means remapping these to a different ramp &mdash; the components don't change.</p>
      <div class="role-grid">
        @for (group of groups; track group.label) {
          <div class="role-group">
            <div class="t-overline">{{ group.label }}</div>
            @for (swatch of group.swatches; track swatch.token) {
              <div class="swatch">
                <div class="swatch__chip" [style.background]="'var(' + swatch.token + ')'"></div>
                <div class="swatch__meta">
                  <div class="t-s-bold" [style.color]="swatch.inverted ? 'var(--text-inverted)' : 'var(--text-primary)'">{{ swatch.name }}</div>
                  <code class="swatch__token t-mono">{{ swatch.token }}</code>
                  <code class="swatch__value t-mono">var({{ swatch.token }})</code>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- ============================================================ Primitive ramps -->
      <h3 class="block-title t-h4">Primitive ramps</h3>
      <p class="block-desc t-s">Raw colour ramps. Stop names map 1:1 to CSS custom properties (e.g. <code class="t-mono">--blue-600</code>).</p>
      @for (ramp of ramps; track ramp.prefix) {
        <div class="ramp">
          <div class="ramp__head">
            <div class="t-overline">{{ ramp.label }}</div>
            <div class="ramp__desc t-s">{{ ramp.desc }}</div>
          </div>
          <div class="ramp__row">
            @for (stop of ramp.stops; track stop) {
              <div class="ramp__stop">
                <div class="ramp__chip" [style.background]="'var(--' + ramp.prefix + '-' + stop + ')'">
                  <span class="ramp__num t-mono">{{ stop }}</span>
                </div>
                <code class="ramp__var t-mono">--{{ ramp.prefix }}-{{ stop }}</code>
              </div>
            }
          </div>
        </div>
      }

      <!-- ============================================================ Halo proof -->
      <h3 class="block-title t-h4">Focus halo proof</h3>
      <p class="block-desc t-s">
        Outer halo is composed from brand HSL channels &mdash; a re-skin of <code class="t-mono">--primary-h</code> propagates straight into focus state.
        Inner ring reads <code class="t-mono">--surface-canvas</code> so it stays visible across themes.
      </p>
      <div class="halo-stage">
        <div class="halo-cell">
          <div class="halo-stage__well">
            <button class="halo-demo halo-demo--ring" type="button">Focus ring</button>
          </div>
          <div class="halo-cell__label">
            <div class="halo-cell__title">--focus-ring</div>
            <code class="t-mono">2px canvas + 4px brand</code>
          </div>
        </div>
        <div class="halo-cell">
          <div class="halo-stage__well">
            <button class="halo-demo halo-demo--field" type="button">Field halo</button>
          </div>
          <div class="halo-cell__label">
            <div class="halo-cell__title">--focus-field</div>
            <code class="t-mono">3px brand &alpha; 0.22</code>
          </div>
        </div>
        <div class="halo-cell">
          <div class="halo-stage__well">
            <button class="halo-demo halo-demo--error" type="button">Danger ring</button>
          </div>
          <div class="halo-cell__label">
            <div class="halo-cell__title">--focus-ring-error</div>
            <code class="t-mono">2px canvas + 4px danger</code>
          </div>
        </div>
        <div class="halo-cell">
          <div class="halo-stage__well halo-stage__well--inverted">
            <button class="halo-demo halo-demo--inverted" type="button">Inverted</button>
          </div>
          <div class="halo-cell__label">
            <div class="halo-cell__title">--focus-ring-inverted</div>
            <code class="t-mono">on dark surface</code>
          </div>
        </div>
      </div>

      <!-- ============================================================ Surface contrast -->
      <h3 class="block-title t-h4">Surface contrast</h3>
      <p class="block-desc t-s">
        The "paper" surfaces. <code class="t-mono">--surface-default</code> is the card; <code class="t-mono">--surface-secondary</code> is the hover lane / table head;
        <code class="t-mono">--select-bg</code> is the text-selection tint derived from brand.
      </p>
      <div class="surface-stage">
        <div class="surface-cell" style="background: var(--surface-canvas)">
          <div class="surface-cell__label">canvas</div>
          <code class="t-mono">--surface-canvas</code>
        </div>
        <div class="surface-cell" style="background: var(--surface-default)">
          <div class="surface-cell__label">default</div>
          <code class="t-mono">--surface-default</code>
        </div>
        <div class="surface-cell" style="background: var(--surface-secondary)">
          <div class="surface-cell__label">secondary</div>
          <code class="t-mono">--surface-secondary</code>
        </div>
        <div class="surface-cell" style="background: var(--surface-tint)">
          <div class="surface-cell__label">tint</div>
          <code class="t-mono">--surface-tint</code>
        </div>
        <div class="surface-cell surface-cell--select">
          <div class="surface-cell__label">selection</div>
          <code class="t-mono">--select-bg</code>
          <p class="surface-cell__sample t-s">The quick brown fox <span class="surface-cell__selected">jumps over</span> the lazy dog.</p>
        </div>
        <div class="surface-cell surface-cell--inverted" style="background: var(--surface-inverted)">
          <div class="surface-cell__label">inverted</div>
          <code class="t-mono">--surface-inverted</code>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }
    code.t-mono { font-size: var(--fs-2xs); }

    /* ---------- Semantic groups ---------- */
    .role-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--s-5); margin-top: var(--s-4); }
    .role-group { display: grid; gap: var(--s-2); align-content: start; }
    .swatch { display: grid; grid-template-columns: 56px 1fr; gap: var(--s-3); align-items: center; padding: var(--s-2); background: var(--surface-default); border: var(--bw-default) solid var(--border-divider); border-radius: var(--r-md); }
    .swatch__chip { height: 40px; width: 56px; border-radius: var(--r-sm); border: var(--bw-default) solid var(--border-subtle); }
    .swatch__meta { display: grid; gap: var(--s-0-5); min-width: 0; }
    .swatch__token { color: var(--text-tertiary); }
    .swatch__value { color: var(--text-muted); }

    /* ---------- Primitive ramps ---------- */
    .ramp { margin-top: var(--s-5); }
    .ramp__head { display: flex; align-items: baseline; gap: var(--s-3); flex-wrap: wrap; }
    .ramp__desc { color: var(--text-secondary); }
    .ramp__row { display: grid; grid-template-columns: repeat(auto-fit, minmax(72px, 1fr)); gap: var(--s-2); margin-top: var(--s-2); }
    .ramp__stop { display: grid; gap: var(--s-1); }
    .ramp__chip { height: 64px; border-radius: var(--r-md); border: var(--bw-default) solid var(--border-subtle); display: flex; align-items: flex-end; padding: var(--s-1-5); }
    .ramp__num { font-size: var(--fs-3xs); color: var(--text-primary); mix-blend-mode: difference; filter: invert(1); }
    .ramp__var { font-size: var(--fs-3xs); color: var(--text-tertiary); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* ---------- Halo proof ---------- */
    .halo-stage { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--s-4); margin-top: var(--s-3); padding: var(--s-5); background: var(--surface-secondary); border-radius: var(--r-lg); }
    .halo-cell { display: grid; gap: var(--s-3); justify-items: center; }
    .halo-stage__well { display: grid; place-items: center; width: 100%; min-height: 96px; padding: var(--s-5); background: var(--surface-default); border: var(--bw-default) solid var(--border-default); border-radius: var(--r-md); }
    .halo-stage__well--inverted { background: var(--surface-inverted); border-color: var(--border-inverted); }
    .halo-demo { font: var(--fw-bold) var(--fs-s)/var(--lh-flat) var(--font-sans); padding: var(--s-2) var(--s-4); background: var(--primary); color: var(--primary-on); border: var(--bw-default) solid transparent; border-radius: var(--r-md); cursor: pointer; }
    .halo-demo--ring { box-shadow: var(--focus-ring); }
    .halo-demo--field { background: var(--surface-default); color: var(--text-primary); border-color: var(--primary); box-shadow: var(--focus-field); }
    .halo-demo--error { background: var(--error); color: var(--text-on-error); box-shadow: var(--focus-ring-error); }
    .halo-demo--inverted { background: var(--surface-inverted); color: var(--text-inverted); box-shadow: var(--focus-ring-inverted); }
    .halo-cell__label { text-align: center; display: grid; gap: var(--s-0-5); }
    .halo-cell__title { font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans); letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary); }

    /* ---------- Surface contrast ---------- */
    .surface-stage { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--s-3); margin-top: var(--s-3); padding: var(--s-5); background: var(--surface-canvas); border: var(--bw-default) solid var(--border-divider); border-radius: var(--r-lg); }
    .surface-cell { display: grid; gap: var(--s-2); align-content: start; min-height: 120px; padding: var(--s-4); border: var(--bw-default) solid var(--border-divider); border-radius: var(--r-md); }
    .surface-cell__label { font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans); letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary); }
    .surface-cell--select { background: var(--surface-default); }
    .surface-cell__sample { color: var(--text-secondary); margin: 0; }
    .surface-cell__selected { background: var(--select-bg); color: var(--text-primary); padding: 0 var(--s-0-5); }
    .surface-cell--inverted { border-color: var(--border-inverted); }
    .surface-cell--inverted .surface-cell__label { color: var(--neutral-300); }
    .surface-cell--inverted code { color: var(--neutral-400); }

    /* ---------- Secondary in use ---------- */
    .secondary-demos { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: var(--s-4); margin-top: var(--s-3); }
    .secondary-demos .demo { padding: var(--s-4); background: var(--surface-default); border: var(--bw-default) solid var(--border-divider); border-radius: var(--r-md); display: flex; flex-direction: column; gap: var(--s-3); align-items: flex-start; }
    .secondary-demos .demo > .t-overline { color: var(--text-tertiary); }
    .secondary-demos .demo > code.t-mono { color: var(--text-tertiary); }
    .secondary-demos .demo ds-tabs,
    .secondary-demos .demo ds-sidenav,
    .secondary-demos .demo ds-page-header { width: 100%; }

    /* Hand-rolled stat replica so we can showcase .delta.secondary
       without adding a new typed input to ds-stat. */
    .stat-demo .stat { background: var(--surface-default); border: var(--bw-default) solid var(--border-divider); border-radius: var(--r-lg); padding: var(--s-5); }
    .stat-demo .label { font: var(--fw-bold) var(--fs-xs)/var(--lh-base) var(--font-sans); letter-spacing: var(--ls-wider); text-transform: uppercase; color: var(--text-tertiary); margin: 0 0 var(--s-2); }
    .stat-demo .value { font: var(--fw-extrabold) var(--fs-h2)/var(--lh-flat) var(--font-sans); letter-spacing: var(--ls-snug); color: var(--text-primary); margin: 0; white-space: nowrap; }
    .stat-demo .delta { display: inline-flex; align-items: center; gap: var(--s-1); font: var(--fw-bold) var(--fs-xs)/var(--lh-base) var(--font-sans); margin-top: var(--s-2); }
    .stat-demo .delta.secondary { color: var(--secondary-strong); }
  `],
})
export class ColorSection {
  // 'secondary' is supported by badge SCSS but not yet in the BadgeVariant union;
  // cast-through field keeps the demo working without touching badge.types.ts (owned by a parallel DS-gap agent).
  protected readonly secondaryVariant = 'secondary' as never;

  protected readonly groups: readonly SemanticGroup[] = [
    {
      label: 'Primary',
      swatches: [
        { name: 'primary', token: '--primary' },
        { name: 'primary-hover', token: '--primary-hover' },
        { name: 'primary-pressed', token: '--primary-pressed' },
        { name: 'primary-subtle', token: '--primary-subtle' },
        { name: 'primary-muted', token: '--primary-muted' },
      ],
    },
    {
      label: 'Error',
      swatches: [
        { name: 'error', token: '--error' },
        { name: 'error-hover', token: '--error-hover' },
        { name: 'error-subtle', token: '--error-subtle' },
        { name: 'error-muted', token: '--error-muted' },
        { name: 'error-border', token: '--error-border' },
      ],
    },
    {
      label: 'Success',
      swatches: [
        { name: 'success', token: '--success' },
        { name: 'success-hover', token: '--success-hover' },
        { name: 'success-subtle', token: '--success-subtle' },
        { name: 'success-muted', token: '--success-muted' },
        { name: 'success-border', token: '--success-border' },
      ],
    },
    {
      label: 'Warning',
      swatches: [
        { name: 'warning', token: '--warning' },
        { name: 'warning-hover', token: '--warning-hover' },
        { name: 'warning-subtle', token: '--warning-subtle' },
        { name: 'warning-muted', token: '--warning-muted' },
        { name: 'warning-border', token: '--warning-border' },
      ],
    },
    {
      label: 'Info',
      swatches: [
        { name: 'info', token: '--info' },
        { name: 'info-hover', token: '--info-hover' },
        { name: 'info-subtle', token: '--info-subtle' },
        { name: 'info-muted', token: '--info-muted' },
        { name: 'info-border', token: '--info-border' },
      ],
    },
    {
      label: 'Neutral · text',
      swatches: [
        { name: 'primary', token: '--text-primary' },
        { name: 'secondary', token: '--text-secondary' },
        { name: 'tertiary', token: '--text-tertiary' },
        { name: 'muted', token: '--text-muted' },
        { name: 'link', token: '--text-link' },
      ],
    },
    {
      label: 'Neutral · border',
      swatches: [
        { name: 'default', token: '--border-default' },
        { name: 'strong', token: '--border-strong' },
        { name: 'subtle', token: '--border-subtle' },
        { name: 'divider', token: '--border-divider' },
      ],
    },
    {
      label: 'Surface',
      swatches: [
        { name: 'canvas', token: '--surface-canvas' },
        { name: 'default', token: '--surface-default' },
        { name: 'secondary', token: '--surface-secondary' },
        { name: 'tint', token: '--surface-tint' },
        { name: 'inverted', token: '--surface-inverted', inverted: true },
      ],
    },
  ];

  protected readonly ramps: readonly RampSpec[] = [
    {
      label: 'Blue',
      desc: 'The default theme maps --primary onto this ramp. Stop 600 is the canonical action.',
      prefix: 'blue',
      stops: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    },
    {
      label: 'Neutral',
      desc: 'Backgrounds, borders, text, dividers. 13 stops cover tables, hover lanes and dark headers.',
      prefix: 'neutral',
      stops: [0, 50, 100, 150, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    },
    {
      label: 'Red',
      desc: 'The default theme maps --error onto this ramp. Validation failures, destructive confirmations, conflict.',
      prefix: 'red',
      stops: [50, 100, 200, 300, 400, 500, 600, 700],
    },
    {
      label: 'Success · Green',
      desc: 'Confirmations, completed actions, healthy state.',
      prefix: 'green',
      stops: [50, 100, 200, 300, 400, 500, 600, 700],
    },
    {
      label: 'Warning · Yellow',
      desc: 'Warnings, soft conflicts, pending state.',
      prefix: 'yellow',
      stops: [50, 100, 200, 300, 400, 500, 600, 700],
    },
    {
      label: 'Sky',
      desc: 'The default theme maps --info onto this ramp. A brighter blue, kept distinct from the primary --blue ramp so info is never confused with primary action.',
      prefix: 'sky',
      stops: [50, 100, 200, 300, 400, 500, 600, 700],
    },
  ];
}
