import { Component, ViewEncapsulation } from '@angular/core';

interface TypeRampRow {
  readonly cls: string;
  readonly sizeToken: string;
  readonly sample: string;
  readonly size: string;
  readonly lineHeight: string;
  readonly weight: string;
  readonly tracking: string;
}

const RAMP: readonly TypeRampRow[] = [
  { cls: 't-display',  sizeToken: '--fs-display', sample: 'Q3 2026',                       size: '64',  lineHeight: '1.1',  weight: 'extrabold', tracking: 'tight' },
  { cls: 't-h1',       sizeToken: '--fs-h1',      sample: 'Projects',                      size: '48',  lineHeight: '1.1',  weight: 'extrabold', tracking: 'tight' },
  { cls: 't-h2',       sizeToken: '--fs-h2',      sample: 'Project Alpha — Sections',      size: '36',  lineHeight: '1.25', weight: 'extrabold', tracking: 'snug' },
  { cls: 't-h3',       sizeToken: '--fs-h3',      sample: 'Capacity threshold',            size: '28',  lineHeight: '1.25', weight: 'extrabold', tracking: 'snug' },
  { cls: 't-h4',       sizeToken: '--fs-h4',      sample: 'Recompute pending',             size: '22',  lineHeight: '1.25', weight: 'bold',      tracking: 'normal' },
  { cls: 't-h5',       sizeToken: '--fs-h5',      sample: 'Allocated resources',           size: '18',  lineHeight: '1.25', weight: 'bold',      tracking: 'normal' },
  { cls: 't-l',        sizeToken: '--fs-l',       sample: 'Three schedules and twelve resource allocations will recompute when you save these dates.', size: '18', lineHeight: '1.4', weight: 'regular', tracking: 'normal' },
  { cls: 't-m',        sizeToken: '--fs-m',       sample: 'Three schedules and twelve resource allocations will recompute.', size: '16',  lineHeight: '1.4',  weight: 'regular',  tracking: 'normal' },
  { cls: 't-s',        sizeToken: '--fs-s',       sample: 'Sam Carter changed Project Alpha access dates two minutes ago.', size: '14',  lineHeight: '1.4',  weight: 'regular',  tracking: 'normal' },
  { cls: 't-xs',       sizeToken: '--fs-xs',      sample: 'Last synced 4 minutes ago',     size: '12',  lineHeight: '1.4',  weight: 'regular',  tracking: 'normal' },
  { cls: 't-overline', sizeToken: '--fs-2xs',     sample: 'Impact summary',                size: '11',  lineHeight: '1.4',  weight: 'bold',      tracking: 'wider · uppercase' },
  { cls: 't-caption',  sizeToken: '--fs-xs',      sample: 'Times in Europe/London. Daylight savings auto.', size: '12', lineHeight: '1.4',  weight: 'regular',  tracking: 'normal' },
  { cls: 't-mono',     sizeToken: '--fs-mono',    sample: 'ORD-2026-0142  12 Main St, City  06:00–22:00', size: '13', lineHeight: '1.4', weight: 'medium', tracking: 'normal' },
];

@Component({
  selector: 'section-foundations-typography',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-typography" data-anchor="typography" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Typography</h2>
      <p class="lede t-m">Mulish for UI and prose, JetBrains Mono for IDs, dates and any monospace data. Weights: 400 / 500 / 600 / 700 / 800.</p>

      <!-- ============================================================ Type ramp -->
      <h3 class="block-title t-h4">Type ramp</h3>
      <p class="block-desc t-s">Every utility class side-by-side. Headings are reserved for marketing surfaces and large section titles. Default UI runs on <code class="t-mono">.t-s</code> (14).</p>
      <div class="ramp">
        <div class="ramp__head t-overline">
          <div>Class · token</div>
          <div>Sample</div>
          <div>Size</div>
          <div>LH</div>
          <div>Weight</div>
          <div>Tracking</div>
        </div>
        @for (row of ramp; track row.cls) {
          <div class="ramp__row">
            <div class="ramp__label">
              <code class="t-mono ramp__cls">.{{ row.cls }}</code>
              <code class="t-mono ramp__token">{{ row.sizeToken }}</code>
            </div>
            <div [class]="row.cls + ' ramp__sample'">{{ row.sample }}</div>
            <div class="t-mono ramp__meta">{{ row.size }}</div>
            <div class="t-mono ramp__meta">{{ row.lineHeight }}</div>
            <div class="t-mono ramp__meta">{{ row.weight }}</div>
            <div class="t-mono ramp__meta">{{ row.tracking }}</div>
          </div>
        }
      </div>

      <!-- ============================================================ Mono family -->
      <h3 class="block-title t-h4">Mono family</h3>
      <p class="block-desc t-s">JetBrains Mono for any literal value the operator might paste, search or read aloud. <code class="t-mono">.t-mono</code> for inline tokens; <code class="t-mono">.t-mono-block</code> wraps a code-snippet style frame.</p>
      <div class="mono-grid">
        <div class="mono-card">
          <div class="t-overline">Inline · .t-mono</div>
          <div class="t-mono mono-card__sample">ORD-2026-0142  ·  12 Main St, City  ·  06:00–22:00</div>
          <div class="t-caption">13 / 1.4 / medium · JetBrains Mono</div>
        </div>
        <div class="mono-card">
          <div class="t-overline">Block · .t-mono-block</div>
          <pre class="t-mono-block mono-card__block">SELECT id, status, recomputed_at
FROM   schedule
WHERE  project_id = 'alpha'
  AND  status &lt;&gt; 'closed';</pre>
          <div class="t-caption">13 / 1.6 / regular · pre-wrap, no clip</div>
        </div>
      </div>

      <!-- ============================================================ Font families -->
      <h3 class="block-title t-h4">Families</h3>
      <div class="row">
        <div class="family-card">
          <div class="t-overline">Sans</div>
          <div class="t-h3 family-card__name" style="font-family: var(--font-sans)">Mulish</div>
          <code class="t-mono family-card__tok">--font-sans</code>
        </div>
        <div class="family-card">
          <div class="t-overline">Mono</div>
          <div class="t-h3 family-card__name" style="font-family: var(--font-mono)">JetBrains Mono</div>
          <code class="t-mono family-card__tok">--font-mono</code>
        </div>
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Heading</span>
            <span class="trunc__behaviour">Single line, ellipsis at title width.</span>
          </li>
          <li>
            <span class="trunc__field">Body</span>
            <span class="trunc__behaviour">Wrap freely.</span>
          </li>
          <li>
            <span class="trunc__field">Mono code</span>
            <span class="trunc__behaviour">Pre-wrap; horizontal scroll inside the block; no clip.</span>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--brand); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }
    .row { display: flex; gap: var(--s-4); align-items: stretch; flex-wrap: wrap; margin-top: var(--s-3); }

    /* ---------- Type ramp ---------- */
    .ramp {
      margin-top: var(--s-3);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
      background: var(--surface-default);
      overflow: hidden;
    }
    .ramp__head,
    .ramp__row {
      display: grid;
      grid-template-columns: 200px minmax(0, 1fr) 56px 56px 88px 140px;
      gap: var(--s-4);
      align-items: baseline;
      padding: var(--s-3) var(--s-4);
    }
    .ramp__head {
      color: var(--text-tertiary);
      background: var(--surface-secondary);
      border-bottom: var(--bw-default) solid var(--border-divider);
      align-items: center;
    }
    .ramp__row + .ramp__row { border-top: var(--bw-default) solid var(--border-divider); }
    .ramp__label { display: grid; gap: var(--s-0-5); min-width: 0; }
    .ramp__cls { color: var(--text-primary); font-size: 12px; }
    .ramp__token { color: var(--text-tertiary); font-size: 11px; }
    .ramp__sample { color: var(--text-primary); min-width: 0; overflow-wrap: anywhere; }
    .ramp__meta { color: var(--text-secondary); font-size: 12px; }

    /* ---------- Mono family ---------- */
    .mono-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--s-4);
      margin-top: var(--s-3);
    }
    .mono-card {
      display: grid;
      gap: var(--s-2);
      padding: var(--s-4);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-md);
      background: var(--surface-default);
    }
    .mono-card__sample { color: var(--text-primary); overflow-wrap: anywhere; }
    .mono-card__block { margin: 0; white-space: pre; overflow-x: auto; }

    /* ---------- Family cards ---------- */
    .family-card {
      flex: 1 1 280px;
      display: grid;
      gap: var(--s-1);
      padding: var(--s-5);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-md);
      background: var(--surface-default);
    }
    .family-card__name { color: var(--text-primary); }
    .family-card__tok { color: var(--text-tertiary); }

    /* ---------- Truncation block ---------- */
    .trunc {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .trunc__title {
      display: inline-flex; align-items: center; gap: var(--s-2);
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: var(--s-3);
    }
    .trunc__list {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column;
      gap: var(--s-2);
    }
    .trunc__list li {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--s-4);
      align-items: start;
    }
    .trunc__field {
      font: var(--fw-bold) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-primary);
    }
    .trunc__behaviour {
      font: var(--fw-regular) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-secondary);
    }

    @media (max-width: 960px) {
      .ramp__head { display: none; }
      .ramp__row {
        grid-template-columns: 1fr;
        gap: var(--s-2);
        padding: var(--s-4);
      }
      .ramp__row + .ramp__row { border-top: var(--bw-default) solid var(--border-divider); }
      .mono-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class TypographySection {
  protected readonly ramp = RAMP;
}
