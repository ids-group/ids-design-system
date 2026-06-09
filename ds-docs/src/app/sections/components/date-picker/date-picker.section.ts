import { Component, ViewEncapsulation } from '@angular/core';
import { DatePickerComponent, IconComponent } from 'ds';

@Component({
  selector: 'section-components-date-picker',
  standalone: true,
  imports: [DatePickerComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-date-picker" data-anchor="date-picker" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Date picker</h2>
      <p class="lede t-m">
        Calendar popover anchored to a date field. Single-day or range selection. Range is the canonical use for
        Build / Access / Strike scheduling.
      </p>

      <!-- ============================================================ Single date -->
      <h3 class="block-title t-h4">Single date</h3>
      <p class="block-desc t-s">Trigger shows the selected date or placeholder; click opens a one-month panel.</p>
      <div class="row">
        <ds-date-picker mode="single" placeholder="Pick a date" />
      </div>

      <!-- ============================================================ Date range -->
      <h3 class="block-title t-h4">Date range</h3>
      <p class="block-desc t-s">Two clicks set start + end; cells between them are tinted in-range.</p>
      <div class="row">
        <ds-date-picker mode="range" placeholder="Pick a range" />
      </div>

      <!-- ============================================================ With label + hint -->
      <h3 class="block-title t-h4">Label · hint · required</h3>
      <p class="block-desc t-s">
        New <code class="t-mono">[label]</code> / <code class="t-mono">[hint]</code> inputs render the field-label above and a hint line below the trigger, matching the input/select field shape. <code class="t-mono">[required]="true"</code> appends the asterisk; <code class="t-mono">[optional]="true"</code> appends the muted suffix.
      </p>
      <div class="grid-2">
        <ds-date-picker
          mode="single"
          label="Build start"
          hint="The day crews begin set-up on site."
          [required]="true"
          placeholder="Pick a date"
        />
        <ds-date-picker
          mode="range"
          label="Show window"
          hint="Public open days."
          [optional]="true"
          placeholder="Pick a range"
        />
      </div>

      <!-- ============================================================ Day states showcase -->
      <h3 class="block-title t-h4">Day states</h3>
      <p class="block-desc t-s">Every individual cell state side-by-side. Static specimens — raw <code>.day</code> markup with <code>.is-forced-*</code> hooks pins each transient state for screenshot.</p>
      <div class="states states--cols-4">
        <div class="state-cell">
          <div class="state-cell__stage"><button type="button" class="day">12</button></div>
          <div class="state-cell__label">Default</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><button type="button" class="day is-forced-hover">12</button></div>
          <div class="state-cell__label">Hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><button type="button" class="day is-forced-focus">12</button></div>
          <div class="state-cell__label">Focus</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><button type="button" class="day selected">12</button></div>
          <div class="state-cell__label">Selected</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><button type="button" class="day selected is-forced-hover">12</button></div>
          <div class="state-cell__label">Selected · hover</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><button type="button" class="day in-range">12</button></div>
          <div class="state-cell__label">In-range</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><button type="button" class="day today">17</button></div>
          <div class="state-cell__label">Today</div>
        </div>
        <div class="state-cell">
          <div class="state-cell__stage"><button type="button" class="day disabled" disabled>12</button></div>
          <div class="state-cell__label">Disabled</div>
        </div>
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">
          <ds-icon name="filter" [size]="14" /> Truncation
        </div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Selected-date label</span>
            <span class="trunc__behaviour">Numeric date only — no clip.</span>
          </li>
          <li>
            <span class="trunc__field">Range label</span>
            <span class="trunc__behaviour">"Start – End" format — no clip; abbreviates year if same.</span>
          </li>
          <li>
            <span class="trunc__field">Calendar day</span>
            <span class="trunc__behaviour">Single digit/two digits — no clip ever.</span>
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
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }

    .grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--s-4);
      margin-top: var(--s-3);
    }

    .row { display: flex; gap: var(--s-6); align-items: center; flex-wrap: wrap; margin-top: var(--s-3); }

    /* ---------- Day-states showcase ---------- */
    .states {
      display: grid;
      gap: var(--s-3);
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .states--cols-4 { grid-template-columns: repeat(4, 1fr); }
    .state-cell {
      display: flex; flex-direction: column;
      gap: var(--s-2);
    }
    .state-cell__stage {
      display: flex; align-items: center; justify-content: center;
      padding: var(--s-3);
      min-height: 64px;
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-default);
      border-radius: var(--r-md);
    }
    .state-cell__label {
      text-align: center;
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
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
export class DatePickerSection {}
