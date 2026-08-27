import {
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

/**
 * Dev-only guard for a component whose caption comes from a `[label]` input and
 * that therefore projects nothing, so `<ds-switch>Some text</ds-switch>` renders
 * no caption at all — silently, with no compile-time signal. Put it on a probe
 * around the component's only `<ng-content>`, gated on dev mode so production
 * renders no extra node:
 *
 * ```html
 * @if (devMode) {
 *   <span dsProjectionDropped="ds-switch"><ng-content></ng-content></span>
 * }
 * ```
 *
 * NOT projection support: the probe exists only so the warning can see that
 * content was passed, and the directive hides it. Real projection for the field
 * family is still open.
 *
 * `reason` replaces the default `[label]` wording for a host that drops content
 * for a different reason — `ds-filter-bar` drops anything that carries neither of
 * its slot attributes.
 */
@Directive({
  selector: '[dsProjectionDropped]',
  standalone: true,
  host: { style: 'display: none' },
})
export class ProjectionDroppedDirective {
  /** The host component's selector, named in the warning. */
  readonly dsProjectionDropped = input.required<string>();
  /** Overrides the `[label]` explanation for a host that drops content for
   *  another reason. Ends up after "renders nothing — ". */
  readonly reason = input<string>('');

  private readonly probe = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => {
      if (!this.probe.nativeElement.textContent?.trim()) {
        return;
      }
      const selector = this.dsProjectionDropped();
      const reason =
        this.reason() ||
        `the caption comes from the [label] input only, so \`<${selector}>Some text</${selector}>\` shows no caption at all. Move the text into [label].`;
      console.warn(
        `[${selector}] Projected content renders nothing — ${reason}`,
      );
    });
  }
}
