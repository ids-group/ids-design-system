import {
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

/**
 * Dev-only guard for a component that DROPS whatever is projected into it, so the
 * author gets a warning instead of silence — there is no compile-time signal for
 * content a component chooses to ignore. Put it on a probe around the
 * `<ng-content>`, gated on dev mode so production renders no extra node:
 *
 * ```html
 * @if (devMode) {
 *   <span dsProjectionDropped="ds-filter-bar"><ng-content></ng-content></span>
 * }
 * ```
 *
 * It is NOT projection support: the probe exists so the warning can see that
 * content arrived, and then hides it.
 *
 * `ds-filter-bar` is the only host today. The field family used to be the reason
 * this exists, and is not any more — `ds-checkbox`, `ds-radio` and `ds-switch`
 * render a projected caption since 0.8.0 and dropped the probe with that release.
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
