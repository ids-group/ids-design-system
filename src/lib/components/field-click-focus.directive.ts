import { Directive, ElementRef, inject } from '@angular/core';

/**
 * Focuses the field's inner `input`/`textarea` when the click lands on the
 * frame chrome — padding, a leading/trailing icon, an addon slot — instead of
 * the control itself. Applied to a field's wrapper element.
 *
 * `preventDefault` on that mousedown stops focus from bouncing off the
 * non-focusable chrome; clicks that land on the control, or on a nested
 * button/link/other input, are left untouched so caret placement, toggles and
 * projected controls keep working.
 */
@Directive({
  selector: '[dsFieldClickFocus]',
  standalone: true,
  host: {
    '(mousedown)': 'onMousedown($event)',
  },
})
export class FieldClickFocusDirective {
  private readonly host: HTMLElement = inject(ElementRef).nativeElement;

  protected onMousedown(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (
      target.closest('input, textarea, button, a, select, [contenteditable]')
    ) {
      return;
    }
    const field = this.host.querySelector<
      HTMLInputElement | HTMLTextAreaElement
    >('input, textarea');
    if (field && !field.disabled && !field.readOnly) {
      event.preventDefault();
      field.focus();
    }
  }
}
