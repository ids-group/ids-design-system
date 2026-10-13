import { Component, ViewEncapsulation } from '@angular/core';
import { DocsSectionComponent } from '../../../shared/docs-section.component';
import { DocsLocaleDemo } from './locale-demo.component';

@Component({
  selector: 'section-foundations-theming',
  standalone: true,
  imports: [DocsSectionComponent, DocsLocaleDemo],
  encapsulation: ViewEncapsulation.Emulated,
  templateUrl: './theming.section.html',
  styleUrl: './theming.section.scss',
})
export class ThemingSection {
  // Code samples live as strings (rendered via interpolation) so braces / @ / < >
  // are literal text and don't trip Angular's ICU / interpolation parser.
  protected readonly osFollowSnippet = `// app.config.ts
import { provideDsTheme } from '@ids-group-ltd/ids-design-system';

providers: [provideDsTheme({ followSystem: true })]`;

  protected readonly activationSnippet = `:root                    { @include light.theme; }   // default
:root[data-theme='dark'] { @include dark.theme; }     // opt-in — complete set, fully wins`;

  protected readonly brandSnippet = `// _brand-acme.scss - on <html>, authored on the light theme
[data-brand='acme'] {
  // Palette channels: the --blue-* ramp, --primary and every --primary-h/s/l
  // reader (focus rings, field halos) and the links recompose from them.
  --blue-h: 258;
  --blue-s: 63%;
  --blue-l: 54%;
}
// a role override needs the dark selector too, or the dark block wins:
[data-theme='dark'][data-brand='acme'] { --primary: #8a63e8; }`;

  protected readonly brandChecklistSnippet = `// Light defaults; dark keeps each hue from --primary
--primary-strong:       hsl(from var(--primary) h calc(s * 0.85) calc(l - 7));
--surface-tint:         hsl(from var(--primary) h 100% 97%);
--primary-subtitle:     hsl(from var(--primary) h 100% 97%);
--primary-muted:        hsl(from var(--primary) h 95% 94%);
--primary-muted-strong: hsl(from var(--primary) h 95% 89%);

// Green brand
[data-brand='green'] {
  --primary: #1f7a4d;
  --primary-h: 150; --primary-s: 60%; --primary-l: 30%;
  // derived: tint and subtitle #f0fff7, muted #e1fef0,
  // strong #1d583b (8.33:1 on white, 8.07:1 on the tint); links stay blue
}
[data-theme='dark'][data-brand='green'] {
  --primary: #1f7a4d;
  --primary-h: 150; --primary-s: 60%; --primary-l: 30%;
}`;

  protected readonly squareSnippet = `// A square brand — three roles.
:root {
  --ds-radius-inner: 0;     // options, chips, calendar days, close buttons
  --ds-radius-control: 0;   // buttons, fields, triggers
  --ds-radius-panel: 0;     // menus, modals, dropdown panels
  // Not --radius-pill: switch tracks, avatars and status dots are round
  // by shape, not by style.
}`;

  protected readonly squarePartialSnippet = `// Square the controls, keep panels rounded — this is what the ROLES are for.
:root {
  --ds-radius-control: 0;   // buttons, fields, triggers
  --ds-radius-panel: 12px;  // menus, modals, dropdown panels
}`;

  protected readonly consumerSnippet = `// styles.scss — light out of the box, dark opt-in via data-theme
@use 'styles/ds';

// optional brand overlay on top
@use './app/styles/brand-acme';`;

  protected readonly configSnippet = `// app.config.ts — say it once, not on every element
providers: [
  provideDsConfig({
    locale: 'en-GB',                      // numbers and dates: charts, date picker, file sizes
    control: { size: 'sm' },              // button, field, picker, checkbox…
    pagination: { size: 'md', layout: 'spread' }, // every pager, ds-table's footer included
    chart: { pinOnClick: false, hoverDelayMs: 0 }, // a click holds no mark, a pointer is answered at once
    card: { elevation: 'raised', padding: 'lg' },
    table: { stickyScrollbar: true, bordered: true },
    icon: { size: 18 },
    badge: { withDot: true },
    modal: { dividers: false },
    picker: { searchable: 12 },            // threshold: filter row past 12 options
    toast: { maxVisible: 3, showQueueCount: false, position: { verticalPosition: 'bottom' } },
    // dev mode only: library warnings go to the console alone, not to a toast as well
    // toast: { mirrorDevWarnings: false },
    field: {
      reserveMessage: true,
      // Per state, independent of each other: error / warning / success carry a
      // glyph by default and the hint line does not.
      stateIcons: { warning: false, hint: 'info' },
    },
    brand: { name: 'Acme', tagline: 'Cover, sorted' },
    datePicker: { firstDayOfWeek: 1 },
    timePicker: { format: '12h' },
    breadcrumbs: { separator: 'chevronRight' },
    avatar: { initials: (name) => name.slice(0, 2).toUpperCase() },
  }),
]

// A screen that differs still binds the attribute, and it wins:
// <ds-button size="lg">  <ds-table [stickyScrollbar]="false">`;
}
