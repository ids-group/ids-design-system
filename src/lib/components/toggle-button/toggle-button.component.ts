import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  model,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';

/** A single binary toggle button (pressed / not pressed) with an optional
 *  leading icon and a projected label. Distinct from `ds-segmented` (a
 *  one-of-many value toggle) — this is a standalone on/off control. */
@Component({
  selector: 'ds-toggle-button',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './toggle-button.component.html',
  styleUrl: './toggle-button.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ToggleButtonComponent {
  readonly pressed = model<boolean>(false);
  readonly icon = input<string>('');
  readonly disabled = input(false, { transform: booleanAttribute });

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    this.pressed.update((value) => !value);
  }
}
