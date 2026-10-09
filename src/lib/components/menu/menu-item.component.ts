import {
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { nextControlId } from '@ids-group-ltd/ids-design-system/components';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import { DsOverlayCloseRef } from '@ids-group-ltd/ids-design-system/overlay';
import {
  closeOnScroll,
  prepareOverlayEnter,
} from '@ids-group-ltd/ids-design-system/components';
import { AimHoverTarget, MenuAim, aimTriangle } from './menu-aim';

@Component({
  selector: 'ds-menu-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  // Presentational: the host sits between the role="menu" <ul> and the role="menuitem" button.
  host: { role: 'none' },
})
export class MenuItemComponent implements OnDestroy, AimHoverTarget {
  // Optional so menu-items work standalone; selecting an item closes the containing overlay.
  private readonly closeRef = inject(DsOverlayCloseRef, { optional: true });
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  private readonly aim =
    inject(MenuAim, { optional: true }) ?? new MenuAim(inject(DOCUMENT));
  private readonly button =
    viewChild.required<ElementRef<HTMLButtonElement>>('button');

  /** Leading icon shown before the projected label. */
  readonly icon = input<IconName | null>(null);
  /** Blocks activation and styles the item as inactive. It stays focusable
   *  (`aria-disabled`) and in the roving order, so a `[dsTooltip]` can explain why. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Renders the item in an error/destructive style. */
  readonly error = input(false, { transform: booleanAttribute });
  /** Renders the item muted but still actionable. */
  readonly quiet = input(false, { transform: booleanAttribute });
  /** A standing second line under the label naming a limitation the action carries
   *  ("will not be saved"). Visible without hover or focus, unlike a `[dsTooltip]`.
   *
   *  Reaches assistive tech as `aria-describedby`, NOT as part of the item's name:
   *  the line is `aria-hidden` and referenced by id, else it would be concatenated
   *  into the name. */
  readonly description = input<string>('');
  /** Optional submenu template; renders a nested `ds-menu` on hover / ArrowRight. */
  readonly submenu = input<TemplateRef<unknown> | null>(null);
  /** Fires on click, unless the item is disabled or opens a submenu. */
  readonly pressed = output<MouseEvent>();

  protected readonly descriptionId = nextControlId('ds-menu-item-desc');

  /** Roving tabindex, owned by ds-menu: one item is tabbable, the rest -1. Defaults true for a standalone item. */
  readonly tabbable = signal(true);
  readonly submenuOpen = signal(false);

  private submenuRef: OverlayRef | null = null;
  private openTimer: ReturnType<typeof setTimeout> | null = null;

  /** Move keyboard focus to this item's control. */
  focus(): void {
    this.button().nativeElement.focus();
  }

  /** Whether `node` lives inside this item's control. */
  contains(node: Node | null): boolean {
    return !!node && this.button().nativeElement.contains(node);
  }

  /** Visible label text, used by ds-menu's type-ahead. */
  label(): string {
    return this.button().nativeElement.textContent?.trim() ?? '';
  }

  protected hasSubmenu(): boolean {
    return this.submenu() !== null;
  }

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    if (this.hasSubmenu()) {
      this.openSubmenu();

      return;
    }
    this.pressed.emit(event);
    this.closeRef?.close();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (this.disabled() || !this.hasSubmenu()) {
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      this.openSubmenu();
    }
  }

  protected onMouseEnter(): void {
    if (!this.hasSubmenu() || this.disabled() || !this.aim.requestHover(this)) {
      return;
    }
    this.activateHover();
  }

  /** Opens the submenu after the hover delay; called directly or once a sibling's aim ends. */
  activateHover(): void {
    this.clearOpenTimer();
    this.openTimer = setTimeout(() => this.openSubmenu(), 120);
  }

  protected onMouseLeave(event: MouseEvent): void {
    if (!this.hasSubmenu()) {
      return;
    }
    this.clearOpenTimer();
    this.aim.dropHover(this);
    const panel = this.submenuRef?.overlayElement;
    if (!panel || panel.contains(event.relatedTarget as Node | null)) {
      return;
    }
    this.aim.start(
      aimTriangle(
        { x: event.clientX, y: event.clientY },
        panel.getBoundingClientRect(),
      ),
      () => this.closeSubmenu(),
    );
  }

  openSubmenu(): void {
    if (this.disabled() || this.submenuRef || !this.submenu()) {
      return;
    }
    const trigger = this.hostElement.nativeElement;
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(trigger)
      .withPositions([
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
          offsetX: 2,
        },
        {
          originX: 'start',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'top',
          offsetX: -2,
        },
      ]);

    this.submenuRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: false,
      panelClass: 'ds-overlay-pane',
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
    prepareOverlayEnter(
      this.submenuRef,
      this.hostElement.nativeElement,
      positionStrategy,
    );

    this.submenuRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape' || event.key === 'ArrowLeft') {
        event.preventDefault();
        this.closeSubmenu();
        this.focus();
      }
    });

    this.submenuRef.outsidePointerEvents().subscribe(() => this.closeSubmenu());
    const stopScrollClose = closeOnScroll(this.submenuRef, () =>
      this.closeSubmenu(),
    );
    this.submenuRef.detachments().subscribe(stopScrollClose);

    this.submenuRef.attach(new TemplatePortal(this.submenu()!, this.vcr));

    this.submenuRef.overlayElement.addEventListener('mouseenter', () =>
      this.aim.stop(),
    );
    this.submenuRef.overlayElement.addEventListener('mouseleave', (event) => {
      if (
        !this.hostElement.nativeElement.contains(
          event.relatedTarget as Node | null,
        )
      ) {
        this.closeSubmenu();
      }
    });

    this.submenuOpen.set(true);
  }

  closeSubmenu(): void {
    this.submenuRef?.dispose();
    this.submenuRef = null;
    this.submenuOpen.set(false);
  }

  ngOnDestroy(): void {
    if (this.submenuRef) {
      this.aim.stop();
    }
    this.submenuRef?.dispose();
    this.clearOpenTimer();
    this.aim.dropHover(this);
  }

  private clearOpenTimer(): void {
    if (this.openTimer !== null) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
  }
}
