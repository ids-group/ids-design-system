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
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import { DsOverlayCloseRef } from '../../overlay/ds-overlay-close-ref';

@Component({
  selector: 'ds-menu-item',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  // The host sits between the role="menu" <ul> and the role="menuitem" button,
  // so mark it presentational to keep the menu→menuitem ownership intact.
  host: { role: 'none' },
})
export class MenuItemComponent implements OnDestroy {
  // The containing overlay (e.g. popover), if any — selecting an item closes it.
  // Optional, so menu-items also work standalone.
  private readonly closeRef = inject(DsOverlayCloseRef, { optional: true });
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  private readonly button =
    viewChild.required<ElementRef<HTMLButtonElement>>('button');

  /** Leading icon shown before the projected label. */
  readonly icon = input<IconName | null>(null);
  /** Blocks activation and styles the item as inactive. It stays
   *  keyboard-focusable (`aria-disabled`, ARIA menu practice) and in `ds-menu`'s
   *  roving order, so a `[dsTooltip]` explaining why can be reached and shown. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Renders the item in an error/destructive style. */
  readonly error = input(false, { transform: booleanAttribute });
  /** Optional submenu template — renders a nested `ds-menu` on hover / ArrowRight. */
  readonly submenu = input<TemplateRef<unknown> | null>(null);
  /** Fires on click, unless the item is disabled or opens a submenu. */
  readonly pressed = output<MouseEvent>();

  /** Roving tabindex, owned by ds-menu — exactly one item is tabbable (0), the
   *  rest -1. Defaults true so a standalone item (outside ds-menu) stays
   *  reachable. */
  readonly tabbable = signal(true);
  readonly submenuOpen = signal(false);

  private submenuRef: OverlayRef | null = null;
  private openTimer: ReturnType<typeof setTimeout> | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  /** Move keyboard focus to this item's control. */
  focus(): void {
    this.button().nativeElement.focus();
  }

  /** Whether `node` lives inside this item's control (used by ds-menu to find
   *  the currently focused item during keyboard nav). */
  contains(node: Node | null): boolean {
    return !!node && this.button().nativeElement.contains(node);
  }

  /** Visible label text — used by ds-menu's type-ahead. */
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
    if (!this.hasSubmenu() || this.disabled()) {
      return;
    }
    this.clearCloseTimer();
    this.openTimer = setTimeout(() => this.openSubmenu(), 120);
  }

  protected onMouseLeave(event: MouseEvent): void {
    if (!this.hasSubmenu()) {
      return;
    }
    this.clearOpenTimer();
    // Delay close so moving into the submenu panel doesn't close it immediately.
    this.closeTimer = setTimeout(() => {
      // If focus/mouse is now inside the submenu panel, keep it open.
      const submenuElement = this.submenuRef?.overlayElement;
      if (
        submenuElement &&
        submenuElement.contains(event.relatedTarget as Node)
      ) {
        return;
      }
      this.closeSubmenu();
    }, 150);
  }

  openSubmenu(): void {
    if (this.submenuRef || !this.submenu()) {
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

    this.submenuRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape' || event.key === 'ArrowLeft') {
        event.preventDefault();
        this.closeSubmenu();
        this.focus();
      }
    });

    this.submenuRef.outsidePointerEvents().subscribe(() => this.closeSubmenu());

    this.submenuRef.attach(new TemplatePortal(this.submenu()!, this.vcr));

    this.submenuRef.overlayElement.addEventListener('mouseenter', () =>
      this.clearCloseTimer(),
    );
    this.submenuRef.overlayElement.addEventListener('mouseleave', () =>
      this.closeSubmenu(),
    );

    this.submenuOpen.set(true);
  }

  closeSubmenu(): void {
    this.submenuRef?.dispose();
    this.submenuRef = null;
    this.submenuOpen.set(false);
  }

  ngOnDestroy(): void {
    this.submenuRef?.dispose();
    this.clearOpenTimer();
    this.clearCloseTimer();
  }

  private clearOpenTimer(): void {
    if (this.openTimer !== null) {
      clearTimeout(this.openTimer);
      this.openTimer = null;
    }
  }

  private clearCloseTimer(): void {
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
