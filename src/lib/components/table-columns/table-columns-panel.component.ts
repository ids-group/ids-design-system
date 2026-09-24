import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  TemplateRef,
  computed,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { BottomSheetComponent } from '@ids-group-ltd/ids-design-system/components/bottom-sheet';
import { PopoverComponent } from '@ids-group-ltd/ids-design-system/components/popover';
import type { TableColumn } from '@ids-group-ltd/ids-design-system/components/table';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';

/**
 * The column panel: reorder, show and hide, and whatever else contributed a row control.
 *
 * It renders twice over one template — a popover on a fine pointer, a bottom sheet on a coarse
 * one — because a drag handle is unusable with a thumb. Which one is live is keyed on the POINTER
 * and not the viewport, matching the media query in the table's own stylesheet.
 *
 * `rowExtras` is how resize gets its width buttons in here without this component naming resize:
 * whoever owns width registers a template through the table's seam and it lands per row.
 *
 * @internal Not API — created by `DsTableColumns`, never written in a consumer's template.
 */
@Component({
  selector: 'ds-table-columns-panel',
  standalone: true,
  styleUrl: './table-columns-panel.component.scss',
  imports: [
    BottomSheetComponent,
    CdkDrag,
    CdkDragHandle,
    CdkDropList,
    IconComponent,
    NgTemplateOutlet,
    PopoverComponent,
  ],
  template: `
    @if (coarsePointer()) {
      <ds-bottom-sheet title="Columns" [(open)]="sheetOpen">
        <ng-container [ngTemplateOutlet]="panel" />
      </ds-bottom-sheet>
    } @else {
      <ds-popover
        #popover
        align="end"
        panelRole="dialog"
        panelLabel="Column visibility">
        <ng-container [ngTemplateOutlet]="panel" />
      </ds-popover>
    }

    <ng-template #panel>
      <div
        class="col-picker"
        cdkDropList
        (cdkDropListDropped)="dropped.emit($event)">
        @for (
          col of columns();
          track col.key;
          let first = $first;
          let last = $last
        ) {
          <div
            class="col-picker-row"
            cdkDrag
            [cdkDragDisabled]="!reorderable()">
            @if (reorderable()) {
              <span class="col-drag" cdkDragHandle aria-hidden="true">
                <ds-icon name="drag" [size]="14" />
              </span>
            }

            <label class="col-picker-option">
              <input
                type="checkbox"
                class="check"
                [checked]="isVisible()(col)"
                [disabled]="!col.hideable || isLocked()(col)"
                (change)="toggled.emit(col)" />
              {{ col.label || col.screenReaderLabel }}
            </label>

            @if (rowExtras()) {
              <ng-container
                [ngTemplateOutlet]="rowExtras()!"
                [ngTemplateOutletContext]="{ $implicit: col }" />
            }

            @if (reorderable()) {
              <span class="col-move">
                <button
                  type="button"
                  class="col-move-btn"
                  aria-label="Move up"
                  [disabled]="first"
                  (click)="moved.emit({ column: col, delta: -1 })">
                  <ds-icon name="chevronUp" [size]="14" />
                </button>

                <button
                  type="button"
                  class="col-move-btn"
                  aria-label="Move down"
                  [disabled]="last"
                  (click)="moved.emit({ column: col, delta: 1 })">
                  <ds-icon name="chevronDown" [size]="14" />
                </button>
              </span>
            }
          </div>
        }

        <button type="button" class="col-reset" (click)="resetRequested.emit()">
          Reset to default
        </button>
      </div>
    </ng-template>
  `,
})
export class TableColumnsPanelComponent<T> {
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly reorderable = input(false);
  readonly coarsePointer = input(false);
  readonly rowExtras = input<TemplateRef<{ $implicit: TableColumn<T> }> | null>(
    null,
  );
  // Passed as functions rather than precomputed flags: the panel renders one row per column and
  // would otherwise need a parallel array kept in step with `columns`.
  readonly isVisible = input.required<(column: TableColumn<T>) => boolean>();
  readonly isLocked = input.required<(column: TableColumn<T>) => boolean>();

  readonly sheetOpen = model(false);
  readonly toggled = output<TableColumn<T>>();
  readonly moved = output<{ column: TableColumn<T>; delta: -1 | 1 }>();
  readonly dropped = output<CdkDragDrop<unknown>>();
  readonly resetRequested = output<void>();

  private readonly popover = viewChild<PopoverComponent>('popover');

  readonly opened = computed(() =>
    this.coarsePointer()
      ? this.sheetOpen()
      : (this.popover()?.opened() ?? false),
  );

  toggle(trigger: HTMLElement): void {
    if (this.coarsePointer()) {
      this.sheetOpen.set(true);

      return;
    }
    this.popover()?.toggle(trigger);
  }
}
