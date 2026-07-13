import { Component, DestroyRef, ViewEncapsulation, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonComponent, DrawerComponent, IconButtonComponent, TopBarComponent } from 'ds';
import { SidebarComponent } from './layout/sidebar.component';
import { TweaksPanelComponent } from './tweaks-panel/tweaks-panel.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    TweaksPanelComponent,
    TopBarComponent,
    DrawerComponent,
    IconButtonComponent,
    ButtonComponent,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss', './app.responsive.scss'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class App {
  protected readonly navOpen = signal(false);

  constructor() {
    // Close the nav drawer when crossing up into the desktop layout (--bp-lg).
    const desktop = window.matchMedia('(min-width: 1024px)'); /* --bp-lg */
    const onChange = (): void => {
      if (desktop.matches) {
        this.navOpen.set(false);
      }
    };
    desktop.addEventListener('change', onChange);
    inject(DestroyRef).onDestroy(() => desktop.removeEventListener('change', onChange));
  }
}
