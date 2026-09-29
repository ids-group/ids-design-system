import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';

/** A single calendar day cell of `<ds-date-picker>`'s grid, also usable standalone. The host is `display: contents` so the inner
 *  `<button class="day">` is the grid item and the date-picker can focus a day via `[data-day]` (roving tabindex).
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
  /** The chosen day in single mode, or an end of the range in range mode. Drives `aria-selected`. */
  readonly selected = input(false, { transform: booleanAttribute });
  /** A day BETWEEN the two ends of a range - tinted, but not itself selected. */
  readonly inRange = input(false, { transform: booleanAttribute });
  /** First day of a range: rounds the leading corners and counts as selected. */
  readonly rangeStart = input(false, { transform: booleanAttribute });
  /** Last day of a range: rounds the trailing corners and counts as selected. */
  readonly rangeEnd = input(false, { transform: booleanAttribute });
  /** Marks the current date. Independent of selection - today can be unselected. */
  readonly today = input(false, { transform: booleanAttribute });
  /** Day from an adjacent month - dimmed. */
  readonly muted = input(false, { transform: booleanAttribute });
  /** Outside `minDate`/`maxDate` or rejected by `disabledDate` - dimmed and not clickable. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Stable key the date-picker uses to focus a specific day (roving tabindex). */
  readonly dataDay = input<string | null>(null);
  /** Roving tabindex: exactly one day in the grid carries 0, the rest -1, so Tab enters the
   *  grid once and arrows move within it. */
  readonly tabIndex = input<number>(-1);
  /** Full spoken date ("12 March 2026"), since the cell text is only the day number. */
  readonly ariaLabel = input<string | null>(null);

  /** Click on an enabled day. Carries the event so the host can read modifier keys. */
  readonly daySelected = output<MouseEvent>();
  /** Key press on the focused day - the grid owns arrow/Home/End navigation, not the cell. */
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
