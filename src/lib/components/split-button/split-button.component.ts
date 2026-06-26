import {
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewContainerRef,
  ViewEncapsulation,
  booleanAttribute,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { IconComponent } from '../../icons/icon.component';
import type { IconName } from '../../icons/icons.data';
import { DsOverlayCloseRef } from '../../overlay/ds-overlay-close-ref';
import { MenuComponent } from '../menu/menu.component';
import { MenuItemComponent } from '../menu/menu-item.component';
import { disposeWithLeave } from '../overlay-motion';
import type { SplitButtonItem, SplitButtonVariant } from './split-button.types';

@Component({
  selector: 'ds-split-button',
  standalone: true,
  imports: [IconComponent, MenuComponent, MenuItemComponent],
  templateUrl: './split-button.component.html',
  styleUrl: './split-button.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  // Provide the close-ref so projected ds-menu-items dismiss the panel on click.
  providers: [
    {
      provide: DsOverlayCloseRef,
      useExisting: forwardRef(() => SplitButtonComponent),
    },
  ],
  host: {
    '[class.primary]': "variant() === 'primary'",
    '[class.outline]': "variant() === 'outline'",
    '[class.open]': 'open()',
  },
})
export class SplitButtonComponent implements DsOverlayCloseRef {
  private readonly overlay = inject(Overlay);
  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly label = input<string>('');
  readonly variant = input<SplitButtonVariant>('primary');
  readonly icon = input<IconName | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly menuItems = input<readonly SplitButtonItem[]>([]);
  /** Accessible name for the dropdown trigger. */
  readonly menuLabel = input<string>('More actions');
  readonly pressed = output<MouseEvent>();
  readonly itemSelect = output<SplitButtonItem>();

  protected readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  protected readonly panelTpl =
    viewChild.required<TemplateRef<unknown>>('panel');
  protected readonly open = signal(false);

  private overlayRef: OverlayRef | null = null;
  private focusTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.focusTimer ?? undefined);
      this.overlayRef?.dispose();
      this.overlayRef = null;
    });
  }

  protected toggle(): void {
    if (this.disabled()) {
      return;
    }
    if (this.open()) {
      this.close();
    } else {
      this.openPanel();
    }
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled() || this.open()) {
      return;
    }
    if (
      event.key === 'ArrowDown' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      this.openPanel();
    }
  }

  protected onItemSelect(item: SplitButtonItem): void {
    if (item.disabled) {
      return;
    }
    this.itemSelect.emit(item);
  }

  private openPanel(): void {
    if (this.overlayRef) {
      return;
    }
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host.nativeElement)
      .withPositions([
        {
          originX: 'end',
          originY: 'bottom',
          overlayX: 'end',
          overlayY: 'top',
          offsetY: 4,
        },
        {
          originX: 'end',
          originY: 'top',
          overlayX: 'end',
          overlayY: 'bottom',
          offsetY: -4,
        },
      ]);
    const cfg: OverlayConfig = {
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      panelClass: ['ds-dropdown-panel', 'ds-overlay-pane'],
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    };
    this.overlayRef = this.overlay.create(cfg);
    this.overlayRef.backdropClick().subscribe(() => this.close());
    this.overlayRef.keydownEvents().subscribe((event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.close();
      }
    });
    const portal = new TemplatePortal(this.panelTpl(), this.vcr);
    this.overlayRef.attach(portal);
    this.open.set(true);
    this.focusFirstItem();
  }

  close(): void {
    if (!this.overlayRef) {
      return;
    }
    clearTimeout(this.focusTimer ?? undefined);
    this.focusTimer = null;
    disposeWithLeave(this.overlayRef);
    this.overlayRef = null;
    this.open.set(false);
    this.trigger().nativeElement.focus();
  }

  private focusFirstItem(): void {
    const pane = this.overlayRef?.overlayElement;
    this.focusTimer = setTimeout(() => {
      this.focusTimer = null;
      pane?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    });
  }
}
