import { Component, ViewEncapsulation, input } from '@angular/core';
import { IconComponent } from 'ds';

/** One truncation rule row: a field/element and how it behaves on overflow. */
export interface TruncationRule {
  field: string;
  behaviour: string;
}

/** Neutral "i" placed next to a section title. Sections provide only the rules
 *  as config (`[rules]`); the component renders the panel itself on hover/focus.
 *  Replaces the always-on truncation card duplicated at the end of every section. */
@Component({
  selector: 'docs-truncation',
  standalone: true,
  imports: [IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <button type="button" class="i" aria-label="Truncation rules">
      <ds-icon name="info" [size]="18" />
    </button>

    <div class="panel" role="tooltip">
      <div class="panel-title">
        <ds-icon name="filter" [size]="13" /> Truncation
      </div>

      <ul class="list">
        @for (rule of rules(); track rule.field) {
          <li>
            <span class="field">
              {{ rule.field }}
            </span>

            <span class="behaviour">
              {{ rule.behaviour }}
            </span>
          </li>
        }
      </ul>
    </div>
  `,
  styles: [
    `
      :host {
        position: relative;
        display: inline-flex;
        vertical-align: middle;
        margin-left: var(--space-2);
      }
      .i {
        display: inline-flex;
        padding: 0;
        border: 0;
        background: none;
        color: var(--text-secondary);
        cursor: help;
        border-radius: var(--radius-pill);
      }
      .i:hover {
        color: var(--primary);
      }
      .i:focus-visible {
        outline: var(--focus-ring);
        outline-offset: 2px;
      }
      .panel {
        display: none;
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        z-index: var(--layer-tooltip, 100);
        width: max-content;
        min-width: min(320px, calc(100vw - var(--space-8)));
        max-width: min(460px, calc(100vw - var(--space-8)));
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-lg);
        background: var(--surface-default);
        border: var(--border-width-default) solid var(--border-default);
        box-shadow: var(--shadow-3, 0 8px 24px rgba(11, 14, 25, 0.16));
      }
      /* display:none keeps the hidden panel out of scroll-container overflow
         (was opacity/pointer-events only, which still laid out the box). */
      :host:hover .panel,
      :host:focus-within .panel {
        display: block;
      }
      .panel-title {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        font: var(--font-weight-bold)
          var(--font-size-2xs)/var(--line-height-base) var(--font-sans);
        letter-spacing: var(--letter-spacing-wider);
        text-transform: uppercase;
        color: var(--text-tertiary);
        margin-bottom: var(--space-3);
      }
      .list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
      }
      .list li {
        display: grid;
        grid-template-columns: 150px 1fr;
        gap: var(--space-3);
        align-items: start;
      }
      .field {
        font: var(--font-weight-bold) var(--font-size-s)/var(--line-height-base)
          var(--font-sans);
        color: var(--text-primary);
      }
      .behaviour {
        font: var(--font-weight-regular)
          var(--font-size-s)/var(--line-height-base) var(--font-sans);
        color: var(--text-secondary);
      }
    `,
  ],
})
export class DocsTruncationComponent {
  readonly rules = input.required<TruncationRule[]>();
}
