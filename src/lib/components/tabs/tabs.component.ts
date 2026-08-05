import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, type ParamMap } from '@angular/router';
import { IconComponent } from '../../icons/icon.component';
import { TabComponent } from './tab.component';
import type { TabsOrientation, TabsVariant } from './tabs.types';

let nextId = 0;

@Component({
  selector: 'ds-tabs',
  standalone: true,
  imports: [NgTemplateOutlet, IconComponent],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.vertical-host]': "orientation() === 'vertical'",
  },
})
export class TabsComponent {
  /** Index of the active tab, two-way bound. */
  readonly selectedIndex = model<number>(0);
  /** Visual style of the tab strip. */
  readonly variant = input<TabsVariant>('line');

  /** When true, a tab's content is instantiated only on first activation and
      kept alive thereafter. When false (default), all panels render eagerly. */
  readonly lazy = input(false, { transform: booleanAttribute });

  /** When true, the tab strip scrolls horizontally instead of wrapping. The
      active tab is scrolled into view on selection. */
  readonly scrollable = input(false, { transform: booleanAttribute });

  /** When true, each tab shows a close button. Clicking it emits tabClosed with
      the tab's value (or label as fallback) and does not switch to that tab. */
  readonly closable = input(false, { transform: booleanAttribute });

  /** Controls whether the tab list and panel are stacked horizontally (default)
      or the tab list runs vertically beside the panel. */
  readonly orientation = input<TabsOrientation>('horizontal');

  /**
   * Keep the active tab in a query parameter, so it survives F5, a shared link
   * and the Back button: `urlParam="tab"` gives `?tab=activity`. Empty (the
   * default) leaves the URL alone, and the strip works exactly as before.
   *
   * The names come from each `ds-tab`'s `value` (falling back to its `label`),
   * so there is no second list to keep in step. **Names, not indices** — writing
   * `?tab=1` would silently repoint every old link the moment a tab is inserted.
   * The FIRST tab writes no parameter and every write REPLACES the history
   * entry, so a pristine screen keeps a clean address and flipping tabs does not
   * fill the Back button.
   *
   * An unknown or missing name lands on the first tab rather than throwing: a
   * URL is user input, and a stale bookmark should still open the screen.
   *
   * Outside a routed context the input is inert. Nothing router-shaped is even
   * resolved until you set it — no DI lookup and, more to the point, no
   * subscription — so a strip that never uses this costs exactly what it did
   * before the input existed.
   */
  readonly urlParam = input<string>('');

  /** Emitted when a close button is clicked. Carries the tab's value input, or
      its label when value is not set. The host is responsible for removing the
      tab from its list. */
  readonly tabClosed = output<string>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly uid = `ds-tabs-${++nextId}`;

  protected readonly tabs = contentChildren(TabComponent);

  // Nothing router-shaped is touched until `urlParam` is set: no DI lookup, and
  // above all no subscription. A tab strip is perfectly valid outside a routed
  // context — in a dialog, on a static page — and most are, so the default must
  // cost nothing. Resolved through the component's own Injector rather than
  // `inject(Router)` at construction, which would run for every instance.
  private readonly injector = inject(Injector);
  private router: Router | null = null;
  private route: ActivatedRoute | null = null;
  private readonly urlParams = signal<ParamMap | null>(null);

  constructor() {
    // Subscribe only while the feature is on, and drop the subscription again if
    // `urlParam` is cleared.
    effect((onCleanup) => {
      if (!this.urlParam() || !this.resolveRouting()) {
        this.urlParams.set(null);

        return;
      }
      const subscription = this.route!.queryParamMap.subscribe((map) =>
        this.urlParams.set(map),
      );
      onCleanup(() => subscription.unsubscribe());
    });

    // URL -> tab. Runs again when the tabs arrive (content children resolve
    // after the first pass) and on every Back/Forward, which is what makes the
    // history walk the tabs. Writing back is guarded by the equality check
    // below, so this cannot loop with `writeUrl`.
    effect(() => {
      const param = this.urlParam();
      const params = this.urlParams();
      const tabs = this.tabs();
      if (!param || !params || tabs.length === 0) {
        return;
      }
      const name = params.get(param);
      const found = name
        ? tabs.findIndex((tab) => this.tabName(tab) === name)
        : 0;
      const index = found < 0 ? 0 : found;
      if (index !== this.selectedIndex()) {
        this.selectedIndex.set(index);
      }
    });
  }

  /** Resolves the router pair on first use. Null outside a routed context, which
   *  makes `urlParam` inert there rather than an error. */
  private resolveRouting(): boolean {
    this.router ??= this.injector.get(Router, null);
    this.route ??= this.injector.get(ActivatedRoute, null);

    return !!this.router && !!this.route;
  }

  private tabName(tab: TabComponent): string {
    return tab.value() ?? tab.label();
  }

  private writeUrl(index: number): void {
    const param = this.urlParam();
    if (!param || !this.resolveRouting()) {
      return;
    }
    const tab = this.tabs()[index];
    void this.router!.navigate([], {
      relativeTo: this.route,
      queryParams: { [param]: index === 0 || !tab ? null : this.tabName(tab) },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /** Tracks which tab indices have ever been activated (for lazy rendering). */
  private readonly activatedIndices = signal<ReadonlySet<number>>(new Set([0]));

  protected tabId(index: number): string {
    return `${this.uid}-tab-${index}`;
  }

  protected panelId(index: number): string {
    return `${this.uid}-panel-${index}`;
  }

  protected readonly tablistClasses = computed(() => {
    const parts = ['tabs'];
    if (this.variant() === 'pills') {
      parts.push('pills');
    }
    if (this.scrollable()) {
      parts.push('scrollable');
    }
    if (this.orientation() === 'vertical') {
      parts.push('vertical');
    }

    return parts.join(' ');
  });

  /** Whether the panel for a given index should be rendered (lazy gate). */
  protected isPanelVisible(index: number): boolean {
    if (!this.lazy()) {
      return index === this.selectedIndex();
    }

    return this.activatedIndices().has(index);
  }

  protected tabClasses(index: number, disabled: boolean): string {
    const parts = ['tab'];
    if (index === this.selectedIndex()) {
      parts.push('active');
    }
    if (disabled) {
      parts.push('disabled');
    }

    return parts.join(' ');
  }

  protected select(index: number, disabled: boolean): void {
    if (disabled) {
      return;
    }
    this.selectedIndex.set(index);
    this.writeUrl(index);
    if (this.lazy()) {
      this.activatedIndices.update((previous) => {
        if (previous.has(index)) {
          return previous;
        }

        return new Set([...previous, index]);
      });
    }
    if (this.scrollable()) {
      setTimeout(() => {
        const button = this.host.nativeElement.querySelector(
          `#${this.tabId(index)}`,
        ) as HTMLElement | null;
        button?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
    }
  }

  protected onCloseClick(event: MouseEvent, index: number): void {
    event.stopPropagation();
    this.closeTab(index);
  }

  private closeTab(index: number): void {
    const tab = this.tabs()[index];
    if (!tab) {
      return;
    }
    this.tabClosed.emit(tab.value() ?? tab.label());
  }

  /** Roving keyboard navigation across the tablist (APG automatic activation).
      Arrow axis follows orientation: Left/Right for horizontal, Up/Down for vertical. */
  protected onKeydown(event: KeyboardEvent, index: number): void {
    const count = this.tabs().length;
    if (!count) {
      return;
    }
    // APG: Delete removes the focused tab when the tablist is closable.
    if (this.closable() && event.key === 'Delete') {
      event.preventDefault();
      this.closeTab(index);

      return;
    }
    const isVertical = this.orientation() === 'vertical';
    const forwardKey = isVertical ? 'ArrowDown' : 'ArrowRight';
    const backwardKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
    // Keep both axes active so vertical also responds to Left/Right and
    // horizontal also responds to Up/Down for cross-axis discoverability,
    // matching the ARIA APG recommendation for roving tabindex.
    const forward =
      event.key === forwardKey ||
      (!isVertical && event.key === 'ArrowDown') ||
      (isVertical && event.key === 'ArrowRight');
    const backward =
      event.key === backwardKey ||
      (!isVertical && event.key === 'ArrowUp') ||
      (isVertical && event.key === 'ArrowLeft');

    let next: number;
    if (forward) {
      next = (index + 1) % count;
    } else if (backward) {
      next = (index - 1 + count) % count;
    } else if (event.key === 'Home') {
      next = 0;
    } else if (event.key === 'End') {
      next = count - 1;
    } else {
      return;
    }
    event.preventDefault();
    // Skip disabled tabs in the travel direction.
    const step = backward || event.key === 'End' ? -1 : 1;
    let guard = 0;
    while (this.tabs()[next]?.disabled() && guard < count) {
      next = (next + step + count) % count;
      guard++;
    }
    this.select(next, this.tabs()[next]?.disabled() ?? false);
    setTimeout(() => {
      const element = this.host.nativeElement.querySelector(
        `#${this.tabId(next)}`,
      ) as HTMLElement | null;
      element?.focus();
    });
  }
}
