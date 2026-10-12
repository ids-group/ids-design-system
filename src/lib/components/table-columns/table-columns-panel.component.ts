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
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import { BottomSheetComponent } from '@ids-group-ltd/ids-design-system/components/bottom-sheet';
import { PopoverComponent } from '@ids-group-ltd/ids-design-system/components/popover';
import type { TableColumn } from '@ids-group-ltd/ids-design-system/components/table';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import { focusRescue } from '@ids-group-ltd/ids-design-system/components';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';

/**
 * The column panel: reorder, show and hide, plus contributed row controls (`rowExtras`).
 * A popover on a fine pointer, a bottom sheet on a coarse one.
 *
 * @internal Not API - created by `DsTableColumns`, never written in a consumer's template.
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
      <ds-bottom-sheet [title]="intl().tableColumns.title" [(open)]="sheetOpen">
        <ng-container [ngTemplateOutlet]="panel" />
      </ds-bottom-sheet>
    } @else {
      <ds-popover
        #popover
        align="end"
        panelRole="dialog"
        [panelLabel]="intl().tableColumns.panelLabel">
        <ng-container [ngTemplateOutlet]="panel" />
      </ds-popover>
    }

    <ng-template #panel>
      <div
        #list
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
                  [attr.aria-label]="intl().tableColumns.moveUp"
                  [disabled]="first"
                  (click)="move(col, -1, list)">
                  <ds-icon name="chevronUp" [size]="14" />
                </button>

                <button
                  type="button"
                  class="col-move-btn"
                  [attr.aria-label]="intl().tableColumns.moveDown"
                  [disabled]="last"
                  (click)="move(col, 1, list)">
                  <ds-icon name="chevronDown" [size]="14" />
                </button>
              </span>
            }
          </div>
        }

        <button type="button" class="col-reset" (click)="resetRequested.emit()">
          {{ intl().tableColumns.reset }}
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
  readonly isVisible = input.required<(column: TableColumn<T>) => boolean>();
  readonly isLocked = input.required<(column: TableColumn<T>) => boolean>();

  protected readonly intl = inject(DS_INTL);
  private readonly rescueFocus = focusRescue();

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

  // A moved row is re-inserted, or its button disabled at an end, under focus.
  protected move(
    column: TableColumn<T>,
    delta: -1 | 1,
    list: HTMLElement,
  ): void {
    this.moved.emit({ column, delta });
    this.rescueFocus(() => {
      const index = this.columns().findIndex(
        (candidate) => candidate.key === column.key,
      );
      const [up, down] = Array.from(
        list.children[index]?.querySelectorAll<HTMLButtonElement>(
          '.col-move-btn',
        ) ?? [],
      );
      const same = delta < 0 ? up : down;

      return same?.disabled ? (delta < 0 ? down : up) : same;
    });
  }

  toggle(trigger: HTMLElement): void {
    if (this.coarsePointer()) {
      this.sheetOpen.set(true);

      return;
    }
    this.popover()?.toggle(trigger);
  }
}
