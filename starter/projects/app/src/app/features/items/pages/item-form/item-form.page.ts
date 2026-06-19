import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ButtonComponent, InputComponent } from '@ids-group-ltd/ids-design-system';
import { HasUnsavedChanges } from '@app/common';
import { ItemStore } from '../../../../core/store/item.store';
import { EMPTY_ITEM_FORM, ItemFormModel } from '../../models';

interface FormSnapshot {
  name: string;
  category: string;
  quantity: string;
}

@Component({
  selector: 'app-item-form-page',
  imports: [InputComponent, ButtonComponent],
  templateUrl: './item-form.page.html',
  styleUrl: './item-form.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemFormPage implements OnInit, HasUnsavedChanges {
  private readonly store = inject(ItemStore);
  private readonly router = inject(Router);

  /** Route param `:id` (bound via withComponentInputBinding); empty for "new". */
  readonly id = input<string>('');

  protected readonly name = signal('');
  protected readonly category = signal('');
  protected readonly quantity = signal('1');
  protected readonly saving = signal(false);

  protected readonly isEdit = computed(() => !!this.id());

  private readonly original = signal<FormSnapshot>({
    name: EMPTY_ITEM_FORM.name,
    category: EMPTY_ITEM_FORM.category,
    quantity: String(EMPTY_ITEM_FORM.quantity),
  });

  ngOnInit(): void {
    if (!this.id()) {
      return;
    }

    void firstValueFrom(this.store.loadForEdit(this.id())).then((result) => {
      if (result.isSuccess && result.data) {
        this.setForm(result.data);
      }
    });
  }

  hasUnsavedChanges(): boolean {
    if (this.saving()) {
      return false;
    }

    const snapshot = this.original();

    return (
      this.name() !== snapshot.name ||
      this.category() !== snapshot.category ||
      this.quantity() !== snapshot.quantity
    );
  }

  async save(event: Event): Promise<void> {
    event.preventDefault();
    this.saving.set(true);

    const form: ItemFormModel = {
      name: this.name(),
      category: this.category(),
      quantity: Number(this.quantity()) || 0,
    };

    const result = this.id()
      ? await firstValueFrom(this.store.update(this.id(), form))
      : await firstValueFrom(this.store.create(form));

    this.saving.set(false);

    if (result.isSuccess) {
      this.router.navigate(['/items']);
    }
  }

  cancel(): void {
    this.router.navigate(['/items']);
  }

  private setForm(form: ItemFormModel): void {
    this.name.set(form.name);
    this.category.set(form.category);
    this.quantity.set(String(form.quantity));
    this.original.set({
      name: form.name,
      category: form.category,
      quantity: String(form.quantity),
    });
  }
}
