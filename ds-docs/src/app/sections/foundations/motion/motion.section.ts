import { Component, ViewEncapsulation } from '@angular/core';
import { DocsTruncationComponent, TruncationRule } from '../../../shared/docs-truncation.component';

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
    tokens: '--duration-slow + --ease-decelerate',
    duration: '260ms',
    easing: 'cubic-bezier(0, 0, 0, 1)',
    kind: 'slide',
  },
  {
    label: 'Modal enter',
    tokens: '--duration-slow + --ease-emphasized',
    duration: '260ms',
    easing: 'cubic-bezier(.3, 0, .1, 1.4)',
    kind: 'scale',
  },
  {
    label: 'Hover lift',
    tokens: '--duration-fast + --ease-standard',
    duration: '120ms',
    easing: 'cubic-bezier(.2, 0, 0, 1)',
    kind: 'fade',
  },
  {
    label: 'Celebrate tick',
    tokens: '--duration-base + --ease-spring',
    duration: '180ms',
    easing: 'cubic-bezier(.5, 1.5, .5, 1)',
    kind: 'overshoot',
  },
];

@Component({
  selector: 'section-foundations-motion',
  standalone: true,
  imports: [DocsTruncationComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './motion.section.html',
  styleUrl: './motion.section.scss',
})
export class MotionSection {
  protected readonly durations = DURATIONS;
  protected readonly eases = EASES;
  protected readonly combined = COMBINED;
  protected readonly truncationRules: TruncationRule[] = [
    { field: 'Reduced motion', behaviour: 'All durations collapse to 0ms under prefers-reduced-motion. Component CSS does not need to opt in — the token cascade handles it.' },
    { field: 'Transitions vs loops', behaviour: '--duration-* drives state transitions. Indeterminate loops (spinners, skeletons) use --duration-loop-fast / --duration-loop-slow — separate scale for rhythm, not response.' },
    { field: 'Easing pairing', behaviour: 'decelerate for enter, accelerate for exit, standard for state changes, emphasized for overlays. Reserve spring for small celebratory feedback.' },
  ];
}
