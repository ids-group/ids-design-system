import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  input,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ds-list-item',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  // A static `title="…"` also stays as the global attribute, giving the whole host a native tooltip.
  host: {
    '[attr.title]': 'null',
    role: 'listitem',
    '[attr.aria-current]': "selected() ? 'true' : null",
    '[class.clickable]': 'clickable()',
    '[class.selected]': 'selected()',
    '[class.disabled]': 'disabled()',
  },
})
export class ListItemComponent {
  /** Row text; richer content can be projected instead. */
  readonly title = input<string>('');
  /** Secondary line below `title`. */
  readonly subtitle = input<string>('');
  /** Makes the row's text a button that emits `activated`. `[leading]` and
   *  `[trailing]` stay outside it, so a row can hold its own controls as well. */
  readonly clickable = input(false, { transform: booleanAttribute });
  /** Marks the row current: `aria-current` and the selected tint. */
  readonly selected = input(false, { transform: booleanAttribute });
  /** Disables the row's own button. Controls projected into `[leading]` or
   *  `[trailing]` keep their own disabled state. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Fires when the clickable row's button is activated. */
  readonly activated = output<void>();
}
