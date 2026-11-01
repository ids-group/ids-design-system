import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import {
  DS_INTL,
  DS_INTL_DEFAULTS,
} from '@ids-group-ltd/ids-design-system/core';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system/components/button';
import { TextareaComponent } from '@ids-group-ltd/ids-design-system/components/textarea';
import { FieldClickFocusDirective } from '@ids-group-ltd/ids-design-system/components';
import type { ComposerLayout } from './composer.types';

/**
 * Message box for a chat or an instruction: an auto-growing text area with chips above it, actions
 * on the left of a bottom bar and a send button on the right. Enter submits, Shift+Enter breaks the
 * line. Slots: `[chips]`, `[actions]`, `[send]` (replaces the default send button).
 */
@Component({
  selector: 'ds-composer',
  standalone: true,
  imports: [TextareaComponent, ButtonComponent, FieldClickFocusDirective],
  templateUrl: './composer.component.html',
  styleUrl: './composer.component.scss',
  encapsulation: ViewEncapsulation.Emulated,
})
export class ComposerComponent {
  private readonly intl = inject(DS_INTL);
  private readonly textarea = viewChild.required(TextareaComponent);

  /** Message text, two-way bound. Not cleared on submit: clear it once the message is accepted. */
  readonly value = model<string>('');
  /** Placeholder shown when empty. */
  readonly placeholder = input<string>('');
  /** Accessible name of the text area; unset falls back to `DS_INTL.composer.label`. */
  readonly ariaLabel = input<string | null>(null);
  /** Height in lines the text area starts at. */
  readonly minRows = input<number>(1);
  /** Height in lines the text area grows to before it scrolls. */
  readonly maxRows = input<number>(8);
  /** Disables the text area and the send button. Projected controls are the consumer's to disable. */
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Work in flight: the send button keeps its place, shows a spinner and refuses to submit, and
   *  Enter does not submit. The text area stays editable. */
  readonly busy = input(false, { transform: booleanAttribute });
  /** The current step while `busy`, such as "Rebuilding"; where it shows follows `layout`. */
  readonly busyLabel = input<string>('');
  /** Where the buttons and the step text sit. `'status-bar'`: buttons inside, the step text in the
   *  bar beside a fixed-size send button. `'status-above'`: the step text on a line above the box.
   *  `'labelled'`: the send button carries "Send" or the step, at one minimum width. `'outside'`:
   *  the buttons to the right of the box, the step text above it. */
  readonly layout = input<ComposerLayout>('status-bar');

  /** The trimmed text, on Enter or the send button. Never fires for blank text, while `busy` or
   *  while `disabled`. */
  readonly submitted = output<string>();
  /** Image files pasted into the text area. The paste inserts no text when it carries images. */
  readonly filesPasted = output<File[]>();

  /** True when Enter or the send button would submit; bind it in a `[send]` slot. */
  readonly canSubmit = computed(
    () => !this.disabled() && !this.busy() && this.value().trim() !== '',
  );

  private readonly labels = computed(() => ({
    ...DS_INTL_DEFAULTS.composer,
    ...this.intl().composer,
  }));
  protected readonly textareaLabel = computed(
    () => this.ariaLabel() || this.labels().label,
  );
  protected readonly sendLabel = computed(() => this.labels().send);
  protected readonly labelled = computed(() => this.layout() === 'labelled');
  protected readonly statusAbove = computed(
    () => this.layout() === 'status-above' || this.layout() === 'outside',
  );
  protected readonly statusText = computed(() =>
    this.busy() ? this.busyLabel() : '',
  );

  /** Emits `submitted` when `canSubmit`; for a send button rendered in the `[send]` slot. */
  submit(): void {
    if (this.canSubmit()) {
      this.submitted.emit(this.value().trim());
    }
  }

  /** Moves keyboard focus to the text area. */
  focus(options?: FocusOptions): void {
    this.textarea().focus(options);
  }

  protected onKeydown(event: KeyboardEvent): void {
    // keyCode 229 is the IME key Safari sends after compositionend, with isComposing already false.
    if (
      event.key !== 'Enter' ||
      event.shiftKey ||
      event.isComposing ||
      event.keyCode === 229
    ) {
      return;
    }
    event.preventDefault();
    this.submit();
  }

  protected onPaste(event: ClipboardEvent): void {
    const images = Array.from(event.clipboardData?.files ?? []).filter((file) =>
      file.type.startsWith('image/'),
    );
    if (images.length) {
      event.preventDefault();
      this.filesPasted.emit(images);
    }
  }
}
