import { DOCUMENT } from '@angular/common';
import { Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppLayoutComponent } from 'ds/app-layout';
import { ButtonComponent } from 'ds/button';
import { IconButtonComponent } from 'ds/icon-button';
import { TopBarComponent } from 'ds/topbar';
import { DocumentTitleService } from './core/document-title';
import { SidebarComponent } from './layout/sidebar.component';
import { TweaksPanelComponent } from './tweaks-panel/tweaks-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    TweaksPanelComponent,
    AppLayoutComponent,
    TopBarComponent,
    IconButtonComponent,
    ButtonComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: { '(document:click)': 'scrollToInPageTarget($event)' },
})
export class App {
  protected readonly navOpen = signal(false);

  private readonly document = inject(DOCUMENT);

  constructor() {
    inject(DocumentTitleService).start();
  }

  // `<base href="/">` resolves a bare `#id` against the root, so the browser would leave the page.
  protected scrollToInPageTarget(event: MouseEvent): void {
    const link = (event.target as Element | null)?.closest('a[href^="#"]');
    const target = link
      ? this.document.getElementById(link.getAttribute('href')!.slice(1))
      : null;
    if (
      !target ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    target.scrollIntoView({ block: 'start' });
  }
}
