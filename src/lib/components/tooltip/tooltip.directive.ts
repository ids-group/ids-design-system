import {
  DOCUMENT,
  Directive,
  ElementRef,
  HostListener,
  InjectionToken,
  OnDestroy,
  Signal,
  TemplateRef,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipPanelComponent } from './tooltip-panel.component';
import { escapeTooltipMarkup, plainTooltipText } from './tooltip-markup';
import {
  FOCUSABLE,
  tabStopWhileClipped,
  watchFocusableAncestor,
  type AncestorFocusTrigger,
} from './tooltip-ancestor-focus';
import {
  clipElement,
  isHostClipped,
  ownTextOf,
  textContains,
  toClipTarget,
  type TooltipClipTarget,
} from './tooltip-clip';
import {
  closeOnScroll,
  listenForEscape,
  overlayPlacementOf,
  prepareOverlayEnter,
} from '@ids-group-ltd/ids-design-system/components';
import {
  VIEWPORT_MARGIN_PX,
  pointArrowAtHost,
  positionsFor,
} from './tooltip-position';
import type { TooltipPlacement } from './tooltip.types';

const PINNED_ATTRIBUTE = 'data-ds-tooltip-pinned';

let nextId = 0;

/** @internal Lets a component that hosts the tooltip make a clipped host lead the tip with its own text. */
export const TOOLTIP_LEADS_WITH_OWN_TEXT = new InjectionToken<boolean>(
  'TOOLTIP_LEADS_WITH_OWN_TEXT',
);

/** @internal Lets a component that hosts the tooltip decide `dsTooltipPinOnClick` for it. */
export const TOOLTIP_PIN_ON_CLICK = new InjectionToken<Signal<boolean>>(
  'TOOLTIP_PIN_ON_CLICK',
);

@Directive({
  selector: '[dsTooltip], [dsTooltipWhenClipped]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly document = inject(DOCUMENT);
  private readonly hostPinOnClick = inject(TOOLTIP_PIN_ON_CLICK, {
    self: true,
    optional: true,
  });
  private readonly leadsWithOwnText =
    inject(TOOLTIP_LEADS_WITH_OWN_TEXT, { self: true, optional: true }) ??
    false;

  /** Tip text, or a template the panel renders as given. An empty string turns the tooltip off.
   *  Keep a template's content non-interactive: the panel is `role="tooltip"` and never takes focus. */
  readonly dsTooltip = input<string | TemplateRef<unknown>>('');
  /** Which side the tip opens on. With no room there it opens on the opposite side. */
  readonly dsTooltipPlacement = input<TooltipPlacement>('top');
  /** Milliseconds before the tip appears. Hiding is immediate. */
  readonly dsTooltipDelay = input<number>(120);
  /** Draws the arrow that points at the host. Turn it off where the tip sits flush against it. */
  readonly dsTooltipArrow = input(true, { transform: booleanAttribute });
  /** Show the tip only while the host shows less text than it holds: cut by width, or by lines
   *  under `overflow: hidden` or `clip`, as with `line-clamp`. Re-tested on every open.
   *  A boolean or the bare attribute tests the host. A selector tests the element it matches inside
   *  the host and discloses that element's text; while nothing matches, no clipped tip opens.
   *
   *  Applies the tooltip on its own: without a `dsTooltip` the tested text is disclosed. A tip
   *  whose text the host already contains sets no `aria-describedby`; one given a `dsTooltip`
   *  that says more than the host does describes it as usual.
   *
   *  Keyboard focus opens it too: on the host, on a control or widget around it, or on a control
   *  inside it. A clipped host that none of these reaches takes `tabindex="0"` while it is clipped. */
  readonly dsTooltipWhenClipped = input<
    TooltipClipTarget | null,
    boolean | string | null | undefined
  >(null, { transform: toClipTarget });

  /** Opens the tip with no delay, and a click on the host keeps it open after the pointer leaves
   *  until a click outside, `Escape` or blur; a second click closes it. Without it a click closes the tip.
   *  While pinned the host carries `data-ds-tooltip-pinned`, a hook for styling the pinned trigger. */
  readonly dsTooltipPinOnClick = input(false, { transform: booleanAttribute });

  private isClipped(): boolean {
    return isHostClipped(this.hostElement, this.dsTooltipWhenClipped());
  }

  private get hostElement(): HTMLElement {
    return this.host.nativeElement;
  }

  private pinsOnClick(): boolean {
    return this.hostPinOnClick?.() ?? this.dsTooltipPinOnClick();
  }

  private ownText(): string {
    return ownTextOf(
      clipElement(this.hostElement, this.dsTooltipWhenClipped()),
    );
  }

  /** A host that leads with its own text puts it, in bold, above the tip while it is clipped, unless the tip already says it. */
  private tipContent(): string | TemplateRef<unknown> {
    const given = this.dsTooltip();
    if (given instanceof TemplateRef) {
      return given;
    }
    const own = this.ownText();
    if (!given) {
      return this.dsTooltipWhenClipped() ? escapeTooltipMarkup(own) : '';
    }
    if (
      this.leadsWithOwnText &&
      own &&
      this.isClipped() &&
      !textContains(plainTooltipText(given), own)
    ) {
      return `**${escapeTooltipMarkup(own)}**
${given}`;
    }

    return given;
  }

  /** A clipped host's full text is already in the DOM; describing it again would announce it twice. */
  private disclosesOwnText(text: string): boolean {
    if (!this.dsTooltipWhenClipped()) {
      return false;
    }

    return textContains(this.ownText(), plainTooltipText(text));
  }

  private ref: OverlayRef | null = null;
  private timer: number | null = null;
  private unpin: (() => void) | null = null;
  private readonly tipId = `ds-tooltip-${++nextId}`;

  /**
   * Where `aria-describedby` belongs when focus is involved: a non-focusable host
   * (`ds-menu-item` is `role="none"` around a real `<button>`) never reaches a screen
   * reader, so `focusin`'s target is recorded. A pointer-only open leaves it null.
   */
  private focusedTarget: HTMLElement | null = null;

  /**
   * Where `aria-describedby` was written, so teardown strips it from the same element
   * even if focus moved `focusedTarget` after the panel opened.
   */
  private describedElement: HTMLElement | null = null;

  private detachAncestor: (() => void) | null = null;

  private readonly ancestorFocusTrigger: AncestorFocusTrigger = {
    host: this.hostElement,
    isClipped: () => this.isClipped(),
    openFor: (ancestor) => {
      this.focusedTarget = ancestor;
      this.scheduleShow();
    },
    close: () => {
      this.focusedTarget = null;
      this.onClose();
    },
  };

  constructor() {
    afterNextRender(() => {
      if (this.dsTooltipWhenClipped()) {
        this.detachAncestor =
          watchFocusableAncestor(this.ancestorFocusTrigger) ??
          tabStopWhileClipped(this.ancestorFocusTrigger);
      }
    });
  }

  @HostListener('mouseenter')
  protected onPointerEnter(): void {
    this.scheduleShow();
  }

  // Same rule as via a focusable ancestor: keyboard focus opens, a click's focus does not.
  @HostListener('focusin', ['$event'])
  protected onFocusIn(event: FocusEvent): void {
    const host = this.hostElement;
    if (
      this.dsTooltipWhenClipped() &&
      host.matches(FOCUSABLE) &&
      (event.target !== host || !host.matches(':focus-visible'))
    ) {
      return;
    }
    if (event.target instanceof HTMLElement) {
      this.focusedTarget = event.target;
    }
    this.scheduleShow();
  }

  @HostListener('focusout')
  protected onFocusOut(): void {
    this.focusedTarget = null;
    this.onClose();
  }

  private scheduleShow(): void {
    if (this.unpin || !this.tipContent()) {
      return;
    }
    if (this.pinsOnClick() && this.ref?.hasAttached()) {
      return;
    }
    if (this.dsTooltipWhenClipped() && !this.isClipped()) {
      return;
    }
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = window.setTimeout(
      () => this.show(),
      this.pinsOnClick() ? 0 : this.dsTooltipDelay(),
    );
  }

  @HostListener('mouseleave')
  protected onPointerLeave(): void {
    if (!this.unpin) {
      this.onClose();
    }
  }

  // Close on click too: a re-rendered anchor under a stationary cursor fires no mouseleave.
  @HostListener('click')
  protected onClick(): void {
    if (this.pinsOnClick() && !this.unpin) {
      this.pin();
    } else {
      this.onClose();
    }
  }

  protected onClose(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.unpin?.();
    this.disposeRef();
  }

  private pin(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.ref?.hasAttached()) {
      if (!this.tipContent()) {
        return;
      }
      this.show();
    }
    const closeOutside = (event: Event) => {
      const target = event.target as Node;
      if (
        !this.hostElement.contains(target) &&
        !this.ref?.overlayElement.contains(target)
      ) {
        this.onClose();
      }
    };
    this.document.addEventListener('pointerdown', closeOutside, true);
    const stopEscape = listenForEscape(this.document, () => this.onClose());
    this.hostElement.setAttribute(PINNED_ATTRIBUTE, '');
    this.unpin = () => {
      this.unpin = null;
      this.hostElement.removeAttribute(PINNED_ATTRIBUTE);
      this.document.removeEventListener('pointerdown', closeOutside, true);
      stopEscape();
    };
  }

  private disposeRef(): void {
    this.ref?.dispose();
    this.ref = null;
    const described = this.describedElement;
    if (!described) {
      return;
    }
    this.describedElement = null;
    const remaining = (described.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .filter((id: string) => id && id !== this.tipId)
      .join(' ');
    if (remaining) {
      described.setAttribute('aria-describedby', remaining);
    } else {
      described.removeAttribute('aria-describedby');
    }
  }

  @HostListener('keydown')
  protected onKeydown(): void {
    if (this.dsTooltipWhenClipped()) {
      this.onClose();
    }
  }

  @HostListener('keydown.escape')
  protected onEscape(): void {
    if (this.ref) {
      this.onClose();
    }
  }

  private show(): void {
    // show() can be re-entered with a panel open: dispose it first to avoid a leaked OverlayRef and a duplicate id.
    this.disposeRef();
    const placement = this.dsTooltipPlacement();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host)
      .withPositions(positionsFor(placement))
      .withViewportMargin(VIEWPORT_MARGIN_PX);

    this.ref = this.overlay.create({
      positionStrategy,
      panelClass: 'ds-overlay-pane',
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    prepareOverlayEnter(this.ref, this.host.nativeElement, positionStrategy);
    // The CDK strategy sees only the window and cdkScrollable ancestors, not a plain overflow container.
    const stopScrollClose = closeOnScroll(this.ref, () => this.onClose());
    this.ref.detachments().subscribe(stopScrollClose);

    const cmpRef = this.ref.attach(new ComponentPortal(TooltipPanelComponent));
    const tip = this.tipContent();
    cmpRef.setInput('text', tip);
    cmpRef.setInput('placement', placement);
    cmpRef.setInput('arrow', this.dsTooltipArrow());
    positionStrategy.positionChanges.subscribe(({ connectionPair }) =>
      cmpRef.setInput(
        'placement',
        overlayPlacementOf(connectionPair.overlayY, connectionPair.overlayX),
      ),
    );
    cmpRef.setInput('panelId', this.tipId);
    pointArrowAtHost(this.ref, cmpRef.location.nativeElement, this.hostElement);
    this.ref.detachments().subscribe(() => this.unpin?.());
    if (typeof tip === 'string' && this.disclosesOwnText(tip)) {
      return;
    }
    const described = this.focusedTarget ?? this.host.nativeElement;
    this.describedElement = described;
    const existing = described.getAttribute('aria-describedby');
    described.setAttribute(
      'aria-describedby',
      existing ? `${existing} ${this.tipId}` : this.tipId,
    );
  }

  ngOnDestroy(): void {
    this.detachAncestor?.();
    this.onClose();
  }
}
