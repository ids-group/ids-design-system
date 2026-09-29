import {
  Directive,
  ElementRef,
  afterNextRender,
  inject,
  input,
} from '@angular/core';

/**
 * Dev-only guard for a component that DROPS whatever is projected into it, so the author gets
 * a warning instead of silence. Put it on a probe around the `<ng-content>`, gated on dev
 * mode so production renders no extra node:
 *
 * ```html
 * @if (devMode) {
 *   <span dsProjectionDropped="ds-filter-bar"><ng-content></ng-content></span>
 * }
 * ```
 *
 * It is NOT projection support: the probe exists so the warning can see that content
 * arrived, and then hides it.
 *
 * `reason` replaces the default `[label]` wording for a host that drops content for a
 * different reason.
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
      console.warn(
        `[${selector}] Projected content renders nothing — ${reason}`,
      );
    });
  }
}
