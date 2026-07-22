import {
  Component,
  ElementRef,
  Injector,
  type OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  forwardOverlayTokens,
} from '../overlay-motion';
import { IconComponent } from '../../icons/icon.component';
import { DsControlValueAccessor } from '../control-value-accessor';
import {
  FieldMessageComponent,
  type FieldMessageState,
} from '../field-message/field-message.component';
import { TimeColumnsComponent } from '../time-columns/time-columns.component';
import { DS_CONFIG } from '../../config/ds-config';
import {
  clampToRange,
  formatTime,
  pad2,
  snapToStep,
  toMinutes,
} from './time.util';
import type {
  TimeConstraints,
  TimeFormat,
  TimePickerMode,
  TimePickerSize,
  TimeRangeValue,
} from './time-picker.types';

type Segment = 'single' | 'start' | 'end';
let nextId = 0;

@Component({
  selector: 'ds-time-picker',
  standalone: true,
  imports: [IconComponent, FieldMessageComponent, TimeColumnsComponent],
  templateUrl: './time-picker.component.html',
  styleUrl: './time-picker.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickerComponent),
      multi: true,
    },
  ],
})
export class TimePickerComponent
  extends DsControlValueAccessor<string | TimeRangeValue | null>
  implements OnDestroy
{
  constructor() {
    super();
  }

  private readonly config = inject(DS_CONFIG);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly host = inject(ElementRef<HTMLElement>);
  /** Public panel tokens forwarded onto the portaled overlay pane on open so
   *  a consumer's `ds-time-picker { --ds-time-picker-panel-*: … }` reaches it. */
  private readonly panelTokens = [
    '--ds-time-picker-bg-color',
    '--ds-time-picker-border',
    '--ds-time-picker-shadow',
  ];

  /** Selected time, or `[start, end]` tuple when `mode="range"`. Two-way bound. */
  readonly value = model<string | TimeRangeValue | null>(null);
  /** Single time or `[start, end]` range picker. */
  readonly mode = input<TimePickerMode>('single');
  /** Minute increment shown in the picker columns. */
  readonly minuteStep = input(1, { transform: numberAttribute });
  /** Earliest selectable time ("HH:MM"). */
  readonly minTime = input<string | null>(null);
  /** Latest selectable time ("HH:MM"). */
  readonly maxTime = input<string | null>(null);
  /** Predicate marking individual times unselectable. */
  readonly disabledTime = input<((time: string) => boolean) | null>(null);
  /** Trigger height — sm/md/lg. */
  readonly size = input<TimePickerSize>('md');
  /** Disables the picker and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Applies error styling and marks the trigger `aria-invalid`. */
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Helper text shown below the picker. */
  readonly hint = input<string>('');
  /** Shown in the trigger when no time is set. */
  readonly placeholder = input<string>('--:--');
  /** Shows an inline clear button when a value is set — single mode only. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Accessible name for the trigger(s), suffixed "(from)"/"(to)" in range mode. */
  readonly ariaLabel = input<string | null>(null);
  /** Override the DS-config format for this instance. */
  readonly format = input<TimeFormat | null>(null);

  protected readonly uid = `ds-timepicker-${++nextId}`;
  protected readonly openSegment = signal<Segment | null>(null);
  private overlayRef: OverlayRef | null = null;

  protected readonly singleTrigger =
    viewChild<ElementRef<HTMLButtonElement>>('singleTrigger');
  protected readonly startTrigger =
    viewChild<ElementRef<HTMLButtonElement>>('startTrigger');
  protected readonly endTrigger =
    viewChild<ElementRef<HTMLButtonElement>>('endTrigger');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');
  protected readonly columns = viewChild(TimeColumnsComponent);

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );
  protected readonly hintId = computed(() =>
    this.hint() ? `${this.uid}-hint` : null,
  );
  protected readonly messageState = computed<FieldMessageState>(() =>
    this.invalid() ? 'error' : 'default',
  );
  protected readonly resolvedFormat = computed<TimeFormat>(
    () => this.format() ?? this.config.timePicker?.format ?? '24h',
  );

  protected readonly singleValue = computed(() => {
    const value = this.value();

    return typeof value === 'string' ? value : null;
  });
  protected readonly rangeValue = computed<TimeRangeValue>(() => {
    const value = this.value();

    return Array.isArray(value) ? value : [null, null];
  });
  protected readonly hasValue = computed(() => !!this.singleValue());
  protected readonly displayValue = computed(
    () => this.formatFor(this.singleValue()) || this.placeholder(),
  );

  protected readonly triggerClasses = computed(() => {
    const parts = ['trigger'];
    const size = this.size();
    if (size !== 'md') {
      parts.push(size);
    }
    if (this.isDisabled()) {
      parts.push('disabled');
    }
    if (this.invalid()) {
      parts.push('error');
    }
    if (this.mode() === 'single' && this.clearable() && this.hasValue()) {
      parts.push('has-clear');
    }

    return parts.join(' ');
  });

  /** Value the open column set edits (the active segment's value). */
  protected readonly panelValue = computed(() => {
    const segment = this.openSegment();
    if (segment === 'start') {
      return this.rangeValue()[0];
    }
    if (segment === 'end') {
      return this.rangeValue()[1];
    }

    return this.singleValue();
  });

  /** The end segment cannot precede the chosen start. */
  protected readonly panelMinTime = computed(() => {
    if (this.openSegment() !== 'end') {
      return this.minTime();
    }

    return this.laterOf(this.minTime(), this.rangeValue()[0]);
  });

  protected readonly panelMaxTime = computed(() => this.maxTime());

  protected ariaLabelFor(segment: Segment): string {
    const base = this.ariaLabel() ?? 'Select time';
    if (segment === 'start') {
      return `${base} (from)`;
    }
    if (segment === 'end') {
      return `${base} (to)`;
    }

    return base;
  }

  protected formatFor(value: string | null): string {
    return formatTime(value, this.resolvedFormat());
  }

  protected open(segment: Segment): void {
    if (this.isDisabled() || this.overlayRef) {
      return;
    }
    const triggerRef = this.triggerFor(segment);
    if (!triggerRef) {
      return;
    }
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(triggerRef.nativeElement)
      .withPositions([
        {
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
          offsetY: 4,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
          offsetY: -4,
        },
      ]);
    const cfg: OverlayConfig = {
      positionStrategy,
      hasBackdrop: false,
      panelClass: 'ds-overlay-pane',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    };
    this.overlayRef = this.overlay.create(cfg);
    forwardOverlayTokens(
      this.overlayRef,
      this.host.nativeElement,
      this.panelTokens,
    );
    closeOnOutsidePointer(
      this.overlayRef,
      (target) => this.host.nativeElement.contains(target),
      () => this.close(),
    );
    // No backdrop catches a page scroll and CDK's scroll strategies miss a plain
    // overflow container, so close on any outside scroll ourselves.
    const removeScrollClose = closeOnScroll(this.overlayRef, () =>
      this.close(),
    );
    this.overlayRef.detachments().subscribe(() => {
      removeScrollClose();
      this.overlayRef = null;
      this.openSegment.set(null);
    });
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.onEscape();
      }
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.openSegment.set(segment);
    afterNextRender(() => this.columns()?.focusSelected(), {
      injector: this.injector,
    });
  }

  protected onTriggerClick(segment: Segment): void {
    if (this.isDisabled()) {
      return;
    }
    if (this.overlayRef) {
      const wasSameSegment = this.openSegment() === segment;
      this.close();
      if (wasSameSegment) {
        return;
      }
    }
    this.open(segment);
  }

  protected close(): void {
    disposeWithLeave(this.overlayRef);
    this.overlayRef = null;
    this.openSegment.set(null);
    this.markTouched();
  }

  ngOnDestroy(): void {
    // Host torn down while open → close() never runs. Dispose the overlay so
    // its pane and event subscriptions don't leak.
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected onEscape(): void {
    const segment = this.openSegment();
    this.close();
    (segment ? this.triggerFor(segment) : null)?.nativeElement.focus();
  }

  protected onPick(next: string): void {
    const segment = this.openSegment();
    if (segment === 'start') {
      const end = this.rangeValue()[1];
      const bumped = end && this.minutesOf(end) < this.minutesOf(next);
      this.value.set([next, bumped ? next : end]);

      return;
    }
    if (segment === 'end') {
      this.value.set([this.rangeValue()[0], next]);

      return;
    }
    this.value.set(next);
  }

  protected setNow(): void {
    const now = new Date();
    const raw = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    const constraints: TimeConstraints = {
      minTime: this.panelMinTime(),
      maxTime: this.panelMaxTime(),
      disabledTime: this.disabledTime(),
    };
    this.onPick(clampToRange(snapToStep(raw, this.minuteStep()), constraints));
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
  }

  private triggerFor(
    segment: Segment,
  ): ElementRef<HTMLButtonElement> | undefined {
    if (segment === 'start') {
      return this.startTrigger();
    }
    if (segment === 'end') {
      return this.endTrigger();
    }

    return this.singleTrigger();
  }

  private minutesOf(value: string): number {
    return toMinutes(value) ?? 0;
  }

  private laterOf(a: string | null, b: string | null): string | null {
    if (!a) {
      return b;
    }
    if (!b) {
      return a;
    }

    return this.minutesOf(a) >= this.minutesOf(b) ? a : b;
  }
}
