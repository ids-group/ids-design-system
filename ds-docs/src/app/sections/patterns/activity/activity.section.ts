import { Component, ViewEncapsulation } from '@angular/core';
import { AvatarComponent, BadgeComponent, ButtonComponent, IconComponent, type BadgeVariant } from 'ds';

interface ActivityEntry {
  readonly initials: string;
  readonly actor: string;
  readonly verb: string;
  readonly object: string;
  readonly detail?: string;
  readonly badge?: { label: string; variant: BadgeVariant };
  readonly time: string;
}

@Component({
  selector: 'pattern-activity',
  standalone: true,
  imports: [AvatarComponent, BadgeComponent, ButtonComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-pattern-activity" data-anchor="pattern-activity" class="section">
      <div class="eyebrow t-overline">Patterns</div>
      <h2 class="t-h2">Activity</h2>
      <p class="lede t-m">{{ lede }}</p>

      <h3 class="block-title t-h4">Activity stream</h3>
      <p class="block-desc t-s">
        Vertical list of attributed events on a record. Each row: avatar, bold subject (actor +
        verb + object), one-line body, optional inline status badge, and a relative timestamp
        on the trailing edge.
      </p>
      <div class="stage">
        <ul class="activity-list">
          @for (entry of entries; track entry.actor + entry.time) {
            <li class="activity">
              <ds-avatar size="sm" [initials]="entry.initials" />
              <div class="activity__body">
                <p class="t-s subject">
                  <strong>{{ entry.actor }}</strong> {{ entry.verb }}
                  <strong>{{ entry.object }}</strong>
                  @if (entry.badge) {
                    <ds-badge [variant]="entry.badge.variant">{{ entry.badge.label }}</ds-badge>
                  }
                </p>
                @if (entry.detail) {
                  <p class="t-s detail">{{ entry.detail }}</p>
                }
              </div>
              <span class="t-s time">{{ entry.time }}</span>
            </li>
          }
        </ul>
      </div>

      <h3 class="block-title t-h4">Empty state</h3>
      <p class="block-desc t-s">
        Newly created records have nothing in the log. Show a calm placeholder with a single
        next step instead of an apologetic message.
      </p>
      <div class="stage">
        <div class="empty">
          <div class="empty__icon">
            <ds-icon name="clock" [size]="24" />
          </div>
          <p class="t-m empty__title">No recent activity</p>
          <p class="t-s empty__body">
            Edits, status changes and allocations will appear here. Make the first change to
            kick off the log.
          </p>
          <ds-button variant="outline" size="m">
            <ds-icon name="edit" [size]="14" /> Edit record
          </ds-button>
        </div>
      </div>

      <h3 class="block-title t-h4">Usage</h3>
      <ul class="rules">
        <li>Reverse chronological — newest at the top. Don't reverse by status or actor.</li>
        <li>One sentence per row. Multi-line detail belongs in an expandable child or a separate timeline view.</li>
        <li>Inline badge only when the event produced an outcome (Conflict, Impact pending, Confirmed). Skip otherwise.</li>
        <li>Empty state offers the next concrete step, not an apology.</li>
      </ul>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--space-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--space-2); }
    .lede { color: var(--text-secondary); margin-top: var(--space-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--space-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--space-1); max-width: var(--col-cap-text); }
    .stage {
      margin-top: var(--space-3);
      padding: var(--space-5);
      background: var(--surface-secondary);
      border-radius: var(--radius-lg);
    }

    .activity-list {
      list-style: none;
      margin: 0;
      padding: 0;
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-md);
    }
    .activity {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: var(--space-3);
      align-items: flex-start;
      padding: var(--space-3) var(--space-4);
    }
    .activity + .activity { border-top: var(--border-width-default) solid var(--border-divider); }
    .activity__body { min-width: 0; }
    .activity__body .subject {
      margin: 0;
      color: var(--text-primary);
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      align-items: center;
    }
    .activity__body .detail {
      margin: var(--space-1) 0 0;
      color: var(--text-secondary);
    }
    .activity .time {
      color: var(--text-tertiary);
      white-space: nowrap;
      padding-top: 2px;
    }

    .empty {
      background: var(--surface-default);
      border: var(--border-width-default) solid var(--border-divider);
      border-radius: var(--radius-md);
      padding: var(--space-8) var(--space-5);
      display: grid;
      justify-items: center;
      gap: var(--space-2);
      text-align: center;
    }
    .empty__icon {
      width: 48px;
      height: 48px;
      display: grid;
      place-items: center;
      border-radius: var(--radius-pill);
      background: var(--surface-subtle);
      color: var(--text-tertiary);
      margin-bottom: var(--space-1);
    }
    .empty__title { margin: 0; color: var(--text-primary); }
    .empty__body { margin: 0 0 var(--space-2); color: var(--text-secondary); max-width: 48ch; }

    .rules {
      margin-top: var(--space-3);
      padding-left: var(--space-5);
      color: var(--text-secondary);
      display: grid;
      gap: var(--space-2);
      max-width: var(--col-cap-text);
    }

    @media (max-width: 560px) {
      .activity { grid-template-columns: auto minmax(0, 1fr); }
      .activity .time { grid-column: 2; padding-top: 0; }
    }
  `],
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
      badge: { label: 'Impact pending', variant: 'warning' },
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
      badge: { label: 'Conflict with Delta', variant: 'error' },
      time: '1 hour ago',
    },
    {
      initials: 'TD',
      actor: 'Tom Davies',
      verb: 'confirmed',
      object: 'Project Alpha',
      detail: 'after final review.',
      badge: { label: 'Confirmed', variant: 'confirmed' },
      time: '3 hours ago',
    },
  ];
}
