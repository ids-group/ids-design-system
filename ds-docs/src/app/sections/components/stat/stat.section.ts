import { Component, ViewEncapsulation } from '@angular/core';
import { StatComponent } from 'ds';

@Component({
  selector: 'section-components-stat',
  standalone: true,
  imports: [StatComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-stat" data-anchor="stat" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Stats</h2>
      <p class="lede t-m">Headline metric with an optional delta. Up/down arrows for movement vs a baseline.</p>

      <!-- ============================================================ Stat tiles -->
      <h3 class="block-title t-h4">Stat tiles</h3>
      <p class="block-desc t-s">Label · value · optional delta with directional arrow.</p>
      <div class="grid-4">
        <ds-stat label="Records this cycle" value="147" [delta]="12" deltaLabel="vs 2025" />
        <ds-stat label="Capacity used" value="12.9 m" caption="of 13.45 m available" />
        <ds-stat label="Resource conflicts" value="3" variant="danger" [delta]="-5" deltaLabel="vs last week" />
        <ds-stat label="Pending recomputes" value="12" caption="Last sync 4m ago" />
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Stat label</span>
            <span class="trunc__behaviour">Single line, ellipsis. Tooltip on hover when clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Stat value</span>
            <span class="trunc__behaviour">No clip. Use compact notation (₤ 1.2k) before letting numbers wrap.</span>
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
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); }

    /* ---------- Showcase grid ---------- */
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--s-4);
      margin-top: var(--s-3);
    }

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
  `],
})
export class StatSection {}
