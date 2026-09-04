import { Component, ViewEncapsulation, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppLayoutComponent } from 'ds/app-layout';
import { ButtonComponent } from 'ds/button';
import { IconButtonComponent } from 'ds/icon-button';
import { TopBarComponent } from 'ds/topbar';
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
})
export class App {
  protected readonly navOpen = signal(false);
}
