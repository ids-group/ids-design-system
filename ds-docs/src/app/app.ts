import { Component, ViewEncapsulation } from '@angular/core';
import { SidebarComponent } from './layout/sidebar.component';
import { TweaksPanelComponent } from './tweaks-panel/tweaks-panel.component';
import { DocsPage } from './sections/docs.page';
import { ShowcaseStatusComponent } from './showcase-status/showcase-status.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [SidebarComponent, TweaksPanelComponent, DocsPage, ShowcaseStatusComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class App {}
