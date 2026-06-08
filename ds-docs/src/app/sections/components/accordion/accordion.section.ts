import { Component, ViewEncapsulation } from '@angular/core';
import { AccordionComponent, AccordionItemComponent } from 'ds';

@Component({
  selector: 'section-components-accordion',
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-accordion" data-anchor="accordion" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Accordion</h2>
      <p class="lede t-m">
        Collapsible disclosure panel. Each item exposes a head trigger and a body that
        shows when expanded. Multiple items can be open simultaneously by default — pair
        with parent-coordinated state if you need single-open semantics.
      </p>

      <h3 class="block-title t-h4">Default</h3>
      <ds-accordion>
        <ds-accordion-item title="Build dates" [expanded]="true">
          Build start: 27 Jul 06:00 · Build complete: 30 Jul 12:00.
          Crew arrives 27 Jul — overlaps Beta load-out by 4 hours.
        </ds-accordion-item>
        <ds-accordion-item title="Access dates"></ds-accordion-item>
        <ds-accordion-item title="Strike dates"></ds-accordion-item>
      </ds-accordion>

      <h3 class="block-title t-h4">States showcase</h3>
      <div class="states">
        <div class="state">
          <code class="t-mono state__lbl">Collapsed</code>
          <ds-accordion>
            <ds-accordion-item title="Build dates"></ds-accordion-item>
          </ds-accordion>
        </div>
        <div class="state">
          <code class="t-mono state__lbl">Expanded</code>
          <ds-accordion>
            <ds-accordion-item title="Build dates" [expanded]="true">
              Build start: 27 Jul 06:00 — overlaps Beta load-out.
            </ds-accordion-item>
          </ds-accordion>
        </div>
      </div>

      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Head label</span>
            <span class="trunc__behaviour">Single line, ellipsis. Tooltip on hover when clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Body</span>
            <span class="trunc__behaviour">Wraps, no clip — the panel exists to give body text room.</span>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }

    .states {
      display: flex;
      flex-direction: column;
      gap: var(--s-4);
      margin-top: var(--s-3);
    }
    .state { display: flex; flex-direction: column; gap: var(--s-2); }
    .state__lbl { font-size: 11px; color: var(--text-secondary); }

    .trunc {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .trunc__title {
      display: inline-flex; gap: var(--s-2);
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: var(--s-3);
    }
    .trunc__list {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column; gap: var(--s-2);
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
    code.t-mono {
      font: var(--fw-regular) var(--fs-mono)/1 var(--font-mono);
      background: var(--surface-secondary);
      padding: 1px var(--s-1);
      border-radius: var(--r-sm);
      color: var(--text-primary);
    }
  `],
})
export class AccordionSection {}
