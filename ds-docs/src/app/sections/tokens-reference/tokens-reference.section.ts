import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../shared/docs-section.component';
import { COMPONENT_GROUPS, GLOBAL_GROUPS, TOKEN_STATS } from './tokens.generated';

@Component({
  selector: 'section-tokens-reference',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './tokens-reference.section.html',
  styleUrl: './tokens-reference.section.scss',
})
export class TokensReferenceSection {
  protected readonly globalGroups = GLOBAL_GROUPS;
  protected readonly componentGroups = COMPONENT_GROUPS;
  protected readonly stats = TOKEN_STATS;

  /** Maps a typography token name to the CSS property its "Aa 123" sample should demonstrate. */
  protected fontSampleStyle(name: string): Record<string, string> {
    const v = `var(${name})`;
    if (name.includes('font-size')) return { 'font-size': v };
    if (name.includes('font-weight')) return { 'font-weight': v };
    if (name.includes('line-height')) return { 'line-height': v, display: 'inline-block' };
    if (name.includes('letter-spacing')) return { 'letter-spacing': v };
    if (name.includes('font-') || name.includes('-font')) return { 'font-family': v };
    return {};
  }
}
