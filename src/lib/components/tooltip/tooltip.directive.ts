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

const clippedHostsByAncestor = new WeakMap<HTMLElement, Set<HTMLElement>>();

function firstClippedHost(hosts: Set<HTMLElement>): HTMLElement | undefined {
  return [...hosts]
    .sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    )
    .find(isTextClipped);
}

let nextId = 0;

@Directive({
  selector: '[dsTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly host = inject(ElementRef<HTMLElement>);

  /** Tip text. An empty string is how you turn the tooltip off — a host bound to a
   *  value that may be blank needs no separate condition. */
  readonly dsTooltip = input<string>('');
  /** Which side the tip opens on. It does NOT flip: only the requested side is
   *  offered to the overlay, so a tip with no room there is pushed rather than moved
   *  to the opposite side. */
  readonly dsTooltipPlacement = input<TooltipPlacement>('top');
  /** Milliseconds before the tip appears. Hiding is immediate — this delay only ever
   *  suppresses a tip the pointer passed over on its way somewhere else. */
  readonly dsTooltipDelay = input<number>(120);
  /** Show the tip only while the host is actually showing less text than it holds. For a label
   *  that already reads in full, a tip repeating it is noise. Re-tested on every open, so a tip
   *  appears and stops appearing as the column, panel or window is resized, with no observer to
   *  run.
   *
   *  With this on, `dsTooltip` may be left empty and the host's own text is disclosed. That is
   *  what makes it usable on projected content, where the component holding the tip cannot know
   *  what it was handed. A tip whose text the host already contains sets no `aria-describedby`;
   *  one given a `dsTooltip` that says more than the host does describes it as usual. */
  readonly dsTooltipWhenClipped = input(false, { transform: booleanAttribute });
  /** The element whose clipping `dsTooltipWhenClipped` tests and whose text it discloses, when
   *  that is not the host. It lets the pointer area be a whole row while the text is one cell of
   *  it: hovering anywhere on the row opens the tip, and only for the text the row clips. */
  readonly dsTooltipTextElement = input<HTMLElement | null>(null);

  private textElement(): HTMLElement {
    return this.dsTooltipTextElement() ?? this.host.nativeElement;
  }

  private tipText(): string {
    const given = this.dsTooltip();
    if (given || !this.dsTooltipWhenClipped()) {
      return given;
    }

    return (this.textElement().textContent ?? '').trim();
  }

  /** A clipped host's full text is already in the DOM, so a screen reader has it; describing
   *  the element with it again would announce it twice. */
  private disclosesOwnText(text: string): boolean {
    if (!this.dsTooltipWhenClipped()) {
      return false;
    }
    const collapse = (value: string) => value.replace(/\s+/g, ' ').trim();

    return collapse(this.textElement().textContent ?? '').includes(
      collapse(text),
    );
  }

  private ref: OverlayRef | null = null;
  private timer: number | null = null;
  private readonly tipId = `ds-tooltip-${++nextId}`;

  /**
   * Where `aria-describedby` belongs, when focus is involved. A host that is not
   * focusable itself never reaches a screen reader — `ds-menu-item` carries
   * `role="none"` and puts the real `<button>` inside — so describing the host
   * describes something the user never focuses. `focusin` bubbles, so its target
   * IS whatever took focus; recording it is what keeps this directive out of the
   * host component's internal DOM. A pointer-only open leaves this null and
   * falls back to the host, where no screen reader is involved anyway.
   */
  private focusedTarget: HTMLElement | null = null;

  /**
   * Where `aria-describedby` was actually written, remembered so teardown strips
   * it from the same element. Not derivable at teardown: focus can arrive after
   * the panel opened (hover, then click or arrow onto it), which moves
   * `focusedTarget` and would otherwise strand the attribute on the host,
   * pointing at a panel that no longer exists.
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
    let hosts = clippedHostsByAncestor.get(ancestor);
    if (!hosts) {
      hosts = new Set();
      clippedHostsByAncestor.set(ancestor, hosts);
    }
    hosts.add(host);
    const open = (event: FocusEvent) => {
      if (
        event.target !== ancestor ||
        // Tested here, not when registering: a disabled trigger carries tabindex="-1" until enabled.
        !ancestor.matches(KEYBOARD_FOCUSABLE) ||
        !ancestor.matches(':focus-visible') ||
        firstClippedHost(hosts) !== host
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
      hosts.delete(host);
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

  @HostListener('focusin', ['$event'])
  protected onFocusIn(event: FocusEvent): void {
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
    if (this.dsTooltipWhenClipped() && !isTextClipped(this.textElement())) {
      return;
    }
    if (this.timer !== null) {
      clearTimeout(this.timer);
    }
    this.timer = window.setTimeout(() => this.show(), this.dsTooltipDelay());
  }

  // Close on activation too: clicking the thing the tip describes is a clear
  // dismiss, and a re-rendered anchor (e.g. a navigated sidenav item) under a
  // stationary cursor fires no mouseleave, which would otherwise strand the panel.
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

  @HostListener('keydown.escape')
  protected onEscape(): void {
    if (this.ref) {
      this.onClose();
    }
  }

  private show(): void {
    // A re-render or re-entrant hover can call show() with a panel still open;
    // dispose it first so the OverlayRef isn't leaked and aria-describedby
    // doesn't accumulate the same id twice.
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
