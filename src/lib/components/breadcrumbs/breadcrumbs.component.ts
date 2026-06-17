import {
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
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
  readonly separator = input<IconName | null>(null);
  readonly clickable = input<boolean | null>(null);
  readonly navigate = output<BreadcrumbItem>();

  protected readonly resolvedItems = computed<BreadcrumbItem[]>(
    () => this.items() ?? this.svc.items(),
  );
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
