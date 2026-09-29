import { Directive, ElementRef, inject } from '@angular/core';

/**
 * Focuses the field's inner `input`/`textarea` when the click lands on the frame chrome
 * (padding, an icon, an addon slot). Applied to a field's wrapper element.
 *
 * `preventDefault` on that mousedown stops focus bouncing off the non-focusable chrome. Clicks
 * on the control or a nested button/link/input are left alone so caret placement and toggles work.
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
