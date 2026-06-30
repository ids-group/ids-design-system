import {
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  contentChild,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface DocsMatrixRow {
  /** Unique track key (e.g. the colour name). */
  readonly key: string;
  readonly label: string;
  /** Optional CSS colour for a leading swatch dot. */
  readonly dot?: string;
  /** Optional short note shown right-aligned in the row label. */
  readonly note?: string;
  /** Columns legal for this row; cells outside render "—". Omit = all legal. */
  readonly legal?: readonly string[];
  /** Columns that render but are discouraged — marked with a ⚠ in the cell. */
  readonly discouraged?: readonly string[];
  /** Arbitrary extra data the cell template reads via `let-row="row"`. */
  readonly [extra: string]: unknown;
}

/**
 * Generic 2-axis showcase matrix: column headers × labelled rows, each cell
 * rendered by a projected `<ng-template let-col let-row="row">`. Replaces the
 * hand-rolled grid markup duplicated across the button / icon-button sections.
 *
 * ```html
 * <docs-matrix [cols]="variants" [rows]="rows" cornerLabel="color \ variant">
 *   <ng-template let-variant let-row="row">
 *     <ds-button [color]="row['color']" [variant]="variant">{{ row.label }}</ds-button>
 *   </ng-template>
 * </docs-matrix>
 * ```
 */
@Component({
  selector: 'docs-matrix',
  standalone: true,
  imports: [NgTemplateOutlet],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <div class="scroll">
      <div class="matrix" [style.grid-template-columns]="gridCols()">
        <div class="t-overline corner">
          {{ cornerLabel() }}
        </div>

        @for (col of cols(); track col) {
          <div class="t-overline head">
            {{ col }}
          </div>
        }

        @for (row of rows(); track row.key) {
          <div class="row-label">
            @if (row.dot) {
              <span class="dot" [style.background]="row.dot"></span>
            }

            <span class="name">
              {{ row.label }}
            </span>

            @if (row.note) {
              <span class="note t-mono-inline">
                {{ row.note }}
              </span>
            }
          </div>

          @for (col of cols(); track col) {
            <div class="cell">
              @if (isLegal(row, col)) {
                <ng-container
                  [ngTemplateOutlet]="cell()"
                  [ngTemplateOutletContext]="{
                    $implicit: col,
                    row: row,
                    col: col,
                  }"
                />

                @if (isDiscouraged(row, col)) {
                  <span
                    class="warn"
                    title="UX-discouraged combination — renders, but reads poorly"
                  ></span>
                }
              } @else {
                <span class="na">
                  —
                </span>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  styles: [
    `
      .scroll {
        overflow-x: auto;
        margin-top: var(--space-3);
      }
      .matrix {
        display: grid;
        gap: var(--space-4) var(--space-6);
        align-items: center;
        padding: var(--space-4);
        background: var(--surface-secondary);
        border-radius: var(--radius-lg);
      }
      .head {
        text-align: center;
      }
      .corner {
        color: var(--text-tertiary);
      }
      .row-label {
        display: flex;
        align-items: center;
        gap: var(--space-2);
      }
      .dot {
        width: 12px;
        height: 12px;
        border-radius: var(--radius-pill);
        flex-shrink: 0;
      }
      .name {
        font-weight: var(--font-weight-semibold);
        color: var(--text-primary);
      }
      .note {
        color: var(--text-tertiary);
        margin-left: auto;
      }
      .cell {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 52px;
      }
      .warn {
        position: absolute;
        top: 0;
        right: 2px;
        font-size: 12px;
        line-height: 1;
        opacity: 0.7;
        pointer-events: none;
      }
      .warn::after {
        content: '⚠';
      }
      .na {
        color: var(--text-tertiary);
      }
    `,
  ],
})
export class DocsMatrixComponent {
  /** Column headers (the variant / fill axis). */
  readonly cols = input.required<readonly string[]>();
  /** Labelled rows (the colour axis). */
  readonly rows = input.required<readonly DocsMatrixRow[]>();
  readonly cornerLabel = input('');
  readonly labelWidth = input('164px');
  readonly minColWidth = input('72px');

  protected readonly cell =
    contentChild.required<TemplateRef<unknown>>(TemplateRef);

  protected readonly gridCols = computed(
    () =>
      `${this.labelWidth()} repeat(${this.cols().length}, minmax(${this.minColWidth()}, 1fr))`,
  );

  protected isLegal(row: DocsMatrixRow, col: string): boolean {
    return !row.legal || row.legal.includes(col);
  }

  protected isDiscouraged(row: DocsMatrixRow, col: string): boolean {
    return !!row.discouraged?.includes(col);
  }
}
