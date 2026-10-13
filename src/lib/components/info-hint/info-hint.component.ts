import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { devWarn, type IconName } from '@ids-group-ltd/ids-design-system/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system/components/tooltip';
import {
  givenInfoHintSources,
  infoHintSourceWarning,
} from './info-hint-source';

function rendersSomething(node: Node): boolean {
  return (
    node.nodeType === Node.ELEMENT_NODE ||
    (node.nodeType === Node.TEXT_NODE && !!node.textContent?.trim())
  );
}

@Component({
  selector: 'ds-info-hint',
  standalone: true,
  imports: [IconComponent, TooltipDirective],
  template: `
    <button
      type="button"
      class="info-hint"
      dsTooltipPinOnClick
      [attr.aria-label]="ariaLabel()"
      [dsTooltip]="tip()">
      <ds-icon [name]="icon()" [size]="14" />
    </button>

    <ng-template #projected>
      <ng-content />
    </ng-template>
  `,
  styleUrl: './info-hint.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
})
export class InfoHintComponent {
  /** The supplementary text, shown on hover and focus and kept open by a click. `**bold**` runs render bold. */
  readonly text = input<string>('');
  /** A template shown in the panel in place of `text`. Wins over projected content and `text`. */
  readonly content = input<TemplateRef<unknown> | null>(null);
  /** Accessible name of the icon button, such as "About conversion rate". */
  readonly ariaLabel = input.required<string>();
  /** Any DS icon; `'help'` draws a question mark in a circle, `'info'` an "i". */
  readonly icon = input<IconName>('help');

  private readonly projected =
    viewChild.required<TemplateRef<unknown>>('projected');
  private readonly hasProjected = signal<boolean | null>(null);

  private readonly sources = computed(() =>
    givenInfoHintSources({
      content: !!this.content(),
      projected: !!this.hasProjected(),
      text: !!this.text(),
    }),
  );

  // TODO(info-hint-content): A (projection) and B ([content]) both ship; compare how consumers use them and keep one.
  protected readonly tip = computed(() => {
    const winner = this.sources()[0];
    if (winner === 'content') {
      return this.content() ?? '';
    }
    if (winner === 'projected') {
      return this.projected();
    }

    return this.text();
  });

  constructor() {
    afterNextRender(() => {
      const probe = this.projected().createEmbeddedView(undefined);
      this.hasProjected.set(probe.rootNodes.some(rendersSomething));
      probe.destroy();
    });
    if (typeof ngDevMode === 'undefined' || ngDevMode) {
      devWarn(() =>
        this.hasProjected() === null
          ? null
          : infoHintSourceWarning(this.sources()),
      );
    }
  }
}
