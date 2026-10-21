import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import { DsControlValueAccessor } from '@ids-group-ltd/ids-design-system/components';
import {
  FieldMessageComponent,
  FieldStatusComponent,
} from '@ids-group-ltd/ids-design-system/components/field-message';
import { resolveFieldMessage } from '@ids-group-ltd/ids-design-system/components';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';

type SliderValue = number | readonly [number, number];

@Component({
  selector: 'ds-slider',
  standalone: true,
  imports: [FieldMessageComponent, FieldStatusComponent],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true,
    },
  ],
  host: {
    '[class.range]': 'range()',
    '[class.disabled]': 'isDisabled()',
    '[class.invalid]': 'invalidResolved()',
  },
})
export class SliderComponent extends DsControlValueAccessor<SliderValue> {
  protected readonly intl = inject(DS_INTL);
  /** Current value, or `[low, high]` when `range`. */
  readonly value = model<SliderValue>(0);
  /** Minimum selectable value. */
  readonly min = input(0, { transform: numberAttribute });
  /** Maximum selectable value. */
  readonly max = input(100, { transform: numberAttribute });
  /** Snap increment for dragging and arrow keys. */
  readonly step = input(1, { transform: numberAttribute });
  /** Two-thumb mode: `value` becomes a `[low, high]` tuple. */
  readonly range = input(false, { transform: booleanAttribute });
  /** Disables the slider and blocks all interaction. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Accessible name of the thumb(s); suffixed "minimum"/"maximum" in `range` mode. */
  readonly ariaLabel = input<string | null>(null);

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private dragging = -1;

  protected readonly uid = nextControlId('ds-slider');
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
  });
  protected readonly message = this.fieldMessage.message;
  protected readonly pendingShown = this.fieldMessage.pending;
  protected readonly changedShown = this.fieldMessage.changed;
  protected readonly invalidResolved = this.fieldMessage.invalid;

  protected readonly isDisabled = computed(
    () => this.disabled() || this.formDisabled(),
  );

  protected readonly thumbValues = computed<number[]>(() => {
    const value = this.value();
    if (this.range()) {
      const [low, high] = value as readonly [number, number];

      return [low, high];
    }

    return [value as number];
  });

  protected readonly fill = computed<{ left: number; width: number }>(() => {
    const values = this.thumbValues();
    if (this.range()) {
      const low = this.percent(values[0]);
      const high = this.percent(values[1]);

      return { left: low, width: high - low };
    }

    return { left: 0, width: this.percent(values[0]) };
  });

  protected percent(value: number): number {
    const min = this.min();
    const max = this.max();

    return max === min ? 0 : ((value - min) / (max - min)) * 100;
  }

  protected thumbMin(index: number): number {
    return this.range() && index === 1 ? this.thumbValues()[0] : this.min();
  }

  protected thumbMax(index: number): number {
    return this.range() && index === 0 ? this.thumbValues()[1] : this.max();
  }

  protected onTrackPointerDown(event: PointerEvent): void {
    if (this.isDisabled()) {
      return;
    }
    const track = this.track().nativeElement;
    track.setPointerCapture(event.pointerId);
    this.dragging = this.nearestThumb(event.clientX);
    this.updateFromClientX(event.clientX);
    track.querySelectorAll<HTMLElement>('.thumb')[this.dragging]?.focus();
  }

  protected onTrackPointerMove(event: PointerEvent): void {
    if (this.dragging < 0) {
      return;
    }
    this.updateFromClientX(event.clientX);
  }

  // Bound to pointerup and pointercancel: touch interventions fire pointercancel, and without it
  // the drag state leaks and keeps moving the thumb with no pointer down.
  protected onTrackPointerUp(event: PointerEvent): void {
    if (this.dragging < 0) {
      return;
    }
    const track = this.track().nativeElement;
    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }
    this.dragging = -1;
    this.markTouched();
  }

  protected thumbAriaLabel(index: number): string | null {
    const base = this.ariaLabel();
    if (!this.range()) {
      return base;
    }

    return index === 0
      ? this.intl().slider.rangeStart(base ?? '')
      : this.intl().slider.rangeEnd(base ?? '');
  }

  protected onThumbKeydown(event: KeyboardEvent, index: number): void {
    if (this.isDisabled()) {
      return;
    }
    const step = this.step() || 1;
    let delta = 0;
    let absolute: number | null = null;
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        delta = step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        delta = -step;
        break;
      case 'PageUp':
        delta = step * 10;
        break;
      case 'PageDown':
        delta = -step * 10;
        break;
      case 'Home':
        absolute = this.thumbMin(index);
        break;
      case 'End':
        absolute = this.thumbMax(index);
        break;
      default:
        return;
    }
    event.preventDefault();
    const current = this.thumbValues()[index];
    this.setThumb(index, absolute ?? this.snap(current + delta));
  }

  private nearestThumb(clientX: number): number {
    if (!this.range()) {
      return 0;
    }
    const value = this.valueFromClientX(clientX);
    const [low, high] = this.thumbValues();

    return Math.abs(value - low) <= Math.abs(value - high) ? 0 : 1;
  }

  private updateFromClientX(clientX: number): void {
    this.setThumb(this.dragging, this.snap(this.valueFromClientX(clientX)));
  }

  private valueFromClientX(clientX: number): number {
    const rect = this.track().nativeElement.getBoundingClientRect();
    if (rect.width === 0) {
      return this.min();
    }
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));

    return this.min() + ratio * (this.max() - this.min());
  }

  private setThumb(index: number, next: number): void {
    if (this.range()) {
      const [low, high] = this.thumbValues();
      this.value.set(
        index === 0 ? [Math.min(next, high), high] : [low, Math.max(next, low)],
      );
    } else {
      this.value.set(next);
    }
  }

  private snap(raw: number): number {
    const step = this.step() || 1;
    const min = this.min();
    const snapped = Math.round((raw - min) / step) * step + min;

    return Math.min(this.max(), Math.max(min, snapped));
  }
}
