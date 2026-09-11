import { Component, ViewEncapsulation, signal } from '@angular/core';
import { TabComponent, TabsComponent } from 'ds/tabs';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-components-tabs',
  standalone: true,
  imports: [DocsSectionComponent, TabsComponent, TabComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tabs.section.html',
  styleUrls: ['../../../shared/section-demo.scss', './tabs.section.scss'],
})
export class TabsSection {
  protected readonly closableTabs = signal([
    { label: 'Overview', value: 'overview' },
    { label: 'Analytics', value: 'analytics' },
    { label: 'Reports', value: 'reports' },
    { label: 'Settings', value: 'settings' },
  ]);

  protected onTabClose(value: string): void {
    this.closableTabs.update((tabs) =>
      tabs.filter((tab) => tab.value !== value),
    );
  }
}
