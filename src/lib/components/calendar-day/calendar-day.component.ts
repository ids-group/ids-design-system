import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';

/** A single calendar day cell of `<ds-date-picker>`'s grid.
 * @internal
 */
@Component({
  selector: 'ds-calendar-day',
  standalone: true,
  templateUrl: './calendar-day.component.html',
  styleUrl: './calendar-day.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    role: 'gridcell',
    '[attr.aria-selected]':
      "selected() || rangeStart() || rangeEnd() ? 'true' : null",
  },
})
export class CalendarDayComponent {
  /** The chosen day, or an end of the range. Drives `aria-selected`. */
  readonly selected = input(false, { transform: booleanAttribute });
  /** A day between the two ends of a range. */
  readonly inRange = input(false, { transform: booleanAttribute });
  /** First day of a range. */
  readonly rangeStart = input(false, { transform: booleanAttribute });
  /** Last day of a range. */
  readonly rangeEnd = input(false, { transform: booleanAttribute });
  /** Marks the current date. */
  readonly today = input(false, { transform: booleanAttribute });
  /** Day from an adjacent month. */
  readonly muted = input(false, { transform: booleanAttribute });
  /** Outside `minDate`/`maxDate` or rejected by `disabledDate`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Stable key the date-picker uses to focus a day. */
  readonly dataDay = input<string | null>(null);
  /** Roving tabindex: one day carries 0, the rest -1. */
  readonly tabIndex = input<number>(-1);
  /** Full spoken date ("12 March 2026"). */
  readonly ariaLabel = input<string | null>(null);

  /** Click on an enabled day. */
  readonly daySelected = output<MouseEvent>();
  /** Key press on the focused day. */
  readonly dayKeydown = output<KeyboardEvent>();

  protected readonly classes = computed(() => {
    const parts = ['day'];
    if (this.muted()) {
      parts.push('muted');
    }
    if (this.today()) {
      parts.push('today');
    }
    if (this.inRange()) {
      parts.push('in-range');
    }
    if (this.rangeStart()) {
      parts.push('range-start');
    }
    if (this.rangeEnd()) {
      parts.push('range-end');
    }
    if (this.selected()) {
      parts.push('selected');
    }
    if (this.disabled()) {
      parts.push('disabled');
    }

    return parts.join(' ');
  });
}
