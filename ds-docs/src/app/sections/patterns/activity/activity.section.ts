import { Component, ViewEncapsulation } from '@angular/core';
import { AvatarComponent } from 'ds/avatar';
import { BadgeComponent } from 'ds/badge';
import { ButtonComponent } from 'ds/button';
import type { DsStatusKey } from 'ds/core';
import { IconComponent } from 'ds/icons';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface ActivityEntry {
  readonly initials: string;
  readonly actor: string;
  readonly verb: string;
  readonly object: string;
  readonly detail?: string;
  readonly badge?: { label: string; status: DsStatusKey };
  readonly time: string;
}

@Component({
  selector: 'pattern-activity',
  standalone: true,
  imports: [
    AvatarComponent,
    BadgeComponent,
    ButtonComponent,
    DocsSectionComponent,
    IconComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './activity.section.html',
  styleUrl: './activity.section.scss',
})
export class ActivitySection {
  protected readonly lede =
    'A vertical list of attributed events on a record — avatar, actor, verb, object, optional inline status badge, and a relative timestamp. Plus a calm empty state for fresh records.';

  protected readonly entries: ActivityEntry[] = [
    {
      initials: 'AP',
      actor: 'Alex Park',
      verb: 'changed',
      object: 'Alpha · Build start',
      detail: 'from 26 Jul 06:00 to 27 Jul 06:00',
      badge: { label: 'Impact pending', status: 'warning' },
      time: '2 minutes ago',
    },
    {
      initials: 'SK',
      actor: 'Sara Khan',
      verb: 'recomputed',
      object: '3 Logistics plans',
      detail: 'All within volume limits.',
      time: '14 minutes ago',
    },
    {
      initials: 'JR',
      actor: 'Jamie Roberts',
      verb: 'allocated',
      object: '4× FOH desk',
      detail: 'to Beta and Gamma.',
      badge: { label: 'Conflict with Delta', status: 'error' },
      time: '1 hour ago',
    },
    {
      initials: 'TD',
      actor: 'Tom Davies',
      verb: 'confirmed',
      object: 'Project Alpha',
      detail: 'after final review.',
      badge: { label: 'Confirmed', status: 'confirmed' },
      time: '3 hours ago',
    },
  ];
}
