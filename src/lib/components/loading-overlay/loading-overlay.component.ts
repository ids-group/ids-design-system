import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';
import { SpinnerComponent } from '@ids-group-ltd/ids-design-system/components/spinner';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';

@Component({
  selector: 'ds-loading-overlay',
  standalone: true,
  imports: [SpinnerComponent],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[attr.aria-busy]': 'loading() ? "true" : null',
  },
})
export class LoadingOverlayComponent {
  /** Show the scrim + spinner over the projected region. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Optional caption beneath the spinner. */
  readonly label = input<string>('');
  /** Backdrop-blur the projected content behind the scrim. */
  readonly blur = input(true, { transform: booleanAttribute });
  /** Size of the spinner shown in the scrim. */
  readonly spinnerSize = input<DsSize>('md');
  /** Offset the scrim top edge — useful when a sticky header should stay uncovered. */
  readonly insetTop = input<string>('0');

  /**
   * Whether the projected content goes `inert` while the scrim is up. On by
   * default, because a scrim that only stops the POINTER is the bug this exists
   * to prevent: focus walks straight under it, and a keyboard user activates a
   * control the mouse cannot even reach.
   *
   * Turn it off only when the scrim covers part of the content (`insetTop`), and
   * then mark the covered subtree `inert` yourself — a blanket flag would take
   * the uncovered part with it. `ds-table` does exactly that: the scrim starts
   * below the header, so sorting during a refresh stays possible.
   */
  readonly inertContent = input(true, { transform: booleanAttribute });
}
