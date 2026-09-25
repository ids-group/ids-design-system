import {
  Component,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { AlertComponent } from 'ds/alert';
import { ButtonComponent } from 'ds/button';
import { SegmentedComponent } from 'ds/segmented';
import type { SegmentedOption } from 'ds/segmented';
import { SelectComponent } from 'ds/select';
import type { SelectItem } from 'ds/select';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

interface Duration {
  readonly name: string;
  readonly value: string;
  readonly use: string;
}

interface Ease {
  readonly name: string;
  readonly curve: string;
  readonly shownCurve?: string;
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
  { name: 'instant', value: '80ms', use: 'Hover / instant feedback' },
  { name: 'fast', value: '120ms', use: 'Toggles, micro-state' },
  { name: 'base', value: '180ms', use: 'Default UI transitions' },
  { name: 'slow', value: '260ms', use: 'Drawer, dialog enter' },
  { name: 'slower', value: '400ms', use: 'Page transitions, large reveals' },
  {
    name: 'slowest',
    value: '600ms',
    use: 'A chart mark growing or drawing on',
  },
];

const EASES: Ease[] = [
  {
    name: 'standard',
    curve: 'cubic-bezier(.2, 0, 0, 1)',
    use: 'Default; decelerates into rest',
  },
  {
    name: 'emphasized',
    curve: 'cubic-bezier(.3, 0, .1, 1.4)',
    use: 'Pick-up-and-put-down for overlays',
  },
  {
    name: 'decelerate',
    curve: 'cubic-bezier(0, 0, 0, 1)',
    use: 'Incoming only — toast / popover open',
  },
  {
    name: 'accelerate',
    curve: 'cubic-bezier(.3, 0, 1, 1)',
    use: 'Outgoing only — dismiss / close',
  },
  {
    name: 'spring',
    curve: 'cubic-bezier(.5, 1.5, .5, 1)',
    use: 'Playful overshoot — celebratory feedback',
  },
  {
    name: 'emphasized-decelerate',
    curve: 'cubic-bezier(.05, .7, .1, 1)',
    use: 'A large mark arriving, long and calm at the end',
  },
  {
    name: 'settle',
    curve:
      'linear(0, 0.09 6.3%, 0.265 12.5%, 0.444 18.8%, 0.596 25%, 0.715 31.3%, 0.803 37.5%, 0.867 43.8%, 0.911 50%, 0.942 56.3%, 0.962 62.5%, 0.976 68.8%, 0.986 75%, 0.992 81.3%, 0.996 87.5%, 0.998 93.8%, 1)',
    shownCurve: 'linear(…)',
    use: 'A mark growing into its value; never overshoots',
  },
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

interface EnterPreset {
  readonly keyframes: string;
  readonly label: string;
  readonly feel: string;
  readonly defaultFor: string;
}

const ENTER_PRESETS: readonly EnterPreset[] = [
  {
    keyframes: 'ds-slide-in',
    label: 'Slide',
    feel: 'Fades while travelling a short distance — for a panel, in from the trigger edge.',
    defaultFor: 'Nothing — opt in with --ds-<surface>-enter-keyframes',
  },
  {
    keyframes: 'ds-scale-in',
    label: 'Scale',
    feel: 'Grows into place from a micro-scale, out of the trigger edge — no travel.',
    defaultFor: 'Overlay panels, modal, toast, banner, alert',
  },
  {
    keyframes: 'ds-fade-in',
    label: 'Fade',
    feel: 'Opacity only — the calmest option, and the steadiest on dense screens.',
    defaultFor: 'Scrims, loading overlay',
  },
  {
    keyframes: 'ds-slide-edge-in',
    label: 'Slide from edge',
    feel: 'Full-distance travel with NO fade — a fade would read as a flicker on a large panel.',
    defaultFor: 'Drawer, bottom sheet',
  },
];

const DEMO_OPTIONS: SelectItem[] = [
  { label: 'Rotterdam', value: 'rtm' },
  { label: 'Felixstowe', value: 'fxt' },
  { label: 'Gdańsk', value: 'gdn' },
  { label: 'Antwerp', value: 'anr' },
];

@Component({
  selector: 'section-foundations-motion',
  standalone: true,
  imports: [
    AlertComponent,
    ButtonComponent,
    DocsSectionComponent,
    SegmentedComponent,
    SelectComponent,
  ],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './motion.section.html',
  styleUrl: './motion.section.scss',
})
export class MotionSection {
  protected readonly durations = DURATIONS;
  protected readonly eases = EASES;
  protected readonly combined = COMBINED;
  protected readonly enterPresets = ENTER_PRESETS;
  protected readonly demoOptions = DEMO_OPTIONS;
  protected readonly presetOptions: SegmentedOption[] = ENTER_PRESETS.map(
    (preset) => ({ label: preset.label, value: preset.keyframes }),
  );
  // Opens on what the library actually does with no configuration, so the demo is not read as
  // the default.
  protected readonly preset = signal('ds-scale-in');
  protected readonly alertShown = signal(true);
  private readonly injector = inject(Injector);

  /** An entrance plays on insert, so the only honest way to replay it is to re-mount the
   *  surface. `afterNextRender` rather than a timeout: a `setTimeout(0)` can run before
   *  change detection has torn the alert down, and then the signal is back to `true`
   *  before `@if` ever removed anything - no re-insert, no entrance. */
  protected replayAlert(): void {
    this.alertShown.set(false);
    afterNextRender(() => this.alertShown.set(true), {
      injector: this.injector,
    });
  }
}
