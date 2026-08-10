import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  numberAttribute,
  output,
} from '@angular/core';
import { DS_CONFIG } from '../../config/ds-config';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import { BreadcrumbsService } from './breadcrumbs.service';
import type { BreadcrumbItem } from './breadcrumbs.types';

@Component({
  selector: 'ds-breadcrumbs',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './breadcrumbs.component.html',
  styleUrl: './breadcrumbs.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class BreadcrumbsComponent {
  private readonly cfg = inject(DS_CONFIG);
  private readonly svc = inject(BreadcrumbsService);

  /**
   * When omitted, the component reads from `BreadcrumbsService.items`.
   * Pass an explicit array to opt out of the service (per-page override).
   */
  readonly items = input<BreadcrumbItem[] | null>(null);
  /** Icon between crumbs; falls back to `DS_CONFIG.breadcrumbs.separator`, then `chevronRight`. */
  readonly separator = input<IconName | null>(null);
  /** Whether crumbs render as links; falls back to `DS_CONFIG.breadcrumbs.clickable`, then `true`. */
  readonly clickable = input<boolean | null>(null);
  /**
   * Caps how many crumbs render, collapsing the middle into an ellipsis — the
   * first and the LAST always survive. Null (default) renders every crumb.
   *
   * Worth setting on any trail that can get deep: the row is `nowrap` with
   * `overflow: hidden`, so without a cap an overlong trail is clipped from the
   * END, which is the current page — the one crumb the reader needs most.
   */
  readonly maxItems = input<number | null>(null, {
    transform: (raw: unknown) => (raw == null ? null : numberAttribute(raw)),
  });
  /** Fires when a clickable crumb with `href` is activated; default navigation is always prevented. */
  readonly navigate = output<BreadcrumbItem>();

  private readonly allItems = computed<BreadcrumbItem[]>(
    () => this.items() ?? this.svc.items(),
  );

  /**
   * What renders. The collapsed crumb carries no `href`, so it is inert rather
   * than a link to nowhere; its label is the count, which tells the reader how
   * much is hidden instead of just that something is.
   */
  protected readonly resolvedItems = computed<BreadcrumbItem[]>(() => {
    const items = this.allItems();
    const max = this.maxItems();
    if (!max || max < 2 || items.length <= max) {
      return items;
    }
    // max - 2, not max - 1: the collapsed crumb occupies one of the slots too,
    // so counting only the first would render one crumb more than asked for.
    const tail = items.slice(items.length - (max - 2));

    return [
      items[0],
      { label: `… ${items.length - max + 1} more` },
      ...tail,
    ];
  });
  protected readonly effectiveSeparator = computed<IconName>(
    () => this.separator() ?? this.cfg.breadcrumbs?.separator ?? 'chevronRight',
  );
  protected readonly effectiveClickable = computed<boolean>(
    () => this.clickable() ?? this.cfg.breadcrumbs?.clickable ?? true,
  );

  protected onNav(event: Event, item: BreadcrumbItem): void {
    if (!item.href || !this.effectiveClickable()) {
      event.preventDefault();

      return;
    }
    event.preventDefault();
    this.navigate.emit(item);
  }
}
