import { Component, ViewEncapsulation, signal } from '@angular/core';
import { ComboboxComponent, type ComboboxOption } from 'ds';

const MEMBERS: readonly ComboboxOption<string>[] = [
  { value: 'acme',       label: 'Acme Holdings' },
  { value: 'festi',      label: 'Festicket Ltd' },
  { value: 'livenation', label: 'Live Nation Festivals' },
  { value: 'sjm',        label: 'SJM Concerts' },
];

const PRODUCTS: readonly ComboboxOption<string>[] = [
  { value: 'beer',    label: 'Beer kegs' },
  { value: 'cider',   label: 'Cider' },
  { value: 'spirits', label: 'Spirits' },
  { value: 'wine',    label: 'Wine' },
  { value: 'mixers',  label: 'Mixers' },
];

@Component({
  selector: 'section-components-combobox',
  standalone: true,
  imports: [ComboboxComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-combobox" data-anchor="combobox" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Combobox &middot; multi-select</h2>
      <p class="lede t-m">
        Text input that filters a token-tagged list. Single-select for picking a record
        (a Member, a venue); multi-select for picking a set (allowed products, audience tags).
        Distinct from <code class="t-mono">&lt;ds-select&gt;</code> (fixed-list dropdown) and
        Command palette (global search).
      </p>

      <h3 class="block-title t-h4">Single</h3>
      <div class="field-stack">
        <label class="field-label t-s">Member</label>
        <ds-combobox [options]="members"
                     [(value)]="memberValue"
                     placeholder="Pick a member…" />
      </div>

      <h3 class="block-title t-h4">Multi</h3>
      <div class="field-stack">
        <label class="field-label t-s">Allowed products</label>
        <ds-combobox [options]="products"
                     [(value)]="productsValue"
                     [multiple]="true"
                     placeholder="Add product…" />
      </div>

      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Token chip in the input</span>
            <span class="trunc__behaviour">Single line, ellipsis at ~16 ch. Tooltip on hover when clipped.</span>
          </li>
          <li>
            <span class="trunc__field">Option label in dropdown</span>
            <span class="trunc__behaviour">Single line, ellipsis. Tooltip on hover always (the popover is narrow).</span>
          </li>
          <li>
            <span class="trunc__field">Secondary metadata</span>
            <span class="trunc__behaviour">Single line, ellipsis. Drop before the primary label clips.</span>
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

    .field-stack {
      display: flex;
      flex-direction: column;
      gap: var(--s-1-5);
      margin-top: var(--s-3);
      max-width: 480px;
    }
    .field-label {
      font: var(--fw-medium) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-primary);
    }

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
      grid-template-columns: 220px 1fr;
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
export class ComboboxSection {
  protected readonly members = MEMBERS;
  protected readonly products = PRODUCTS;
  protected readonly memberValue = signal<string | null>('festi');
  protected readonly productsValue = signal<readonly string[]>(['beer', 'cider', 'spirits']);
}
