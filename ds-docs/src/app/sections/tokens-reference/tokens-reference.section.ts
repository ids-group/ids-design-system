import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../shared/docs-section.component';
import {
  SEMANTIC_PRIMARY,
  SEMANTIC_TERTIARY,
  SEMANTIC_ERROR,
  SEMANTIC_SUCCESS,
  SEMANTIC_WARNING,
  SEMANTIC_INFO,
  SEMANTIC_TEXT,
  SEMANTIC_SURFACE,
  SEMANTIC_BORDER,
  SEMANTIC_FOCUS,
  RAMPS,
} from './colours.data';
import {
  TYPOGRAPHY_FONT,
  TYPOGRAPHY_SIZE,
  TYPOGRAPHY_LH,
  TYPOGRAPHY_LS,
  TYPOGRAPHY_FW,
} from './typography.data';
import {
  SPACING,
  RADIUS,
  SHADOWS,
  MOTION_DUR,
  MOTION_EASE,
  DENSITY_HIT,
  DENSITY_TIERS,
  LAYOUT_BP,
  LAYOUT_COL,
  ICONS,
  MISC_BW,
  MISC_OPACITY,
  MISC_BLUR,
} from './scales.data';
import { COMPONENT_TOKENS } from './component-tokens.data';

@Component({
  selector: 'section-tokens-reference',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tokens-reference.section.html',
  styleUrl: './tokens-reference.section.scss',
})
export class TokensReferenceSection {
  protected readonly primarySemantic = SEMANTIC_PRIMARY;
  protected readonly tertiarySemantic = SEMANTIC_TERTIARY;
  protected readonly errorSemantic = SEMANTIC_ERROR;
  protected readonly successSemantic = SEMANTIC_SUCCESS;
  protected readonly warningSemantic = SEMANTIC_WARNING;
  protected readonly infoSemantic = SEMANTIC_INFO;
  protected readonly textSemantic = SEMANTIC_TEXT;
  protected readonly surfaceSemantic = SEMANTIC_SURFACE;
  protected readonly borderSemantic = SEMANTIC_BORDER;
  protected readonly focusSemantic = SEMANTIC_FOCUS;
  protected readonly ramps = RAMPS;
  protected readonly typeFont = TYPOGRAPHY_FONT;
  protected readonly typeSize = TYPOGRAPHY_SIZE;
  protected readonly typeLh = TYPOGRAPHY_LH;
  protected readonly typeLs = TYPOGRAPHY_LS;
  protected readonly typeFw = TYPOGRAPHY_FW;
  protected readonly spacing = SPACING;
  protected readonly radius = RADIUS;
  protected readonly shadows = SHADOWS;
  protected readonly motionDur = MOTION_DUR;
  protected readonly motionEase = MOTION_EASE;
  protected readonly densityHit = DENSITY_HIT;
  protected readonly densityTiers = DENSITY_TIERS;
  protected readonly layoutBp = LAYOUT_BP;
  protected readonly layoutCol = LAYOUT_COL;
  protected readonly icons = ICONS;
  protected readonly miscBw = MISC_BW;
  protected readonly miscOpacity = MISC_OPACITY;
  protected readonly miscBlur = MISC_BLUR;
  protected readonly componentTokens = COMPONENT_TOKENS;

  protected hasShadowSample(name: string): boolean {
    return (
      name === '--shadow-1' ||
      name === '--shadow-2' ||
      name === '--shadow-3' ||
      name === '--shadow-4' ||
      name === '--shadow-card' ||
      name === '--shadow-popover' ||
      name === '--shadow-toast' ||
      name === '--shadow-modal'
    );
  }

  /** True when the default value resolves to a colour token (drives the swatch chip vs "geometry" placeholder). */
  protected isColorValue(value: string): boolean {
    const colourTokens = [
      'brand',
      'danger',
      'success',
      'warning',
      'info',
      'text-',
      'icon-',
      'surface-',
      'border-',
      'neutral-',
    ];
    if (value === 'transparent' || value === 'none') {
      return false;
    }

    return colourTokens.some((prefix) => value.includes(prefix));
  }
}
