import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import type { ButtonColor } from '../button/button.types';
import type { IconButtonType, IconButtonVariant } from './icon-button.types';
import type { DsSize } from '../../core/size';
import { resolveWithConfig } from '../../core/config-defaults';

/**
 * Icon-only action button with its own variant taxonomy (standard / filled /
 * tonal / outlined) + an optional toggle (`selected`) state. Distinct from
 * `ds-button` — use this for square/round icon affordances; use `ds-button`
 * for labelled actions. `ariaLabel` is REQUIRED (icon-only has no text label).
 */
@Component({
  selector: 'ds-icon-button',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class IconButtonComponent {
  /** Icon to render — the button's only visible content. */
  readonly icon = input.required<IconName>();
  /** Accessible name — required since the button has no visible text. */
  readonly ariaLabel = input.required<string>();
  /** ARIA `aria-describedby` — the id of text the app renders beside the button,
   *  such as why the action is refused. Icon-only leaves no room for a second
   *  line, so unlike `ds-button` there is no `disabledReason` here: the text has
   *  to exist on screen already for this to point at it. */
  readonly ariaDescribedBy = input<string | null>(null);
  /** Fill style — standard (chromeless), filled, tonal, or outlined. */
  readonly variant = input<IconButtonVariant>('standard');
  /** Brand/status hue family (shared with ds-button). `variant` is the fill
      axis; `color` recolours the accent the fill consumes. Default primary. */
  readonly color = input<ButtonColor>('primary');
  /** Button size — sm/md/lg, matches the field/button height scale.
   *  Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Native `<button>` `type`; defaults to `'button'` (not `'submit'`) so it never submits an ancestor form by accident. */
  readonly type = input<IconButtonType>('button');
  /** Disables the button and blocks `pressed`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Toggle state — renders the pressed/active look and sets aria-pressed. */
  readonly selected = input(false, { transform: booleanAttribute });
  /** ARIA `aria-expanded`, forwarded to the inner `<button>` — bind to the open
   *  state when this button opens a panel. On the host element it would land on
   *  a non-focusable wrapper, which no screen reader reads. */
  readonly ariaExpanded = input<boolean | null>(null);
  /** ARIA `aria-controls`, forwarded to the inner `<button>` — the id of the
   *  panel this button opens, e.g. `ds-app-layout`'s `railId`. */
  readonly ariaControls = input<string | null>(null);
  /** Fires on click, unless disabled. */
  readonly pressed = output<MouseEvent>();

  protected readonly classes = computed(() => {
    const parts = ['icon-button', this.variant(), this.sizeResolved()];
    if (this.color() !== 'primary') {
      parts.push(`c-${this.color()}`);
    }
    if (this.selected()) {
      parts.push('selected');
    }

    return parts.join(' ');
  });

  protected readonly iconSize = computed(() => {
    const size = this.sizeResolved();
    if (size === 'sm') {
      return 16;
    }
    if (size === 'lg') {
      return 24;
    }

    return 20;
  });

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    this.pressed.emit(event);
  }
}
