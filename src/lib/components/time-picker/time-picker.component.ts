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
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  closeOnOutsidePointer,
  closeOnScroll,
  disposeWithLeave,
  type DsOverlayCloseCause,
  focusIsInside,
  forwardOverlayTokens,
  dropdownOverlay,
  prepareOverlayEnter,
} from '@ids-group-ltd/ids-design-system/components';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { DsControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import { FieldMessageComponent } from '@ids-group-ltd/ids-design-system/components/field-message';
import {
  resolveFieldMessage,
  trimmedText,
} from '@ids-group-ltd/ids-design-system/components';
import {
  TimeColumnsComponent,
  type TimeColumnId,
} from './time-columns/time-columns.component';
import { DS_CONFIG } from '@ids-group-ltd/ids-design-system/core';
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
  TimeRangeValue,
} from './time-picker.types';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

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
  host: {
    '[attr.data-field-state]': 'controlState()',
    '[class.full-width]': 'fullWidth()',
  },
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
  /** Trigger height — sm/md/lg.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Stretch the trigger to fill its container instead of hugging its content —
   *  opt in when the field shares a grid/flex track with inputs. */
  readonly fullWidth = input(false, { transform: booleanAttribute });
  /** Field label shown above the trigger — same row a `ds-date-picker` label
   *  occupies, so date + time in one form row line up without a hand-rolled label. */
  readonly label = input<string>('');
  /** Marks the field required — shows an asterisk and sets `aria-required`. */
  readonly required = input(false, { transform: booleanAttribute });
  /** Shows an "(optional)" marker beside the label — ignored when `required` is set. */
  readonly optional = input(false, { transform: booleanAttribute });
  /** Disables the picker and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Confirmation text, shown when there is no error or warning — and it paints
   *  the field's success border. A string like `warning`: the text IS the state. */
  readonly success = input<string, string | null | undefined>('', {
    transform: trimmedText,
  });
  /** Shown in the trigger when no time is set. */
  readonly placeholder = input<string>('--:--');
  /** Shows an inline clear button when a value is set — single mode only. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** Accessible name for the trigger(s), suffixed "(from)"/"(to)" in range mode. */
  readonly ariaLabel = input<string | null>(null);
  /** Override the DS-config format for this instance. */
  readonly format = input<TimeFormat | null>(null);

  protected readonly uid = `ds-timepicker-${++nextId}`;
  protected readonly labelId = `${this.uid}-label`;
  protected readonly openSegment = signal<Segment | null>(null);
  // Which columns the user has been through since THIS opening. In single mode
  // the panel has no Done button, so it closes itself once both halves of a time
  // have been chosen — "picked an hour and a minute" is the completion. Reset on
  // open, so re-opening a field that already holds a value asks for both again
  // rather than closing on the first tap.
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

  /** Any of the three trigger boxes, not the host: a range renders two and a single
   *  one renders one, while the host also carries the label and the message row —
   *  clicking those has to dismiss the panel. */
  private insideATrigger(target: Node): boolean {
    return [this.singleTrigger(), this.startTrigger(), this.endTrigger()].some(
      (trigger) => trigger?.nativeElement.contains(target) ?? false,
    );
  }

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );
  protected readonly hintId = computed(() =>
    this.message().text ? `${this.uid}-hint` : null,
  );
  private readonly fieldMessage = resolveFieldMessage({
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
  protected readonly controlState = this.fieldMessage.controlState;
  protected readonly invalidResolved = this.fieldMessage.invalid;
  readonly resolvedFormat = computed<TimeFormat>(
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
    // A visible label is the accessible name; range segments still need the
    // from/to suffix, so they keep an aria-label built from it.
    const base = this.ariaLabel() ?? (this.label() || 'Select time');
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
    const { positionStrategy, config } = dropdownOverlay(
      this.overlay,
      triggerRef.nativeElement,
      'ds-overlay-pane',
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
    // No backdrop catches a page scroll and CDK's scroll strategies miss a plain
    // overflow container, so close on any outside scroll ourselves.
    const removeScrollClose = closeOnScroll(this.overlayRef, () =>
      this.close('dismiss'),
    );
    this.overlayRef.detachments().subscribe(() => {
      removeScrollClose();
      this.overlayRef = null;
      this.openSegment.set(null);
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

  protected close(cause: DsOverlayCloseCause = 'select'): void {
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
    // Host torn down while open → close() never runs. Dispose the overlay so
    // its pane and event subscriptions don't leak.
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
    if (this.mode() === 'single' && seen.has('hours') && seen.has('minutes')) {
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
