import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';

/** A single calendar day cell — the building block of `<ds-date-picker>`'s grid,
 *  also usable standalone (e.g. a state showcase). Renders a focusable
 *  `<button class="day">` whose state classes are driven by inputs. The host is
 *  `display: contents` so the inner button is the grid item, and the date-picker
 *  can still focus a specific day via `[data-day]` (roving tabindex). */
@Component({
  selector: 'ds-calendar-day',
  standalone: true,
  templateUrl: './calendar-day.component.html',
  styleUrl: './calendar-day.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class CalendarDayComponent {
  readonly selected = input(false, { transform: booleanAttribute });
  readonly inRange = input(false, { transform: booleanAttribute });
  readonly rangeStart = input(false, { transform: booleanAttribute });
  readonly rangeEnd = input(false, { transform: booleanAttribute });
  readonly today = input(false, { transform: booleanAttribute });
  /** Day from an adjacent month — dimmed. */
  readonly muted = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Stable key the date-picker uses to focus a specific day (roving tabindex). */
  readonly dataDay = input<string | null>(null);
  readonly tabIndex = input<number>(-1);
  readonly ariaLabel = input<string | null>(null);

  readonly daySelect = output<MouseEvent>();
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
