import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { LoadingOverlayComponent } from '@ids-group-ltd/ids-design-system/components/loading-overlay';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system/components/tooltip';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import type {
  EmptyStateAppearance,
  EmptyStateTitleOverflow,
  EmptyStateVariant,
} from './empty-state.types';

@Component({
  selector: 'ds-empty-state',
  standalone: true,
  imports: [IconComponent, LoadingOverlayComponent, TooltipDirective],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  host: { '[attr.title]': 'null' },
  encapsulation: ViewEncapsulation.Emulated,
})
export class EmptyStateComponent {
  /** Drives the default icon; `'loading'` shows a loading overlay. */
  readonly variant = input<EmptyStateVariant>('none');
  /** Override the variant's default icon. */
  readonly icon = input<IconName | null>(null);
  /** Optional heading below the icon. */
  readonly title = input<string>('');
  /** `'wrap'` breaks a long title over lines; `'clip'` keeps one line, ends it with an ellipsis
   *  and shows the full title in a tooltip. */
  readonly titleOverflow = input<EmptyStateTitleOverflow>('wrap');
  /** Optional supporting text below the title. */
  readonly body = input<string>('');
  /** `'tile'` draws the icon on a tinted tile under a bold title; `'plain'` draws a 32px icon with
   *  no tile, a semibold `--font-size-l` title and the body in `--text-tertiary`, for an empty
   *  section inside a page rather than an empty page. */
  readonly appearance = input<EmptyStateAppearance>('tile');

  protected readonly classes = computed(() =>
    [
      'empty-state',
      this.variant() === 'none' ? '' : this.variant(),
      this.appearance() === 'plain' ? 'plain' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly resolvedIcon = computed<IconName>(() => {
    const explicit = this.icon();
    if (explicit) {
      return explicit;
    }
    const variant = this.variant();
    if (variant === 'error') {
      return 'warn';
    }
    if (variant === 'locked') {
      return 'lock';
    }
    if (variant === 'success') {
      return 'success';
    }
    if (variant === 'loading') {
      return 'package';
    }

    return 'package';
  });
}
