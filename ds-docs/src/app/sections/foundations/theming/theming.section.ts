import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';

@Component({
  selector: 'section-foundations-theming',
  standalone: true,
  imports: [DocsSectionComponent],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './theming.section.html',
  styleUrl: './theming.section.scss',
})
export class ThemingSection {
  // Code samples live as strings (rendered via interpolation) so braces / @ / < >
  // are literal text and don't trip Angular's ICU / interpolation parser.
  protected readonly osFollowSnippet = `const mq = matchMedia('(prefers-color-scheme: dark)');
const apply = () =>
  document.documentElement.setAttribute('data-theme', mq.matches ? 'dark' : 'light');
apply();
mq.addEventListener('change', apply);`;

  protected readonly activationSnippet = `:root                    { @include light.theme; }   // default
:root[data-theme='dark'] { @include dark.theme; }     // opt-in — complete set, fully wins`;

  protected readonly brandSnippet = `// _brand-acme.scss — authored on the light theme
[data-brand='acme'] {
  --blue-600: #6b3fd4;     // brand hue → --primary and friends retint
  --primary:  #6b3fd4;     // (optional) pin the exact stop
}
// only if the brand also needs a dark skin:
[data-theme='dark'][data-brand='acme'] { --primary: #8a63e8; }`;

  protected readonly consumerSnippet = `// styles.scss — light out of the box, dark opt-in via data-theme
@use 'styles/ds';

// optional brand overlay on top
@use './app/styles/brand-acme';`;
}
