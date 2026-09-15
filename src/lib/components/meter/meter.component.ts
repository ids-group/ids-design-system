import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  numberAttribute,
} from '@angular/core';

/**
 * One track and one fill, for a measurement inside a table cell.
 *
 * A chart is a block with a caption, a legend and an annex table; in a 60px cell that chrome is
 * the whole cell. This is the mark on its own — no caption, no legend, no tooltip, no table.
 *
 * It is NOT `ds-progress`, which reports how far a task has got and says so with
 * `role="progressbar"`. A rate, a score or a count against a ceiling is a measurement: it has no
 * beginning and no completion, and a table of two hundred of them would announce two hundred
 * progress bars. Here the mark is hidden from assistive technology unless `ariaLabel` names it,
 * because the cell beside it almost always prints the number already.
 */
@Component({
  selector: 'ds-meter',
  standalone: true,
  imports: [],
  templateUrl: './meter.component.html',
  styleUrl: './meter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[attr.role]': "ariaLabel() ? 'meter' : null",
    '[attr.aria-hidden]': 'ariaLabel() ? null : true',
    '[attr.aria-valuemin]': 'ariaLabel() ? 0 : null',
    '[attr.aria-valuemax]': 'ariaLabel() ? scale() : null',
    '[attr.aria-valuenow]': 'ariaLabel() ? clamped() : null',
    '[attr.aria-label]': 'ariaLabel()',
  },
})
export class MeterComponent {
  /** The measurement, in units of `max`. Clamped to the track. */
  readonly value = input(0, { transform: numberAttribute });
  /** The ceiling `value` is read against — the column's own largest, or the scale the number
   *  means something on. Left at 100, `value` is a percentage. Zero or less falls back to 100,
   *  because a scale with no width has no fraction to draw. */
  readonly max = input(100, { transform: numberAttribute });
  /** The fill's colour. Unset takes `--ds-meter-fill-color`, so a column is coloured once in a
   *  stylesheet rather than per row; set it per row where the colour carries meaning. */
  readonly color = input<string | null>(null);
  /** Names the measurement, and is what decides whether it is announced at all. Unset, the mark
   *  is `aria-hidden` — right where the cell prints the figure beside it, and wrong where the bar
   *  is the only place the number appears. */
  readonly ariaLabel = input<string | null>(null);

  protected readonly scale = computed(() => {
    const max = this.max();

    return Number.isFinite(max) && max > 0 ? max : 100;
  });

  protected readonly clamped = computed(() => {
    const value = this.value();

    return Number.isFinite(value)
      ? Math.max(0, Math.min(this.scale(), value))
      : 0;
  });

  protected readonly percent = computed(
    () => (this.clamped() / this.scale()) * 100,
  );
}
