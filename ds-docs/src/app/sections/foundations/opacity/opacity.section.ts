import { Component, ViewEncapsulation } from '@angular/core';

interface OpacityStop {
  readonly token: string;
  readonly value: number;
  readonly use: string;
}

interface AlphaRef {
  readonly alpha: string;
  readonly where: string;
}

const STOPS: readonly OpacityStop[] = [
  { token: '--opacity-disabled',       value: 0.5,  use: 'Full disabled state on interactive components' },
  { token: '--opacity-muted',          value: 0.6,  use: 'Legacy alias — being phased out in favour of --text-* roles' },
  { token: '--opacity-text-disabled',  value: 0.38, use: 'Disabled text where a colour token isn’t available' },
  { token: '--opacity-scrim',          value: 0.55, use: 'Modal / drawer backdrop overlay' },
  { token: '--opacity-state-hover',    value: 0.08, use: 'Hover layer over surface (overlay vs surface swap)' },
  { token: '--opacity-state-pressed',  value: 0.16, use: 'Active / pressed layer' },
];

const LITERALS: readonly AlphaRef[] = [
  { alpha: '--shadow-tint-h/s/l',  where: 'Channel-split substrate for --shadow-1..--shadow-4. Light: 225 / 39% / 7%. Re-skin propagates through HSL channels.' },
  { alpha: '--focus-tint-rgb',     where: 'Focus halo RGB channel. Used inside --focus-field and --focus-overlay tokens.' },
  { alpha: '--surface-scrim',      where: 'Modal / drawer backdrop. Consumes --opacity-scrim (0.55) over neutral substrate.' },
];

@Component({
  selector: 'section-foundations-opacity',
  standalone: true,
  imports: [],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './opacity.section.html',
  styleUrl: './opacity.section.scss',
})
export class OpacitySection {
  protected readonly stops = STOPS;
  protected readonly literals = LITERALS;
}
