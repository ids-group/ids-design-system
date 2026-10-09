import { signal } from '@angular/core';
import { TableComponent, TooltipDirective } from '@ids-group-ltd/ids-design-system';

// @ts-expect-error after TS2415
export class AppTooltip extends TooltipDirective {
  // @ts-expect-error after TS4114
  private tipText(): string {
    return '';
  }
}

export class AppTable extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4114 TS2416
  readonly actionLabel = 1;
}

export class AppTableMarked extends TableComponent<{ id: string }> {
  // @ts-expect-error after TS4113
  protected override readonly cellPopoverText = signal('');
}

export class AppTableUnmarked extends TableComponent<{ id: string }> {
  // @ts-expect-error before TS4114
  protected onHeaderEnter(event: Event): void {}
}
