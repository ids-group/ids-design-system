import {
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  DS_INTL,
  DS_INTL_DEFAULTS,
} from '@ids-group-ltd/ids-design-system/core';
import { TooltipDirective } from '@ids-group-ltd/ids-design-system/components/tooltip';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';

/**
 * Text that turns into a field of the same font and size when clicked, to rename it in place. Put it
 * inside the element that gives the text its role and type, such as a heading: it inherits the font.
 * Click, Enter, Space or F2 edits; Enter or leaving the field saves, Escape cancels. A blank or
 * unchanged value saves nothing.
 */
@Component({
  selector: 'ds-inline-edit',
  standalone: true,
  imports: [IconComponent, TooltipDirective],
  templateUrl: './inline-edit.component.html',
  styleUrl: './inline-edit.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
  host: {
    '[class.editing]': 'editing()',
  },
})
export class InlineEditComponent {
  private readonly intl = inject(DS_INTL);
  private readonly injector = inject(Injector);
  private readonly field = viewChild<ElementRef<HTMLInputElement>>('field');
  private readonly display =
    viewChild<ElementRef<HTMLButtonElement>>('display');

  /** The text, two-way bound. Changes only on a save of a non-blank, different value. */
  readonly value = model<string>('');
  /** Shown, muted, while the value is empty, and in the empty field. */
  readonly placeholder = input<string>('');
  /** Longest value the field accepts, in characters; `null` for no limit. */
  readonly maxLength = input<number | null>(null);
  /** Shows the text without the edit affordance and refuses to edit. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** What the text is, such as "Chat title"; names the text and the field. Unset falls back to
   *  `DS_INTL.inlineEdit.rename`. */
  readonly ariaLabel = input<string | null>(null);

  /** The trimmed new value, after a save that changed it. */
  readonly saved = output<string>();

  protected readonly editing = signal(false);
  protected readonly announcement = signal('');
  private readonly labels = computed(() => ({
    ...DS_INTL_DEFAULTS.inlineEdit,
    ...this.intl().inlineEdit,
  }));
  protected readonly label = computed(
    () => this.ariaLabel() || this.labels().rename,
  );
  protected readonly hint = computed(() => this.labels().rename);
  protected readonly shown = computed(() => this.value() || this.placeholder());

  /** Turns the text into the field, with the text selected. Does nothing while `disabled`. */
  edit(): void {
    if (this.disabled() || this.editing()) {
      return;
    }
    this.announcement.set('');
    this.editing.set(true);
    afterNextRender(
      () => {
        const field = this.field()?.nativeElement;
        field?.focus();
        field?.select();
      },
      { injector: this.injector },
    );
  }

  protected onDisplayKeydown(event: KeyboardEvent): void {
    if (event.key === 'F2') {
      event.preventDefault();
      this.edit();
    }
  }

  protected onFieldKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      this.finish(true, true);
    } else if (event.key === 'Escape') {
      // Escape belongs to the field here, not to a dialog or panel around it.
      event.preventDefault();
      event.stopPropagation();
      this.finish(false, true);
    }
  }

  protected onFieldBlur(): void {
    this.finish(true, false);
  }

  // Leaves the field once: Enter removes it, and a removed focused field may still report a blur.
  private finish(save: boolean, returnFocus: boolean): void {
    if (!this.editing()) {
      return;
    }
    const next = (this.field()?.nativeElement.value ?? '').trim();
    this.editing.set(false);
    if (save && next !== '' && next !== this.value()) {
      this.value.set(next);
      this.saved.emit(next);
      this.announcement.set(this.labels().saved);
    }
    if (returnFocus) {
      afterNextRender(() => this.display()?.nativeElement.focus(), {
        injector: this.injector,
      });
    }
  }
}
