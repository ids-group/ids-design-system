import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';
import { retainStyles } from '@ids-group-ltd/ids-design-system/core';
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
  /** Offset the scrim top edge, e.g. to keep a sticky header uncovered. */
  readonly insetTop = input<string>('0');

  /**
   * Whether the projected content goes `inert` while the scrim is up. On by
   * default, so focus cannot walk under the scrim. Turn it off only when the
   * scrim covers part of the content (`insetTop`) and mark the covered subtree
   * `inert` yourself.
   */
  readonly inertContent = input(true, { transform: booleanAttribute });

  constructor() {
    retainStyles(LoadingOverlayComponent);
  }
}
