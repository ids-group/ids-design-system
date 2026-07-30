import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  signal,
} from '@angular/core';
import {
  AppLayoutComponent,
  BrandNameDirective,
  SidenavComponent,
  SidenavFooterComponent,
  SidenavItemComponent,
  TopBarComponent,
  type SidenavAlertItem,
  type SidenavSearchProvider,
} from 'ds';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-app-layout',
  standalone: true,
  imports: [
    AppLayoutComponent,
    BrandNameDirective,
    SidenavComponent,
    SidenavFooterComponent,
    SidenavItemComponent,
    TopBarComponent,
    DocsSectionComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './app-layout.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './app-layout.section.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutSection {
  protected readonly collapsedContentSpan = signal(false);
  protected readonly collapsedFullSpan = signal(false);
  protected readonly unread = signal(true);

  protected readonly alertItems: readonly SidenavAlertItem[] = [
    {
      id: 'report',
      icon: 'success',
      variant: 'success',
      title: 'Report ready',
      body: 'The monthly export finished successfully.',
      at: 'Today',
    },
    {
      id: 'quota',
      icon: 'warn',
      variant: 'warning',
      title: 'Quota at 80%',
      body: 'Storage is filling up — review retention.',
      at: 'Yesterday',
    },
  ];

  protected readonly searchProvider: SidenavSearchProvider = (
    query: string,
  ) => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return [];
    }

    return ['Dashboard', 'Reports', 'Settings']
      .filter((label) => label.toLowerCase().includes(needle))
      .map((label) => ({ id: label, label, group: 'Sections', route: '.' }));
  };

  protected toggleCollapsedContentSpan(): void {
    this.collapsedContentSpan.update((value) => !value);
  }

  protected toggleCollapsedFullSpan(): void {
    this.collapsedFullSpan.update((value) => !value);
  }

  protected markRead(): void {
    this.unread.set(false);
  }
}
