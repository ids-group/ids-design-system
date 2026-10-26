import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import type { ButtonColor } from '@ids-group-ltd/ids-design-system/components/button';
import type { IconButtonType, IconButtonVariant } from './icon-button.types';
import type { DsSize } from '@ids-group-ltd/ids-design-system/core';
import { resolveWithConfig } from '@ids-group-ltd/ids-design-system/core';

/**
 * Icon-only action button with variants (standard / filled / tonal / outlined) and an optional
 * toggle (`selected`) state. Use `ds-button` for labelled actions. `ariaLabel` is required.
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
  /** Icon to render - the button's only visible content. */
  readonly icon = input.required<IconName>();
  /** Accessible name; required since the button has no visible text. */
  readonly ariaLabel = input.required<string>();
  /** `aria-describedby`: the id of text the app already renders beside the button, such as why
   *  the action is refused. */
  readonly ariaDescribedBy = input<string | null>(null);
  /** Fill style; `standard` is chromeless. */
  readonly variant = input<IconButtonVariant>('standard');
  /** Brand/status hue family, shared with ds-button. `color` recolours the accent the fill uses. */
  readonly color = input<ButtonColor>('primary');
  /** Unset falls back to `DS_CONFIG.control.size`, then `'md'`. */
  readonly size = input<DsSize | null>(null);
  readonly sizeResolved = resolveWithConfig(
    this.size,
    (config) => config.control?.size,
    'md' as DsSize,
  );
  /** Native `type`; defaults to `'button'` so it never submits an ancestor form. */
  readonly type = input<IconButtonType>('button');
  /** Disables the button and blocks `pressed`. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Toggle state: renders the pressed look and sets `aria-pressed`, `"false"` when bound off.
   *  Unbound, the button is no toggle and carries no `aria-pressed`. */
  readonly selected = input<boolean | null>(null, {
    transform: (value: unknown) =>
      value == null ? null : booleanAttribute(value),
  });
  /** `aria-haspopup` on the inner `<button>`; set when this button triggers an overlay. */
  readonly ariaHasPopup = input<
    'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog' | null
  >(null);
  /** `aria-expanded` on the inner `<button>`; bind to the open state. On the host it would land
   *  on a non-focusable wrapper. */
  readonly ariaExpanded = input<boolean | null>(null);
  /** `aria-controls` on the inner `<button>`: the id of the panel this button opens. */
  readonly ariaControls = input<string | null>(null);
  /** Fires on click unless disabled. */
  readonly pressed = output<MouseEvent>();

  /** The inner control, for an overlay to position against and restore focus to. */
  readonly controlRef = viewChild.required<ElementRef<HTMLElement>>('btn');

  protected readonly classes = computed(() => {
    const parts = ['icon-button', this.variant(), this.sizeResolved()];
    if (this.color() !== 'primary') {
      parts.push(`color-${this.color()}`);
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
