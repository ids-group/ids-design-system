import {
  Component,
  ElementRef,
  Injector,
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
import { disposeWithLeave } from '../overlay-motion';
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
} from './time.util';
import type {
  TimeConstraints,
  TimeFormat,
  TimePickerSize,
  TimeRangeValue,
} from './time-picker.types';

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
export class TimePickerComponent extends DsControlValueAccessor<
  string | TimeRangeValue | null
> {
  constructor() {
    super();
  }

  private readonly config = inject(DS_CONFIG);
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);

  readonly value = model<string | TimeRangeValue | null>(null);
  readonly minuteStep = input(1, { transform: numberAttribute });
  readonly minTime = input<string | null>(null);
  readonly maxTime = input<string | null>(null);
  readonly disabledTime = input<((time: string) => boolean) | null>(null);
  readonly size = input<TimePickerSize>('md');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly hint = input<string>('');
  readonly placeholder = input<string>('--:--');
  readonly clearable = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null);
  /** Override the DS-config format for this instance. */
  readonly format = input<TimeFormat | null>(null);

  protected readonly uid = `ds-timepicker-${++nextId}`;
  protected readonly isOpen = signal(false);
  private overlayRef: OverlayRef | null = null;

  protected readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
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
  protected readonly resolvedAriaLabel = computed(
    () => this.ariaLabel() ?? 'Select time',
  );

  /** The value as a single "HH:MM" string (null in range mode / when unset). */
  protected readonly singleValue = computed(() => {
    const value = this.value();

    return typeof value === 'string' ? value : null;
  });
  protected readonly hasValue = computed(() => !!this.singleValue());
  protected readonly displayValue = computed(
    () =>
      formatTime(this.singleValue(), this.resolvedFormat()) ||
      this.placeholder(),
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
    if (this.clearable() && this.hasValue()) {
      parts.push('has-clear');
    }

    return parts.join(' ');
  });

  private readonly constraints = computed<TimeConstraints>(() => ({
    minTime: this.minTime(),
    maxTime: this.maxTime(),
    disabledTime: this.disabledTime(),
  }));

  protected open(): void {
    if (this.isDisabled() || this.overlayRef) {
      return;
    }
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.trigger().nativeElement)
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
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: 'ds-overlay-pane',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    };
    this.overlayRef = this.overlay.create(cfg);
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.onEscape();
      }
    });
    this.overlayRef.attach(new TemplatePortal(this.panelTpl(), this.vcr));
    this.isOpen.set(true);
    afterNextRender(() => this.columns()?.focusSelected(), {
      injector: this.injector,
    });
  }

  protected close(): void {
    disposeWithLeave(this.overlayRef);
    this.overlayRef = null;
    this.isOpen.set(false);
    this.markTouched();
  }

  protected onEscape(): void {
    this.close();
    this.trigger().nativeElement.focus();
  }

  protected onPick(next: string): void {
    this.value.set(next);
  }

  protected setNow(): void {
    const now = new Date();
    const raw = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
    this.value.set(clampToRange(snapToStep(raw, this.minuteStep()), this.constraints()));
  }

  protected clear(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
  }
}
