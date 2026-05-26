import { Component, ViewEncapsulation } from '@angular/core';
import { AvatarComponent } from 'ds';

@Component({
  selector: 'section-components-avatar',
  standalone: true,
  imports: [AvatarComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-avatar" data-anchor="avatar" class="section">
      <div class="eyebrow t-overline">Components</div>
      <h2 class="t-h2">Avatars</h2>
      <p class="lede t-m">Initials and image avatars in four sizes, plus stacked groups with overflow.</p>

      <!-- ============================================================ Sizes -->
      <h3 class="block-title t-h4">Sizes</h3>
      <div class="row">
        <ds-avatar size="xs" initials="AB" />
        <ds-avatar size="sm" initials="AB" />
        <ds-avatar size="md" initials="AB" />
        <ds-avatar size="lg" initials="AB" />
      </div>

      <!-- ============================================================ Group -->
      <h3 class="block-title t-h4">Group</h3>
      <div class="row">
        <div class="avatar-group">
          <ds-avatar initials="AB" />
          <ds-avatar initials="JR" [tint]="{ bg: 'var(--orange-100)', fg: 'var(--orange-700)' }" />
          <ds-avatar initials="SK" [tint]="{ bg: 'var(--green-100)', fg: 'var(--green-700)' }" />
          <ds-avatar initials="+4" tint="neutral" />
        </div>
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Truncation</div>
        <ul class="trunc__list">
          <li>
            <span class="trunc__field">Initials fallback</span>
            <span class="trunc__behaviour">2 chars max — no clip. Generated from first + last name.</span>
          </li>
          <li>
            <span class="trunc__field">Adjacent name label</span>
            <span class="trunc__behaviour">Single line, ellipsis. Tooltip on hover with full name.</span>
          </li>
          <li>
            <span class="trunc__field">+N overflow</span>
            <span class="trunc__behaviour">Numeric only — no clip. Tooltip lists every hidden member.</span>
          </li>
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--brand); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .row { display: flex; gap: var(--s-4); align-items: center; flex-wrap: wrap; margin-top: var(--s-3); }

    /* ---------- Truncation block ---------- */
    .trunc {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .trunc__title {
      display: inline-flex; align-items: center; gap: var(--s-2);
      font: var(--fw-bold) var(--fs-2xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
      margin-bottom: var(--s-3);
    }
    .trunc__list {
      list-style: none; margin: 0; padding: 0;
      display: flex; flex-direction: column;
      gap: var(--s-2);
    }
    .trunc__list li {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--s-4);
      align-items: start;
    }
    .trunc__field {
      font: var(--fw-bold) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-primary);
    }
    .trunc__behaviour {
      font: var(--fw-regular) var(--fs-s)/var(--lh-base) var(--font-sans);
      color: var(--text-secondary);
    }
  `],
})
export class AvatarSection {}
