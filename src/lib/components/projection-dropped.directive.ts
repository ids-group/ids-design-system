import {
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { reportDevWarning } from '@ids-group-ltd/ids-design-system/core';

/**
 * Dev-only guard for a component that DROPS whatever is projected into it: warns instead of
 * staying silent. Put it on a probe around the `<ng-content>`, gated on dev mode:
 *
 * ```html
 * @if (devMode) {
 *   <span dsProjectionDropped="ds-filter-bar"><ng-content></ng-content></span>
 * }
 * ```
 *
 * It is NOT projection support: the probe only detects that content arrived, then hides it.
 * `reason` replaces the default `[label]` wording.
 * @internal
 */
@Directive({
  selector: '[dsProjectionDropped]',
  standalone: true,
  host: { style: 'display: none' },
})
export class ProjectionDroppedDirective {
  readonly dsProjectionDropped = input.required<string>();
  /** Overrides the `[label]` explanation; appended after "Projected content renders nothing". */
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
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        reportDevWarning(
          `[${selector}] Projected content renders nothing — ${reason}`,
        );
      }
    });
  }
}
