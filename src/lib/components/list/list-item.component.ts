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
  host: {
    role: 'listitem',
    '[class.clickable]': 'clickable()',
    '[class.selected]': 'selected()',
    '[class.disabled]': 'disabled()',
  },
})
export class ListItemComponent {
  /** Convenience text; richer middle content can be projected as default content. */
  readonly title = input<string>('');
  /** Secondary line below `title`. */
  readonly subtitle = input<string>('');
  /** Whole-row navigation: renders an inner button and emits `activated`. */
  readonly clickable = input(false, { transform: booleanAttribute });
  /** Marks the row current via `aria-current`. */
  readonly selected = input(false, { transform: booleanAttribute });
  /** Disables the row; only affects the button when `clickable`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Fires when the clickable row's button is activated. */
  readonly activated = output<void>();
}
