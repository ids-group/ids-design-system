import {
  Component,
  ElementRef,
  ViewEncapsulation,
  afterRenderEffect,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { IconComponent } from '@ids-group-ltd/ids-design-system/icons';
import { DS_INTL } from '@ids-group-ltd/ids-design-system/core';
import type { IconName } from '@ids-group-ltd/ids-design-system/core';
import { resolveDividers } from './modal-defaults';
import type { ModalSize } from './modal.types';
import type { DsStatus } from '@ids-group-ltd/ids-design-system/core';

let nextId = 0;

function* flexItems(parent: Element): Generator<Element> {
  for (const child of parent.children) {
    if (getComputedStyle(child).display === 'contents') {
      yield* flexItems(child);
    } else {
      yield child;
    }
  }
}

@Component({
  selector: 'ds-modal-card',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './modal-card.component.html',
  styleUrl: './modal.component.scss',
  // Keeps a static `title` attribute from becoming a native tooltip on the host.
  host: { '[attr.title]': 'null' },
  encapsulation: ViewEncapsulation.Emulated,
})
export class ModalCardComponent {
  protected readonly intl = inject(DS_INTL);

  /** Card width. */
  readonly size = input<ModalSize>('md');
  /** Severity: drives the icon-badge tint, title colour, DEFAULT icon and ARIA role.
   *  Null (default) is a neutral dialog; `icon` overrides the picked icon.
   *  `false` and `undefined` land on null too, so `[status]="isDangerous && 'error'"` binds. */
  readonly status = input<DsStatus | null, DsStatus | false | null | undefined>(
    null,
    { transform: (value) => value || null },
  );
  /** Card title, shown in the header and used for `aria-labelledby`. */
  readonly title = input.required<string>();
  /** Secondary line under the title. Not part of the accessible name. */
  readonly subtitle = input<string | null>(null);
  /** Shows the header close button. */
  readonly showClose = input(true, { transform: booleanAttribute });
  /** Draws the rules under the header and over the actions; off also tightens the vertical padding.
   *  Unset falls back to `DS_CONFIG.modal.dividers`, then `true`. */
  readonly dividers = input<boolean | null, unknown>(null, {
    transform: (value) => (value == null ? null : booleanAttribute(value)),
  });
  readonly dividersResolved = resolveDividers(this.dividers);
  /** Icon badge shown next to the title. Overrides the icon `status` would pick. */
  readonly icon = input<IconName | null>(null);
  /** ARIA role. Unset, an error or warning becomes `alertdialog`; anything else stays `dialog`. */
  readonly dialogRole = input<'dialog' | 'alertdialog' | null>(null);
  /** Fires when the header close button is clicked. */
  readonly closed = output<void>();

  protected readonly titleId = `ds-modal-title-${++nextId}`;

  private readonly header =
    viewChild.required<ElementRef<HTMLElement>>('header');
  private readonly actionsRow =
    viewChild.required<ElementRef<HTMLElement>>('actions');

  constructor() {
    afterRenderEffect((onCleanup) => {
      this.stackOverflowingActions();
      let frame = 0;
      // Deferred a frame: a layout change inside a ResizeObserver callback is reported as an observer loop.
      const remeasure = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => this.stackOverflowingActions());
      };
      const observer = new ResizeObserver(remeasure);
      // The header, not the actions row: its box does not move when the row stacks.
      observer.observe(this.header().nativeElement);
      // A label change leaves every observed box unchanged; attributes stay unobserved so toggling `stacked` never loops.
      const contentObserver = new MutationObserver(remeasure);
      contentObserver.observe(this.actionsRow().nativeElement, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      onCleanup(() => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        contentObserver.disconnect();
      });
    });
  }

  // Measured unstacked: stacked, every child is full-width and its natural width is gone.
  private stackOverflowingActions(): void {
    const row = this.actionsRow().nativeElement;
    row.classList.remove('stacked');
    const styles = getComputedStyle(row);
    const available =
      row.clientWidth -
      parseFloat(styles.paddingLeft) -
      parseFloat(styles.paddingRight);
    const gap = parseFloat(styles.columnGap) || 0;
    let needed = -gap;
    for (const item of flexItems(row)) {
      needed += item.getBoundingClientRect().width + gap;
    }
    row.classList.toggle('stacked', needed > available);
  }

  protected readonly resolvedIcon = computed<IconName | null>(() => {
    const explicit = this.icon();
    if (explicit) {
      return explicit;
    }
    switch (this.status()) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warn';
      case 'success':
        return 'success';
      case 'info':
        return 'info';
      default:
        return null;
    }
  });

  protected readonly resolvedRole = computed<'dialog' | 'alertdialog'>(() => {
    const explicit = this.dialogRole();
    if (explicit) {
      return explicit;
    }
    const status = this.status();

    return status === 'error' || status === 'warning'
      ? 'alertdialog'
      : 'dialog';
  });

  protected readonly classes = computed(() => {
    const parts = ['modal', this.size()];
    const status = this.status();
    if (status) {
      parts.push(status);
    }
    if (!this.dividersResolved()) {
      parts.push('no-dividers');
    }

    return parts.join(' ');
  });

  protected onClose(): void {
    this.closed.emit();
  }
}
