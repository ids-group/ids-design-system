import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
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
    '[attr.role]': "interactive() ? 'button' : null",
    '[attr.tabindex]': 'interactive() ? 0 : null',
    '[attr.aria-pressed]': 'interactive() ? selected() : null',
    '(click)': 'onClick()',
    '(keydown.enter)': 'onKeyActivate($event)',
    '(keydown.space)': 'onKeyActivate($event)',
  },
})
export class TagComponent {
  protected readonly intl = inject(DS_INTL);
  /** `solid` for high emphasis, `neutral` for low-emphasis chips. */
  readonly variant = input<TagVariant>('solid');
  /** Shows a close button that emits `closed`. */
  readonly closable = input(false, { transform: booleanAttribute });
  /** Makes the tag clickable, emitting `toggled`. */
  readonly interactive = input(false, { transform: booleanAttribute });
  /** Applies the active/selected visual state. */
  readonly selected = input(false, { transform: booleanAttribute });
  /** Accessible label of the close button, e.g. "Remove Source filter". Unset falls back to
   *  `DS_INTL.tag.remove`. */
  readonly closeLabel = input<string | null>(null);
  readonly closeLabelResolved = computed(
    () => this.closeLabel() ?? this.intl().tag.remove,
  );
  /** Fires when the close button is clicked. */
  readonly closed = output<void>();
  /** Fires on a click, Enter or Space when `interactive`. */
  readonly toggled = output<void>();

  protected onClick(): void {
    if (this.interactive()) {
      this.toggled.emit();
    }
  }

  // A key pressed on the close button bubbles here and must not toggle the tag as well.
  protected onKeyActivate(event: Event): void {
    if (!this.interactive() || event.target !== event.currentTarget) {
      return;
    }
    event.preventDefault();
    this.toggled.emit();
  }
}
