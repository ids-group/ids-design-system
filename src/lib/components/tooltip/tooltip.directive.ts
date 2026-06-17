import {
  Directive,
  ElementRef,
  HostListener,
  OnDestroy,
  inject,
  input,
} from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { TooltipPanelComponent } from './tooltip-panel.component';
import type { TooltipPlacement } from './tooltip.types';

let nextId = 0;

@Directive({
  selector: '[dsTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  private readonly overlay = inject(Overlay);
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly dsTooltip = input<string>('');
  readonly dsTooltipPlacement = input<TooltipPlacement>('top');
  readonly dsTooltipDelay = input<number>(120);

  private ref: OverlayRef | null = null;
  private timer: number | null = null;
  private readonly tipId = `ds-tooltip-${++nextId}`;

  @HostListener('mouseenter')
  @HostListener('focus')
  protected onOpen(): void {
    if (!this.dsTooltip()) {return;}
    if (this.timer !== null) {clearTimeout(this.timer);}
    this.timer = window.setTimeout(() => this.show(), this.dsTooltipDelay());
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  protected onClose(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.ref?.dispose();
    this.ref = null;
    const host = this.host.nativeElement;
    const remaining = (host.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .filter((id: string) => id && id !== this.tipId)
      .join(' ');
    if (remaining) {host.setAttribute('aria-describedby', remaining);}
    else {host.removeAttribute('aria-describedby');}
  }

  @HostListener('keydown.escape')
  protected onEscape(): void {
    if (this.ref) {this.onClose();}
  }

  private show(): void {
    const placement = this.dsTooltipPlacement();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.host)
      .withPositions([this.positionFor(placement)]);

    this.ref = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });

    const cmpRef = this.ref.attach(new ComponentPortal(TooltipPanelComponent));
    cmpRef.setInput('text', this.dsTooltip());
    cmpRef.setInput('placement', placement);
    cmpRef.setInput('panelId', this.tipId);
    const host = this.host.nativeElement;
    const existing = host.getAttribute('aria-describedby');
    host.setAttribute(
      'aria-describedby',
      existing ? `${existing} ${this.tipId}` : this.tipId,
    );
  }

  private positionFor(p: TooltipPlacement) {
    switch (p) {
      case 'top':
        return {
          originX: 'center' as const,
          originY: 'top' as const,
          overlayX: 'center' as const,
          overlayY: 'bottom' as const,
          offsetY: -8,
        };
      case 'bottom':
        return {
          originX: 'center' as const,
          originY: 'bottom' as const,
          overlayX: 'center' as const,
          overlayY: 'top' as const,
          offsetY: 8,
        };
      case 'left':
        return {
          originX: 'start' as const,
          originY: 'center' as const,
          overlayX: 'end' as const,
          overlayY: 'center' as const,
          offsetX: -8,
        };
      case 'right':
        return {
          originX: 'end' as const,
          originY: 'center' as const,
          overlayX: 'start' as const,
          overlayY: 'center' as const,
          offsetX: 8,
        };
    }
  }

  ngOnDestroy(): void {
    this.onClose();
  }
}
