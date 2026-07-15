import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { TagVariant } from './tag.types';

@Component({
  selector: 'ds-tag',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './tag.component.html',
  styleUrl: './tag.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.neutral]': "variant() === 'neutral'",
    '[class.closable]': 'closable()',
    '[class.interactive]': 'interactive()',
    '[class.is-active]': 'selected()',
    '(click)': 'onClick()',
  },
})
export class TagComponent {
  /** Fill style — `solid` for high-emphasis, `neutral` for low-emphasis chips. */
  readonly variant = input<TagVariant>('solid');
  /** Shows a close button that emits `closed`. */
  readonly closable = input(false, { transform: booleanAttribute });
  /** Makes the tag clickable, emitting `toggled` on click. */
  readonly interactive = input(false, { transform: booleanAttribute });
  /** Applies the active/selected visual state. */
  readonly selected = input(false, { transform: booleanAttribute });
  /** Accessible label for the close button (e.g. "Remove Source filter"). */
  readonly closeLabel = input<string>('Remove');
  /** Fires when the close button is clicked. */
  readonly closed = output<void>();
  /** Fires on click when `interactive` is true. */
  readonly toggled = output<void>();

  protected onClick(): void {
    if (this.interactive()) {
      this.toggled.emit();
    }
  }
}
