import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  afterNextRender,
  booleanAttribute,
  inject,
  input,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipPanelComponent } from './tooltip-panel.component';
import { prepareOverlayEnter } from '@ids-group-ltd/ids-design-system/components';
import { isTextClipped } from '@ids-group-ltd/ids-design-system/core';
import type { TooltipPlacement } from './tooltip.types';

const TRIGGER_GAP_PX = 8;

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

let nextId = 0;

@Directive({
  selector: '[dsTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Tip text. An empty string turns the tooltip off, so a host bound to a possibly
   *  blank value needs no separate condition. */
  readonly dsTooltip = input<string>('');
  /** Which side the tip opens on. It does NOT flip: only the requested side is
   *  offered to the overlay, so a tip with no room there is pushed, not moved. */
  readonly dsTooltipPlacement = input<TooltipPlacement>('top');
  /** Milliseconds before the tip appears. Hiding is immediate; the delay only
   *  suppresses a tip the pointer passed over on its way elsewhere. */
  readonly dsTooltipDelay = input<number>(120);
  /** Show the tip only while the host shows less text than it holds. Re-tested on every
   *  open, so it tracks resizing with no observer.
   *
   *  With this on, `dsTooltip` may be left empty and the host's own text is disclosed, which
   *  suits projected content the holding component cannot know. A tip whose text the host
   *  already contains sets no `aria-describedby`;
   *  one given a `dsTooltip` that says more than the host does describes it as usual. */
  readonly dsTooltipWhenClipped = input(false, { transform: booleanAttribute });
  /** A selector for the element inside the host whose clipping `dsTooltipWhenClipped` tests and
   *  whose text it discloses, so the pointer area can be a whole row. Resolved on every open;
   *  while nothing matches, no clipped tip opens. */
  readonly dsTooltipTextSelector = input<string | null>(null);

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

  private tipText(): string {
    const given = this.dsTooltip();
    if (given || !this.dsTooltipWhenClipped()) {
      return given;
    }

    return (this.textElement()?.textContent ?? '').trim();
  }

  /** A clipped host's full text is already in the DOM, so a screen reader has it; describing
   *  the element with it again would announce it twice. */
  private disclosesOwnText(text: string): boolean {
    if (!this.dsTooltipWhenClipped()) {
      return false;
    }
    const collapse = (value: string) => value.replace(/\s+/g, ' ').trim();

    return collapse(this.textElement()?.textContent ?? '').includes(
      collapse(text),
    );
  }

  private ref: OverlayRef | null = null;
  private timer: number | null = null;
  private readonly tipId = `ds-tooltip-${++nextId}`;

  /**
   * Where `aria-describedby` belongs when focus is involved. A host that is not itself
   * focusable never reaches a screen reader (`ds-menu-item` has `role="none"` and a
   * real `<button>` inside), so `focusin`'s target, whatever took focus, is recorded
   * instead. A pointer-only open leaves this null and falls back to the host.
   */
  private focusedTarget: HTMLElement | null = null;

  /**
   * Where `aria-describedby` was written, so teardown strips it from the same element.
   * Focus can arrive after the panel opened, moving `focusedTarget` and otherwise
   * stranding the attribute on the host, pointing at a dead panel.
   */
  private describedElement: HTMLElement | null = null;

  private detachAncestor: (() => void) | null = null;

  constructor() {
    afterNextRender(() => this.listenToFocusableAncestor());
  }

  /** `:focus-visible` keeps a click, which focuses the ancestor too, from opening it. Only the
   *  first clipped host of one ancestor opens, so two panels never stack. */
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
        // Tested here, not when registering: a disabled trigger carries tabindex="-1" until enabled.
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

  // A clipped host that takes focus itself follows the same rule as one reached through its
  // focusable ancestor: keyboard focus on the host opens, a click's focus does not.
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
    if (!this.tipText()) {
      return;
    }
    if (this.dsTooltipWhenClipped() && !this.isClipped()) {
      return;
    }
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = window.setTimeout(() => this.show(), this.dsTooltipDelay());
  }

  // Close on click too: a re-rendered anchor (e.g. a navigated sidenav item) under a
  // stationary cursor fires no mouseleave, which would strand the panel.
  @HostListener('mouseleave')
  @HostListener('click')
  protected onClose(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.disposeRef();
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
    // A re-render or re-entrant hover can call show() with a panel still open: dispose
    // it first so the OverlayRef isn't leaked and the id isn't added twice.
    this.disposeRef();
    const placement = this.dsTooltipPlacement();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host)
      .withPositions([this.positionFor(placement)]);

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
    cmpRef.setInput('panelId', this.tipId);
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
