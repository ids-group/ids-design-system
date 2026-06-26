import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
} from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';
import type { SpinnerSize } from '../spinner/spinner.types';

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
  // Show the scrim + spinner over the projected region.
  readonly loading = input(false, { transform: booleanAttribute });
  // Optional caption beneath the spinner.
  readonly label = input<string>('');
  readonly blur = input(true, { transform: booleanAttribute });
  readonly spinnerSize = input<SpinnerSize>('md');
}
