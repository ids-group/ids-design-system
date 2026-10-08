import {
  DOCUMENT,
  Directive,
  ElementRef,
  HostListener,
  InjectionToken,
  OnDestroy,
  Signal,
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
  overlayPlacementOf,
  prepareOverlayEnter,
} from '@ids-group-ltd/ids-design-system/components';
import { isTextClipped } from '@ids-group-ltd/ids-design-system/core';
import type { TooltipPlacement } from './tooltip.types';

const TRIGGER_GAP_PX = 8;
const VIEWPORT_MARGIN_PX = 8;
const OPPOSITE_PLACEMENT: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const NATIVELY_FOCUSABLE = 'a[href], button, input, select, textarea, summary';
const FOCUSABLE = `${NATIVELY_FOCUSABLE}, [tabindex]`;
const KEYBOARD_FOCUSABLE = `${NATIVELY_FOCUSABLE}, [tabindex]:not([tabindex^="-"])`;
const INTERACTIVE = [
  NATIVELY_FOCUSABLE,
  'tr:not([role])',
  ...[
    'button',
    'link',
    'tab',
    'option',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'row',
    'gridcell',
    'combobox',
    'checkbox',
    'radio',
    'switch',
    'treeitem',
  ].map((role) => `[role="${role}"]`),
].join(', ');

const clippedHostsByAncestor = new WeakMap<
  HTMLElement,
  Set<TooltipDirective>
>();

function firstClippedHost(
  tooltips: Set<TooltipDirective>,
): TooltipDirective | undefined {
  return [...tooltips]
    .sort((a, b) =>
      a.hostElement.compareDocumentPosition(b.hostElement) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    )
    .find((tooltip) => tooltip.isClipped());
}

const PINNED_ATTRIBUTE = 'data-ds-tooltip-pinned';

let nextId = 0;

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

  /** Tip text. An empty string turns the tooltip off. */
  readonly dsTooltip = input<string>('');
  /** Which side the tip opens on. With no room there it opens on the opposite side. */
  readonly dsTooltipPlacement = input<TooltipPlacement>('top');
  /** Milliseconds before the tip appears. Hiding is immediate. */
  readonly dsTooltipDelay = input<number>(120);
  /** Show the tip only while the host shows less text than it holds. Re-tested on every open.
   *
   *  Applies the tooltip on its own: without a `dsTooltip` the host's own text is disclosed. A tip
   *  whose text the host already contains sets no `aria-describedby`; one given a `dsTooltip`
   *  that says more than the host does describes it as usual. */
  readonly dsTooltipWhenClipped = input(false, { transform: booleanAttribute });
  /** Selector for the element inside the host whose clipping `dsTooltipWhenClipped` tests and
   *  whose text it discloses. Resolved on every open; while nothing matches, no clipped tip opens. */
  readonly dsTooltipTextSelector = input<string | null>(null);

  /** Opens the tip with no delay, and a click on the host keeps it open after the pointer leaves
   *  until a click outside, `Escape` or blur; a second click closes it. Without it a click closes the tip.
   *  While pinned the host carries `data-ds-tooltip-pinned`, a hook for styling the pinned trigger. */
  readonly dsTooltipPinOnClick = input(false, { transform: booleanAttribute });

  get hostElement(): HTMLElement {
    return this.host.nativeElement;
  }

  private textElement(): HTMLElement | null {
    const selector = this.dsTooltipTextSelector();

    return selector
      ? this.hostElement.querySelector<HTMLElement>(selector)
      : this.hostElement;
  }

  isClipped(): boolean {
    const textElement = this.textElement();

    return textElement !== null && isTextClipped(textElement);
  }

  private pinsOnClick(): boolean {
    return this.hostPinOnClick?.() ?? this.dsTooltipPinOnClick();
  }

  private ownText(): string {
    return (this.textElement()?.textContent ?? '').trim();
  }

  /** A clipped host puts its own text, in bold, above the tip unless the tip already says it. */
  private tipText(): string {
    const given = this.dsTooltip();
    const own = this.ownText();
    if (!given) {
      return this.dsTooltipWhenClipped() ? escapeTooltipMarkup(own) : '';
    }
    if (
      own &&
      this.isClipped() &&
      !this.contains(plainTooltipText(given), own)
    ) {
      return `**${escapeTooltipMarkup(own)}**
${given}`;
    }

    return given;
  }

  private contains(haystack: string, needle: string): boolean {
    const collapse = (value: string) => value.replace(/\s+/g, ' ').trim();

    return collapse(haystack).includes(collapse(needle));
  }

  /** A clipped host's full text is already in the DOM; describing it again would announce it twice. */
  private disclosesOwnText(text: string): boolean {
    if (!this.dsTooltipWhenClipped()) {
      return false;
    }

    return this.contains(this.ownText(), plainTooltipText(text));
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

  constructor() {
    afterNextRender(() => this.listenToFocusableAncestor());
  }

  /** `:focus-visible` keeps a click from opening it. Only the first clipped host of one ancestor opens. */
  private listenToFocusableAncestor(): void {
    const host: HTMLElement = this.host.nativeElement;
    if (!this.dsTooltipWhenClipped() || host.matches(FOCUSABLE)) {
      return;
    }
    const ancestor = host.parentElement?.closest<HTMLElement>(FOCUSABLE);
    if (!ancestor?.matches(INTERACTIVE)) {
      return;
    }
    let tooltips = clippedHostsByAncestor.get(ancestor);
    if (!tooltips) {
      tooltips = new Set();
      clippedHostsByAncestor.set(ancestor, tooltips);
    }
    tooltips.add(this);
    const open = (event: FocusEvent) => {
      if (
        event.target !== ancestor ||
        // Tested here, not at registration: a disabled trigger carries tabindex="-1" until enabled.
        !ancestor.matches(KEYBOARD_FOCUSABLE) ||
        !ancestor.matches(':focus-visible') ||
        firstClippedHost(tooltips) !== this
      ) {
        return;
      }
      this.focusedTarget = ancestor;
      this.scheduleShow();
    };
    const close = () => {
      this.focusedTarget = null;
      this.onClose();
    };
    ancestor.addEventListener('focusin', open);
    ancestor.addEventListener('focusout', close);
    ancestor.addEventListener('click', close);
    ancestor.addEventListener('keydown', close);
    this.detachAncestor = () => {
      tooltips.delete(this);
      ancestor.removeEventListener('focusin', open);
      ancestor.removeEventListener('focusout', close);
      ancestor.removeEventListener('click', close);
      ancestor.removeEventListener('keydown', close);
    };
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
    if (this.unpin || !this.tipText()) {
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
      if (!this.tipText()) {
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
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.onClose();
      }
    };
    this.document.addEventListener('pointerdown', closeOutside, true);
    this.document.addEventListener('keydown', closeOnEscape, true);
    this.hostElement.setAttribute(PINNED_ATTRIBUTE, '');
    this.unpin = () => {
      this.unpin = null;
      this.hostElement.removeAttribute(PINNED_ATTRIBUTE);
      this.document.removeEventListener('pointerdown', closeOutside, true);
      this.document.removeEventListener('keydown', closeOnEscape, true);
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
      .withPositions([
        this.positionFor(placement),
        this.positionFor(OPPOSITE_PLACEMENT[placement]),
      ])
      .withViewportMargin(VIEWPORT_MARGIN_PX);

    this.ref = this.overlay.create({
      positionStrategy,
      panelClass: 'ds-overlay-pane',
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });
    prepareOverlayEnter(this.ref, this.host.nativeElement, positionStrategy);

    const cmpRef = this.ref.attach(new ComponentPortal(TooltipPanelComponent));
    const text = this.tipText();
    cmpRef.setInput('text', text);
    cmpRef.setInput('placement', placement);
    positionStrategy.positionChanges.subscribe(({ connectionPair }) =>
      cmpRef.setInput(
        'placement',
        overlayPlacementOf(connectionPair.overlayY, connectionPair.overlayX),
      ),
    );
    cmpRef.setInput('panelId', this.tipId);
    this.pointArrowAtHost(this.ref, cmpRef.location.nativeElement);
    this.ref.detachments().subscribe(() => this.unpin?.());
    if (this.disclosesOwnText(text)) {
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

  // positionChanges skips a re-apply that only pushes the pane; the styles CDK writes do not.
  // The pane is measured, not the panel: the panel's enter animation scales it.
  private pointArrowAtHost(ref: OverlayRef, panel: HTMLElement): void {
    const pane = ref.overlayElement;
    const point = () => {
      const trigger = this.hostElement.getBoundingClientRect();
      const box = pane.getBoundingClientRect();
      panel.style.setProperty(
        '--_tooltip-arrow-x',
        `${trigger.left + trigger.width / 2 - box.left - panel.clientLeft}px`,
      );
      panel.style.setProperty(
        '--_tooltip-arrow-y',
        `${trigger.top + trigger.height / 2 - box.top - panel.clientTop}px`,
      );
    };
    const observer = new MutationObserver(point);
    observer.observe(ref.hostElement, { attributeFilter: ['style'] });
    observer.observe(pane, { attributeFilter: ['style'] });
    ref.detachments().subscribe({ complete: () => observer.disconnect() });
  }

  private positionFor(placement: TooltipPlacement) {
    switch (placement) {
      case 'top':
        return {
          originX: 'center' as const,
          originY: 'top' as const,
          overlayX: 'center' as const,
          overlayY: 'bottom' as const,
          offsetY: -TRIGGER_GAP_PX,
        };
      case 'bottom':
        return {
          originX: 'center' as const,
          originY: 'bottom' as const,
          overlayX: 'center' as const,
          overlayY: 'top' as const,
          offsetY: TRIGGER_GAP_PX,
        };
      case 'left':
        return {
          originX: 'start' as const,
          originY: 'center' as const,
          overlayX: 'end' as const,
          overlayY: 'center' as const,
          offsetX: -TRIGGER_GAP_PX,
        };
      case 'right':
        return {
          originX: 'end' as const,
          originY: 'center' as const,
          overlayX: 'start' as const,
          overlayY: 'center' as const,
          offsetX: TRIGGER_GAP_PX,
        };
    }
  }

  ngOnDestroy(): void {
    this.detachAncestor?.();
    this.onClose();
  }
}
