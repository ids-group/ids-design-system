import {
  Component,
  ViewEncapsulation,
  afterNextRender,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { BadgeComponent } from 'ds';
import {
  COMPONENT_COUNT,
  FOUNDATION_COUNT,
  PATTERN_COUNT,
  DS_VERSION,
  countDesignTokens,
} from '../../shared/docs-stats';

@Component({
  selector: 'section-home',
  standalone: true,
  imports: [BadgeComponent, RouterLink],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './home.section.html',
  styleUrls: ['./home.section.scss', './home.responsive.scss'],
})
export class HomeSection {
  readonly version = DS_VERSION;
  readonly componentCount = COMPONENT_COUNT;
  readonly foundationCount = FOUNDATION_COUNT;
  readonly patternCount = PATTERN_COUNT;
  readonly tokenCount = signal<number | null>(null);

  constructor() {
    afterNextRender(() => this.tokenCount.set(countDesignTokens()));
  }
}
