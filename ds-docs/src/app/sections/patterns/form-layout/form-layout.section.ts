import { Component, ViewEncapsulation } from '@angular/core';
import { InputComponent, SelectComponent, ButtonComponent, IconComponent, type SelectOption } from 'ds';

@Component({
  selector: 'pattern-form-layout',
  standalone: true,
  imports: [InputComponent, SelectComponent, ButtonComponent, IconComponent],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <section id="section-pattern-form-layout" data-anchor="pattern-form-layout" class="section">
      <div class="eyebrow t-overline">Patterns</div>
      <h2 class="t-h2">Form layout</h2>
      <p class="lede t-m">{{ lede }}</p>

      <h3 class="block-title t-h4">Multi-column form</h3>
      <p class="block-desc t-s">
        Two-column section pattern: title and description on the left, fields on the right.
        Fields stack vertically; naturally-paired controls (Start / End, City / Country) sit
        side-by-side. A footer anchors every form with a secondary Discard and a primary Save.
      </p>
      <div class="stage">
        <form class="form">
          <div class="form-section">
            <div class="form-section__head">
              <h4 class="t-h5">Record identity</h4>
              <p class="t-s muted">The display name and ID used across the operations stack.</p>
            </div>
            <div class="form-section__body">
              <div class="row row--2">
                <ds-input label="Name" placeholder="Project Alpha" [value]="name" [required]="true" />
                <ds-input label="ID (auto)" placeholder="EVT-2026-0142" [value]="recordId" [disabled]="true" />
              </div>
              <ds-select label="Member" [options]="members" [value]="member" />
            </div>
          </div>

          <div class="form-section">
            <div class="form-section__head">
              <h4 class="t-h5">Schedule</h4>
              <p class="t-s muted">Three discrete date blocks — Build, Live, and Strike. Editing any of them triggers an impact preview on save.</p>
            </div>
            <div class="form-section__body">
              <fieldset class="fieldset">
                <legend>Build</legend>
                <div class="row row--2">
                  <ds-input label="Start" placeholder="27 Jul 2026 06:00" [value]="buildStart" />
                  <ds-input label="Complete" placeholder="30 Jul 2026 12:00" [value]="buildEnd" />
                </div>
              </fieldset>
              <fieldset class="fieldset">
                <legend>Live</legend>
                <div class="row row--2">
                  <ds-input label="Open" placeholder="30 Jul 2026 14:00" [value]="liveOpen" />
                  <ds-input label="Close" placeholder="3 Aug 2026 23:00" [value]="liveClose" />
                </div>
              </fieldset>
            </div>
          </div>

          <div class="form-section">
            <div class="form-section__head">
              <h4 class="t-h5">Address</h4>
              <p class="t-s muted">Six / twelve split — city plus country on a single 12-col row.</p>
            </div>
            <div class="form-section__body">
              <div class="row row--6-12">
                <ds-input label="City" placeholder="Suffolk" [value]="city" />
                <ds-input label="Country" placeholder="United Kingdom" [value]="country" />
              </div>
            </div>
          </div>

          <div class="form-footer">
            <ds-button variant="ghost">Discard</ds-button>
            <ds-button>Save changes</ds-button>
          </div>
        </form>
      </div>

      <h3 class="block-title t-h4">Inline edit</h3>
      <p class="block-desc t-s">
        One-line label + control + save/cancel pill. Use when a single field is the entire
        unit of work — renames, status flips, single-cell table edits.
      </p>
      <div class="stage">
        <div class="inline-edit">
          <label class="inline-edit__label t-s">Display name</label>
          <ds-input [value]="name" placeholder="Project Alpha" />
          <div class="inline-edit__actions">
            <button type="button" class="pill pill--ghost">
              <ds-icon name="x" [size]="14" /> Cancel
            </button>
            <button type="button" class="pill pill--primary">
              <ds-icon name="check" [size]="14" /> Save
            </button>
          </div>
        </div>
      </div>

      <h3 class="block-title t-h4">Usage</h3>
      <ul class="rules">
        <li>Section description fits on one line — if you need two, the section is doing too much.</li>
        <li>Pair natural counterparts (Start/End, City/Country) horizontally; everything else stacks.</li>
        <li>Footer stays visible without scroll on common viewports; sticky-footer is acceptable on tall forms.</li>
        <li>Inline edit is for single-field changes. Promote to a full form once two or more fields move together.</li>
      </ul>
    </section>
  `,
  styles: [`
    :host { display: block; }
    section { scroll-margin-top: calc(var(--topbar-h) + var(--s-4)); }
    .eyebrow { color: var(--primary); margin-bottom: var(--s-2); }
    .lede { color: var(--text-secondary); margin-top: var(--s-2); max-width: var(--col-cap-text); }
    .block-title { margin-top: var(--s-8); }
    .block-desc { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }
    .stage {
      margin-top: var(--s-3);
      padding: var(--s-5);
      background: var(--surface-secondary);
      border-radius: var(--r-lg);
    }
    .form {
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-lg);
      padding: var(--s-5);
      display: grid;
      gap: var(--s-6);
    }
    .form-section {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
      gap: var(--s-6);
    }
    .form-section__body {
      display: grid;
      gap: var(--s-4);
    }
    .row {
      display: grid;
      gap: var(--s-3);
    }
    .row--2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .row--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .row--6-12 { grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); }
    .fieldset {
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-md);
      padding: var(--s-3) var(--s-4) var(--s-4);
      margin: 0;
    }
    .fieldset > legend {
      padding: 0 var(--s-2);
      font: var(--fw-bold) var(--fs-xs)/var(--lh-base) var(--font-sans);
      letter-spacing: var(--ls-wider);
      text-transform: uppercase;
      color: var(--text-tertiary);
    }
    .form-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--s-2);
      padding-top: var(--s-4);
      border-top: var(--bw-default) solid var(--border-divider);
    }
    .muted { color: var(--text-secondary); margin-top: var(--s-1); max-width: var(--col-cap-text); }

    /* Inline edit row */
    .inline-edit {
      display: grid;
      grid-template-columns: 140px minmax(0, 1fr) auto;
      gap: var(--s-3);
      align-items: center;
      background: var(--surface-default);
      border: var(--bw-default) solid var(--border-divider);
      border-radius: var(--r-md);
      padding: var(--s-3) var(--s-4);
    }
    .inline-edit__label {
      color: var(--text-secondary);
      font-weight: var(--fw-bold);
    }
    .inline-edit__actions {
      display: inline-flex;
      gap: var(--s-2);
    }
    .pill {
      display: inline-flex;
      align-items: center;
      gap: var(--s-1);
      padding: var(--s-1) var(--s-3);
      border-radius: var(--r-pill);
      border: var(--bw-default) solid var(--border-divider);
      background: var(--surface-default);
      color: var(--text-primary);
      font: var(--fw-bold) var(--fs-xs)/var(--lh-base) var(--font-sans);
      cursor: pointer;
    }
    .pill--ghost { background: transparent; color: var(--text-secondary); }
    .pill--primary {
      background: var(--primary);
      color: var(--text-on-primary, #fff);
      border-color: var(--primary);
    }

    .rules {
      margin-top: var(--s-3);
      padding-left: var(--s-5);
      color: var(--text-secondary);
      display: grid;
      gap: var(--s-2);
      max-width: var(--col-cap-text);
    }

    @media (max-width: 720px) {
      .form-section { grid-template-columns: 1fr; gap: var(--s-3); }
      .row--2, .row--3, .row--6-12 { grid-template-columns: 1fr; }
      .inline-edit { grid-template-columns: 1fr; }
    }
  `],
})
export class FormLayoutSection {
  protected readonly lede =
    'Two-column form section, side-by-side date pairs, a 6/12 city/country split, and an inline-edit row for one-field changes. Footer with Discard and Save anchors every full form.';

  protected readonly name = 'Project Alpha';
  protected readonly recordId = 'EVT-2026-0142';
  protected readonly buildStart = '27 Jul 2026 06:00';
  protected readonly buildEnd = '30 Jul 2026 12:00';
  protected readonly liveOpen = '30 Jul 2026 14:00';
  protected readonly liveClose = '3 Aug 2026 23:00';
  protected readonly city = 'Suffolk';
  protected readonly country = 'United Kingdom';
  protected readonly member = 'acme';
  protected readonly members: SelectOption[] = [
    { label: 'Acme Holdings', value: 'acme' },
    { label: 'North Site Co.', value: 'north' },
    { label: 'Delta Partners', value: 'delta' },
  ];
}
