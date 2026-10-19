import { Component, ViewEncapsulation, computed, input } from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { LoadingOverlayComponent } from '@ids-group-ltd/ids-design-system/components/loading-overlay';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system/components/tooltip';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import type { EmptyStateTitleOverflow, EmptyStateVariant } from './empty-state.types';

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

  protected readonly classes = computed(() => {
    const variant = this.variant();

    return variant === 'none' ? 'empty-state' : `empty-state ${variant}`;
  });

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
