import { Component, ViewEncapsulation } from '@angular/core';

interface Duration {
  readonly name: string;
  readonly value: string;
  readonly use: string;
}

interface Ease {
  readonly name: string;
  readonly curve: string;
  readonly use: string;
}

interface CombinedDemo {
  readonly label: string;
  readonly tokens: string;
  readonly duration: string;
  readonly easing: string;
  readonly kind: 'fade' | 'slide' | 'scale' | 'overshoot';
}

interface TruncRow {
  readonly field: string;
  readonly behaviour: string;
}

const DURATIONS: Duration[] = [
  { name: 'instant', value: '80ms',  use: 'Hover / instant feedback' },
  { name: 'fast',    value: '120ms', use: 'Toggles, micro-state' },
  { name: 'base',    value: '180ms', use: 'Default UI transitions' },
  { name: 'slow',    value: '260ms', use: 'Drawer, dialog enter' },
  { name: 'slower',  value: '400ms', use: 'Page transitions, large reveals' },
];

const EASES: Ease[] = [
  { name: 'standard',   curve: 'cubic-bezier(.2, 0, 0, 1)',     use: 'Default; decelerates into rest' },
  { name: 'emphasized', curve: 'cubic-bezier(.3, 0, .1, 1.4)',  use: 'Pick-up-and-put-down for overlays' },
  { name: 'decelerate', curve: 'cubic-bezier(0, 0, 0, 1)',      use: 'Incoming only — toast / popover open' },
  { name: 'accelerate', curve: 'cubic-bezier(.3, 0, 1, 1)',     use: 'Outgoing only — dismiss / close' },
  { name: 'spring',     curve: 'cubic-bezier(.5, 1.5, .5, 1)',  use: 'Playful overshoot — celebratory feedback' },
];

const COMBINED: CombinedDemo[] = [
  {
    label: 'Toast appear',
    tokens: '--dur-slow + --ease-decelerate',
    duration: '260ms',
    easing: 'cubic-bezier(0, 0, 0, 1)',
    kind: 'slide',
  },
  {
    label: 'Modal enter',
    tokens: '--dur-slow + --ease-emphasized',
    duration: '260ms',
    easing: 'cubic-bezier(.3, 0, .1, 1.4)',
    kind: 'scale',
  },
  {
    label: 'Hover lift',
    tokens: '--dur-fast + --ease-standard',
    duration: '120ms',
    easing: 'cubic-bezier(.2, 0, 0, 1)',
    kind: 'fade',
  },
  {
    label: 'Celebrate tick',
    tokens: '--dur-base + --ease-spring',
    duration: '180ms',
    easing: 'cubic-bezier(.5, 1.5, .5, 1)',
    kind: 'overshoot',
  },
];

const TRUNC: TruncRow[] = [
  {
    field: 'Reduced motion',
    behaviour: 'All durations collapse to 0ms under prefers-reduced-motion. Component CSS does not need to opt in — the token cascade handles it.',
  },
  {
    field: 'Transitions vs loops',
    behaviour: '--dur-* drives state transitions. Indeterminate loops (spinners, skeletons) use --dur-loop-fast / --dur-loop-slow — separate scale for rhythm, not response.',
  },
  {
    field: 'Easing pairing',
    behaviour: 'decelerate for enter, accelerate for exit, standard for state changes, emphasized for overlays. Reserve spring for small celebratory feedback.',
  },
];

@Component({
  selector: 'section-foundations-motion',
  standalone: true,
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-motion" data-anchor="motion" class="section">
      <div class="eyebrow t-overline">Foundations</div>
      <h2 class="t-h2">Motion</h2>
      <p class="lede t-m">
        Five durations, five eases. All motion respects <code class="t-mono">prefers-reduced-motion</code> —
        durations collapse to 0 so components don't need to opt in. Pair durations with the right easing
        per direction: <em>decelerate</em> for enter, <em>accelerate</em> for exit.
      </p>

      <!-- ============================================================ Durations -->
      <h3 class="block-title t-h4">Durations</h3>
      <p class="block-desc t-s">Hover over each card to play the animation. Each puck travels the same distance over its duration with a shared easing.</p>
      <div class="motion-grid">
        @for (d of durations; track d.name) {
          <div class="motion-cell">
            <div class="loop-track">
              <div class="loop-puck loop-puck--dur" [style.transitionDuration]="d.value"></div>
            </div>
            <code class="t-mono token-name">--dur-{{ d.name }}</code>
            <code class="t-mono token-value">{{ d.value }}</code>
            <div class="t-caption token-desc">{{ d.use }}</div>
          </div>
        }
      </div>

      <!-- ============================================================ Easings -->
      <h3 class="block-title t-h4">Easings</h3>
      <p class="block-desc t-s">Hover over each card to play the animation. Same duration, same distance — easing alone changes the feel.</p>
      <div class="motion-grid">
        @for (e of eases; track e.name) {
          <div class="motion-cell">
            <div class="loop-track">
              <div class="loop-puck loop-puck--ease" [style.transitionTimingFunction]="e.curve"></div>
            </div>
            <code class="t-mono token-name">--ease-{{ e.name }}</code>
            <code class="t-mono token-value">{{ e.curve }}</code>
            <div class="t-caption token-desc">{{ e.use }}</div>
          </div>
        }
      </div>

      <!-- ============================================================ Combined -->
      <h3 class="block-title t-h4">Combined · how the DS uses motion in practice</h3>
      <p class="block-desc t-s">Hover any tile to replay the transition.</p>
      <div class="combined-grid">
        @for (c of combined; track c.label) {
          <div class="combined-cell" [class]="'combined-cell--' + c.kind"
               [style.--demo-dur]="c.duration"
               [style.--demo-ease]="c.easing">
            <div class="combined-stage">
              @if (c.kind === 'fade') {
                <div class="demo-card-lift">Hover row</div>
              }
              @if (c.kind === 'slide') {
                <div class="demo-toast">
                  <div class="demo-toast__bar"></div>
                  <div class="demo-toast__title">Manifest saved</div>
                </div>
              }
              @if (c.kind === 'scale') {
                <div class="demo-modal">Confirm dispatch</div>
              }
              @if (c.kind === 'overshoot') {
                <div class="demo-tick">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              }
            </div>
            <div class="combined-label t-s-bold">{{ c.label }}</div>
            <code class="t-mono token-value">{{ c.tokens }}</code>
          </div>
        }
      </div>

      <!-- ============================================================ Truncation -->
      <h3 class="block-title t-h4">Truncation</h3>
      <div class="trunc">
        <div class="trunc__title">Motion rules</div>
        <ul class="trunc__list">
          @for (row of trunc; track row.field) {
            <li>
              <span class="trunc__field">{{ row.field }}</span>
              <span class="trunc__behaviour">{{ row.behaviour }}</span>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); }

    /* ---------- Duration & ease grid ---------- */
    .motion-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--s-5);
      margin-top: var(--s-4);
    }
    .motion-cell {
      display: grid;
      gap: var(--s-2);
      padding: var(--s-4);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
    }
    .token-name { font-size: 12px; color: var(--text-primary); }
    .token-value { font-size: 11px; color: var(--text-tertiary); word-break: break-all; }
    .token-desc { color: var(--text-secondary); line-height: 1.5; }

    /* ---------- Loop tracks (durations + eases) ---------- */
    .loop-track {
      position: relative;
      width: 100%;
      height: 28px;
      background: var(--surface-secondary);
      border-radius: var(--r-pill);
      overflow: hidden;
    }
    .loop-puck {
      position: absolute;
      top: 50%;
      left: 0;
      width: 24px;
      height: 24px;
      margin-top: -12px;
      border-radius: var(--r-pill);
      background: var(--primary);
    }
    /* Durations · shared easing, varying duration. Hover plays once.
       Animate 'left' (not translateX) — % inside translate references the
       element's own width (24px), so calc(100% - 24px) was always 0. */
    .loop-puck--dur {
      transition-property: left;
      transition-duration: var(--dur-base);
      transition-timing-function: var(--ease-standard);
    }
    .motion-cell:hover .loop-puck--dur {
      left: calc(100% - 24px);
    }
    /* Eases · shared duration (long enough to read the curve), varying easing. */
    .loop-puck--ease {
      transition-property: left;
      transition-duration: 1400ms;
      transition-timing-function: var(--ease-standard);
    }
    .motion-cell:hover .loop-puck--ease {
      left: calc(100% - 24px);
    }

    /* ---------- Combined demos ---------- */
    .combined-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--s-4);
      margin-top: var(--s-4);
    }
    .combined-cell {
      display: grid;
      gap: var(--s-2);
      padding: var(--s-4);
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
    }
    .combined-stage {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 120px;
      background: var(--surface-canvas);
      border-radius: var(--r-md);
      overflow: hidden;
    }
    .combined-label { color: var(--text-primary); }

    /* Fade / lift demo */
    .demo-card-lift {
      padding: var(--s-3) var(--s-4);
      background: var(--surface-default);
      border-radius: var(--r-md);
      box-shadow: var(--z100);
      font: var(--fw-bold) var(--fs-s)/1 var(--font-sans);
      color: var(--text-primary);
      transition: transform var(--demo-dur) var(--demo-ease), box-shadow var(--demo-dur) var(--demo-ease);
    }
    .combined-cell--fade:hover .demo-card-lift {
      transform: translateY(-4px);
      box-shadow: var(--z300);
    }

    /* Slide demo · toast */
    .demo-toast {
      display: flex;
      align-items: center;
      gap: var(--s-2);
      width: 80%;
      padding: var(--s-2) var(--s-3);
      background: var(--surface-default);
      border-radius: var(--r-md);
      box-shadow: var(--z200);
      transform: translateY(40px);
      opacity: 0;
      transition: transform var(--demo-dur) var(--demo-ease), opacity var(--demo-dur) var(--demo-ease);
    }
    .demo-toast__bar {
      width: 3px;
      align-self: stretch;
      background: var(--success);
      border-radius: var(--r-sm);
    }
    .demo-toast__title {
      font: var(--fw-bold) var(--fs-s)/1 var(--font-sans);
      color: var(--text-primary);
    }
    .combined-cell--slide:hover .demo-toast {
      transform: translateY(0);
      opacity: 1;
    }

    /* Scale demo · modal */
    .demo-modal {
      padding: var(--s-3) var(--s-4);
      background: var(--surface-default);
      border-radius: var(--r-md);
      box-shadow: var(--z400);
      font: var(--fw-bold) var(--fs-s)/1 var(--font-sans);
      color: var(--text-primary);
      transform: scale(0.85);
      opacity: 0;
      transition: transform var(--demo-dur) var(--demo-ease), opacity var(--demo-dur) var(--demo-ease);
    }
    .combined-cell--scale:hover .demo-modal {
      transform: scale(1);
      opacity: 1;
    }

    /* Overshoot demo · tick */
    .demo-tick {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: var(--r-pill);
      background: var(--success);
      color: var(--neutral-0);
      transform: scale(0.6);
      opacity: 0;
      transition: transform var(--demo-dur) var(--demo-ease), opacity var(--demo-dur) var(--demo-ease);
    }
    .combined-cell--overshoot:hover .demo-tick {
      transform: scale(1);
      opacity: 1;
    }

    /* ---------- Truncation block ---------- */
    .trunc {
      margin-top: var(--s-3);
      padding: var(--s-4);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .trunc__title {
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
      grid-template-columns: 220px 1fr;
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

    @media (prefers-reduced-motion: reduce) {
      .loop-puck,
      .demo-card-lift,
      .demo-toast,
      .demo-modal,
      .demo-tick {
        animation: none !important;
        transition: none !important;
      }
      .loop-puck { left: calc(50% - 12px); }
      .demo-toast,
      .demo-modal,
      .demo-tick { opacity: 1; transform: none; }
    }
  `],
})
export class MotionSection {
  protected readonly durations = DURATIONS;
  protected readonly eases = EASES;
  protected readonly combined = COMBINED;
  protected readonly trunc = TRUNC;
}
