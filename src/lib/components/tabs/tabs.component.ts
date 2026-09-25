import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ElementRef,
  afterRenderEffect,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  Injector,
  input,
  isDevMode,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router, type ParamMap } from '@angular/router';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import { TabComponent } from './tab.component';
import type { TabsOrientation, TabsVariant } from './tabs.types';

let nextId = 0;

// Which query parameters are already claimed, so two strips on one screen cannot
// quietly fight over the same one. Dev-only bookkeeping; nothing reads it in
// production.
const claimedUrlParams = new Map<string, number>();

/** Label → URL name. Diacritics are decomposed and dropped so "Zusätze" gives
 *  `zusatze` rather than a percent-encoded umlaut. A label with nothing sluggable
 *  in it — CJK, or bare punctuation — keeps its raw text rather than becoming an
 *  empty parameter. */
function slugify(label: string): string {
  const slug = label
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || label;
}

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
  protected readonly intl = inject(DS_INTL);

  /** Index of the active tab, two-way bound. */
  readonly selectedIndex = model<number>(0);
  /** Visual style of the tab strip. */
  readonly variant = input<TabsVariant>('line');

  /** When true, a tab's content is instantiated only on first activation and
      kept alive thereafter. When false (default), all panels render eagerly. */
  readonly lazy = input(false, { transform: booleanAttribute });

  /** When true, a horizontal strip scrolls inside its own box and shows
      previous/next arrows while tabs lie beyond its edges, each arrow hidden at
      its own edge. The active tab is scrolled into view on selection. When
      false, tabs keep their width and a strip too long for its container
      overflows it. */
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

  /** Reopen the tab this screen was last left on, per path, from `sessionStorage`.
   *  Off by default, and needs `urlParam` for the names — a remembered INDEX would
   *  repoint the moment a tab is inserted. A link always wins: the parameter is read
   *  first, memory only fills the gap the first tab leaves in the URL. Session, not
   *  local, so tomorrow is a fresh visit. */
  readonly rememberLastTab = input(false, { transform: booleanAttribute });

  /** Emitted when a close button is clicked. Carries the tab's value input, or
      its label when value is not set. The host is responsible for removing the
      tab from its list. */
  readonly tabClosed = output<string>();

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly uid = `ds-tabs-${++nextId}`;
  private readonly tablist =
    viewChild.required<ElementRef<HTMLElement>>('tablist');

  protected readonly scrollsHorizontally = computed(
    () => this.scrollable() && this.orientation() === 'horizontal',
  );
  private readonly overflowing = signal(false);
  protected readonly showScrollArrows = computed(
    () => this.scrollsHorizontally() && this.overflowing(),
  );
  protected readonly canScrollPrevious = signal(false);
  protected readonly canScrollNext = signal(false);

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
    afterRenderEffect((onCleanup) => {
      this.tabs();
      if (!this.scrollsHorizontally()) {
        this.overflowing.set(false);

        return;
      }
      const strip = this.tablist().nativeElement;
      const observer = new ResizeObserver(() => this.updateScrollArrows());
      observer.observe(strip);
      observer.observe(strip.parentElement!);
      onCleanup(() => observer.disconnect());
    });

    /**
     * Two strips sharing a parameter is the failure mode of going round a screen
     * turning this on: `tab` is the obvious name, so the second strip takes it
     * too, and from then on each write erases the other's tab. Nothing throws and
     * the URL looks plausible — it just restores the wrong tab on reload.
     */
    if (isDevMode()) {
      effect((onCleanup) => {
        const param = this.urlParam();
        if (!param) {
          return;
        }
        const held = claimedUrlParams.get(param) ?? 0;
        if (held > 0) {
          console.warn(
            `[ds-tabs] urlParam="${param}" is already used by another ds-tabs on this screen. Both strips write the same query parameter, so each one erases the other's tab and a reload restores whichever wrote last. Give each strip its own name.`,
          );
        }
        claimedUrlParams.set(param, held + 1);
        // onCleanup alone: it runs before every re-run AND on destroy, so
        // releasing again from a DestroyRef would double-count the way out.
        onCleanup(() => {
          const now = (claimedUrlParams.get(param) ?? 1) - 1;
          if (now > 0) {
            claimedUrlParams.set(param, now);
          } else {
            claimedUrlParams.delete(param);
          }
        });
      });
    }

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
      const target = params.get(param) ?? this.rememberedName();
      const found = target
        ? tabs.findIndex((tab) => this.tabName(tab) === target)
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

  /** The tab's name AS IT APPEARS IN THE URL, and deliberately NOT what
   *  `tabClosed` emits — that stays the label, because a host matches it against
   *  its own list. A slug is still derived from display copy, so renaming a tab
   *  still breaks saved links; `value` is the only fix for that. */
  private tabName(tab: TabComponent): string {
    return tab.value() ?? slugify(tab.label());
  }

  /** Storage key for `rememberLastTab`: the path plus the parameter name. Per
   *  path because that is the screen a reader returns to, and the parameter is
   *  what keeps two strips on one path apart — which the dev warning above
   *  already insists is unique. */
  private memoryKey(): string | null {
    const param = this.urlParam();
    if (!this.rememberLastTab() || !param || !this.resolveRouting()) {
      return null;
    }

    return `ds-tabs:${this.router!.url.split('?')[0]}:${param}`;
  }

  /** Every access is wrapped: Safari in private mode throws on write, and a
   *  quota error must not take a tab strip down with it. Same guard as
   *  `ds-table`'s persisted layout. */
  private rememberedName(): string | null {
    const key = this.memoryKey();
    if (!key) {
      return null;
    }
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private remember(index: number): void {
    const key = this.memoryKey();
    const tab = this.tabs()[index];
    if (!key || !tab) {
      return;
    }
    try {
      // Stored for the first tab too, which writes no parameter: without that,
      // deliberately going back to tab one would be forgotten and the next visit
      // would reopen the tab before it.
      sessionStorage.setItem(key, this.tabName(tab));
    } catch {
      // Storage unavailable — the strip simply stops remembering.
    }
  }

  private writeUrl(index: number): void {
    this.remember(index);
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

  protected updateScrollArrows(): void {
    const strip = this.tablist().nativeElement;
    const scrolled = Math.abs(strip.scrollLeft);
    const hidden = strip.scrollWidth - strip.clientWidth;
    // Against the row, not the strip: the arrows narrow the strip, and a strip
    // measured against its own width would keep them for tabs that fit without them.
    this.overflowing.set(
      strip.scrollWidth > strip.parentElement!.clientWidth + 1,
    );
    this.canScrollPrevious.set(scrolled > 1);
    this.canScrollNext.set(scrolled < hidden - 1);
  }

  protected scrollPage(towardEnd: boolean): void {
    const strip = this.tablist().nativeElement;
    const mirror = getComputedStyle(strip).direction === 'rtl' ? -1 : 1;
    const inlineStart = (rect: DOMRect): number =>
      mirror === 1 ? rect.left : -rect.right;
    const inlineEnd = (rect: DOMRect): number =>
      mirror === 1 ? rect.right : -rect.left;
    const view = strip.getBoundingClientRect();
    const tabRects = Array.from(strip.children, (tab) =>
      tab.getBoundingClientRect(),
    );
    const step = towardEnd ? 1 : -1;
    let distance = 0;
    if (towardEnd) {
      const next = tabRects.find(
        (rect) => inlineEnd(rect) > inlineEnd(view) + 1,
      );
      distance = next ? inlineStart(next) - inlineStart(view) : 0;
    } else {
      const previous = tabRects
        .reverse()
        .find((rect) => inlineStart(rect) < inlineStart(view) - 1);
      distance = previous ? inlineEnd(previous) - inlineEnd(view) : 0;
    }
    // A tab wider than the strip is already aligned, so move a full width.
    if (distance * step < 1) {
      distance = step * strip.clientWidth;
    }
    const reducedMotion = matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    strip.scrollBy({
      left: mirror * distance,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
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
