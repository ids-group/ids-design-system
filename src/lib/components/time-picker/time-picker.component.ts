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
import { NgTemplateOutlet } from '@angular/common';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  clearOnDetach,
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  type DsOverlayCloseCause,
  focusIsInside,
  forwardOverlayTokens,
  dropdownOverlay,
  panelClassesOf,
  prepareOverlayEnter,
} from '@ids-group-ltd/ids-design-system/components';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import {
  DsControlValueAccessor,
  DsStaticPreview,
} from '@ids-group-ltd/ids-design-system/components';
import {
  FieldMessageComponent,
  FieldStatusComponent,
} from '@ids-group-ltd/ids-design-system/components/field-message';
import {
  resolveFieldMessage,
  trimmedText,
} from '@ids-group-ltd/ids-design-system/components';
import {
  TimeColumnsComponent,
  type TimeColumnId,
} from './time-columns/time-columns.component';
import {
  DS_CONFIG,
  DS_INTL,
  injectDsLocale,
} from '@ids-group-ltd/ids-design-system/core';
import {
  clampToRange,
  formatTime,
  localeTimeFormat,
  pad2,
  snapToStep,
  toMinutes,
} from './time.util';
import type {
  TimeConstraints,
  TimeFormat,
  TimePickerLoop,
  TimePickerMode,
  TimeRangeValue,
} from './time-picker.types';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

type Segment = 'single' | 'start' | 'end';
let nextId = 0;

function resolveTimeFormat(
  format: () => TimeFormat | null,
  configured: TimeFormat | undefined,
) {
  const fromLocale = localeTimeFormat(injectDsLocale());

  return computed<TimeFormat>(() => format() ?? configured ?? fromLocale);
}

@Component({
  selector: 'ds-time-picker',
  standalone: true,
  imports: [
    IconComponent,
    FieldMessageComponent,
    FieldStatusComponent,
    TimeColumnsComponent,
    NgTemplateOutlet,
  ],
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
  host: {
    '[attr.data-field-state]': 'controlState()',
    '[class.full-width]': 'fullWidth()',
  },
  hostDirectives: [{ directive: DsStaticPreview, inputs: ['staticPreview'] }],
})
export class TimePickerComponent
  extends DsControlValueAccessor<string | TimeRangeValue | null>
  implements OnDestroy
{
  constructor() {
    super();
  }

  private readonly config = inject(DS_CONFIG);
  protected readonly intl = inject(DS_INTL);
  protected readonly preview = inject(DsStaticPreview);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly panelTokens = [
    '--ds-time-picker-bg-color',
    '--ds-time-picker-border',
    '--ds-time-picker-shadow',
    '--ds-time-picker-panel-radius',
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
  /** Trigger height; falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Stretches the trigger to fill its container instead of hugging its content. */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /** Field label above the trigger. */
  readonly label = input<string>('');
  /** Marks the field required - shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Shows an "(optional)" marker beside the label - ignored when `required` is set. */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Extra classes for the portaled panel, the only way to style one instance of it. */
  readonly panelClass = input<string | readonly string[]>([]);
  /** Disables the picker and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Confirmation text, shown when there is no error or warning; paints the success border. */
  readonly success = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Shown in the trigger when no time is set. */
  readonly placeholder = input<string>('--:--');
  /** Shows an inline clear button when a value is set - single mode only. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Accessible name for the trigger(s), suffixed "(from)"/"(to)" in range mode. */
  readonly ariaLabel = input<string | null>(null);
  /** Display clock; falls back to `DS_CONFIG.timePicker.format`, then the hour cycle of `DS_CONFIG.locale` / `LOCALE_ID`. */
  readonly format = input<TimeFormat | null>(null);
  /** Whether the hour and minute columns run on past either end; falls back to
   *  `DS_CONFIG.timePicker.loop`, then `'auto'`, which loops a column that holds more values than it shows. */
  readonly loop = input<TimePickerLoop | null>(null);
  protected readonly loopResolved = resolveWithConfig(
    this.loop,
    (config) => config.timePicker?.loop,
    'auto' as TimePickerLoop,
  );

  protected readonly uid = `ds-timepicker-${++nextId}`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly openSegment = signal<Segment | null>(null);
  // Columns visited since this opening; single mode has no Done button and closes once every column is chosen, AM/PM included on a 12-hour clock. Reset on open.
  private readonly pickedParts = signal<ReadonlySet<TimeColumnId>>(new Set());
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

  /** Any of the three trigger boxes, not the host: clicking the label or message row must dismiss the panel. */
  private insideATrigger(target: Node): boolean {
    return [this.singleTrigger(), this.startTrigger(), this.endTrigger()].some(
      (trigger) => trigger?.nativeElement.contains(target) ?? false,
    );
  }

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );
  protected readonly hintId = computed(() =>
    this.message().text || this.changedShown() ? `${this.uid}-hint` : null,
  );
  private readonly fieldMessage = resolveFieldMessage({
    pending: this.pending,
    dirty: this.dirty,
    showDirty: this.showDirtyResolved,
    disabled: () => this.isDisabled(),
    hint: this.hint,
    warning: this.warning,
    error: this.error,
    errors: this.errors,
    invalid: this.invalid,
    success: this.success,
    touchedSelf: this.touchedSelf,
    touched: this.touched,
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly pendingShown = this.fieldMessage.pending;
  protected readonly changedShown = this.fieldMessage.changed;
  protected readonly controlState = this.fieldMessage.controlState;
  protected readonly invalidResolved = this.fieldMessage.invalid;
  readonly resolvedFormat = resolveTimeFormat(
    this.format,
    this.config.timePicker?.format,
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
  // Laid under the value, hidden: the trigger keeps the width of its widest time whether empty or filled.
  protected readonly widestValues = computed(() => [
    this.formatFor('00:00'),
    this.formatFor('12:00'),
  ]);

  protected readonly triggerClasses = computed(() => {
    const parts = ['trigger'];
    const size = this.sizeResolved();
    if (size !== 'md') {
      parts.push(size);
    }
    if (this.isDisabled()) {
      parts.push('disabled');
    }
    if (this.invalidResolved()) {
      parts.push('error');
    }
    if (this.mode() === 'single' && this.clearable() && this.hasValue()) {
      parts.push('has-clear');
    }

    return parts.join(' ');
  });

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
    // Range segments keep an aria-label built from the visible label for the from/to suffix.
    const base =
      this.ariaLabel() ?? (this.label() || this.intl().timePicker.selectTime);
    if (segment === 'start') {
      return this.intl().timePicker.rangeStart(base);
    }
    if (segment === 'end') {
      return this.intl().timePicker.rangeEnd(base);
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
    const { positionStrategy, config } = dropdownOverlay(
      this.overlay,
      triggerRef.nativeElement,
      ['ds-time-picker-panel', ...panelClassesOf(this.panelClass())],
    );
    this.overlayRef = this.overlay.create(config);
    prepareOverlayEnter(
      this.overlayRef,
      this.host.nativeElement,
      positionStrategy,
    );
    forwardOverlayTokens(
      this.overlayRef,
      this.host.nativeElement,
      this.panelTokens,
    );
    closeOnOutsidePointer(
      this.overlayRef,
      (target) => this.insideATrigger(target),
      () => this.close('dismiss'),
    );
    // No backdrop catches a page scroll and CDK scroll strategies miss a plain overflow container, so close on any outside scroll ourselves.
    const removeScrollClose = closeOnScroll(this.overlayRef, () =>
      this.close('dismiss'),
    );
    clearOnDetach(this.overlayRef, {
      current: () => this.overlayRef,
      always: removeScrollClose,
      clear: () => {
        this.overlayRef = null;
        this.openSegment.set(null);
      },
    });
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.onEscape('dismiss');
      }
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.openSegment.set(segment);
    this.pickedParts.set(new Set());
    afterNextRender(() => this.columns()?.focusSelected(), {
      injector: this.injector,
    });
  }

  protected onTriggerClick(segment: Segment): void {
    if (this.isDisabled() || this.preview.staticPreview()) {
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

  protected close(cause: DsOverlayCloseCause = 'select'): void {
    if (this.preview.staticPreview()) {
      return;
    }
    const segment = this.openSegment();
    const focusWasInPanel = this.overlayRef
      ? focusIsInside(this.overlayRef)
      : false;
    disposeWithLeave(this.overlayRef, cause);
    this.overlayRef = null;
    this.openSegment.set(null);
    this.markTouched();
    if (focusWasInPanel && segment) {
      this.triggerFor(segment)?.nativeElement.focus({ preventScroll: true });
    }
  }

  ngOnDestroy(): void {
    // A host torn down while open never runs close().
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  protected onEscape(cause: DsOverlayCloseCause = 'dismiss'): void {
    this.close(cause);
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

  protected onPartPicked(part: TimeColumnId): void {
    const seen = new Set(this.pickedParts()).add(part);
    this.pickedParts.set(seen);
    const periodChosen = this.resolvedFormat() === '24h' || seen.has('period');
    if (
      this.mode() === 'single' &&
      seen.has('hours') &&
      seen.has('minutes') &&
      periodChosen
    ) {
      this.close('select');
    }
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
