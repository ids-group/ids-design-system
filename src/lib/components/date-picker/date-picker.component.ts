import {
  Component,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { IconComponent } from '../../icons/icon.component';
import type { DatePickerMode, DatePickerSize, RangeValue } from './date-picker.types';

interface DayCell {
  date: Date;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  inRange: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'ds-date-picker',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class DatePickerComponent {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);

  readonly mode = input<DatePickerMode>('single');
  readonly size = input<DatePickerSize>('md');
  readonly value = model<Date | RangeValue | null>(null);
  readonly placeholder = input<string>('Select date');
  readonly label = input<string>('');
  readonly hint = input<string>('');
  readonly required = input<boolean>(false);
  readonly optional = input<boolean>(false);

  protected readonly triggerClasses = computed(() => {
    const size = this.size();
    return size === 'md' ? 'trigger' : `trigger ${size}`;
  });

  protected readonly viewMonth = signal<Date>(new Date());
  protected readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  protected readonly panelTpl = viewChild.required<TemplateRef<unknown>>('panel');
  private overlayRef: OverlayRef | null = null;

  protected readonly displayLabel = computed(() => {
    const v = this.value();
    if (this.mode() === 'single') {
      const d = v as Date | null;
      return d ? d.toLocaleDateString() : this.placeholder();
    }
    const r = (v as RangeValue | null) ?? [null, null];
    const a = r[0];
    const b = r[1];
    if (a && b) return `${a.toLocaleDateString()} – ${b.toLocaleDateString()}`;
    if (a) return `${a.toLocaleDateString()} – …`;
    return this.placeholder();
  });

  protected readonly monthLabel = computed(() => {
    const m = this.viewMonth();
    return m.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  });

  protected readonly daysGrid = computed<DayCell[]>(() => {
    const view = this.viewMonth();
    const year = view.getFullYear();
    const month = view.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(gridStart.getDate() - ((gridStart.getDay() + 6) % 7));
    const cells: DayCell[] = [];
    const today = new Date();
    const todayKey = today.toDateString();
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      const inMonth = d.getMonth() === month;
      const isToday = d.toDateString() === todayKey;
      const range = this.getRangeContext(d);
      cells.push({
        date: d,
        day: d.getDate(),
        inMonth,
        isToday,
        inRange: range.inRange,
        isRangeStart: range.isStart,
        isRangeEnd: range.isEnd,
        isSelected: range.isSelected,
      });
    }
    return cells;
  });

  private getRangeContext(d: Date): { inRange: boolean; isStart: boolean; isEnd: boolean; isSelected: boolean } {
    const v = this.value();
    if (this.mode() === 'single') {
      const sel = v as Date | null;
      return { inRange: false, isStart: false, isEnd: false, isSelected: !!sel && sel.toDateString() === d.toDateString() };
    }
    const r = (v as RangeValue | null) ?? [null, null];
    const a = r[0];
    const b = r[1];
    if (!a) return { inRange: false, isStart: false, isEnd: false, isSelected: false };
    if (!b) return { inRange: false, isStart: a.toDateString() === d.toDateString(), isEnd: false, isSelected: false };
    const t = d.getTime();
    const aT = a.getTime();
    const bT = b.getTime();
    return {
      inRange: t > Math.min(aT, bT) && t < Math.max(aT, bT),
      isStart: t === Math.min(aT, bT),
      isEnd: t === Math.max(aT, bT),
      isSelected: false,
    };
  }

  protected open(): void {
    if (this.overlayRef) return;
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.trigger().nativeElement)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
      ]);
    const cfg: OverlayConfig = {
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    };
    this.overlayRef = this.overlay.create(cfg);
    this.overlayRef.backdropClick().subscribe(() => this.close());
    const portal = new TemplatePortal(this.panelTpl(), this.vcr);
    this.overlayRef.attach(portal);
  }

  protected close(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected prevMonth(): void {
    const m = new Date(this.viewMonth());
    m.setMonth(m.getMonth() - 1);
    this.viewMonth.set(m);
  }

  protected nextMonth(): void {
    const m = new Date(this.viewMonth());
    m.setMonth(m.getMonth() + 1);
    this.viewMonth.set(m);
  }

  protected selectDay(cell: DayCell): void {
    if (this.mode() === 'single') {
      this.value.set(new Date(cell.date));
      this.close();
      return;
    }
    const r = (this.value() as RangeValue | null) ?? [null, null];
    const a = r[0];
    const b = r[1];
    if (!a || (a && b)) {
      this.value.set([new Date(cell.date), null]);
    } else {
      const picked = new Date(cell.date);
      const range: RangeValue = a.getTime() <= picked.getTime() ? [a, picked] : [picked, a];
      this.value.set(range);
      this.close();
    }
  }

  protected cellClasses(cell: DayCell): string {
    const parts = ['day'];
    if (!cell.inMonth) parts.push('muted');
    if (cell.isToday) parts.push('today');
    if (cell.inRange) parts.push('in-range');
    if (cell.isRangeStart) parts.push('range-start');
    if (cell.isRangeEnd) parts.push('range-end');
    if (cell.isSelected) parts.push('selected');
    return parts.join(' ');
  }
}
