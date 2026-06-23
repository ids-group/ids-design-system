import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ConfirmService, NotificationService } from '@app/common';
import { ItemStore } from '../../../core/store/item.store';

/** UI orchestration for item actions (confirm dialogs + toasts). Route-scoped. */
@Injectable()
export class ItemActionsService {
  private readonly store = inject(ItemStore);
  private readonly notifications = inject(NotificationService);
  private readonly confirm = inject(ConfirmService);

  async deleteItem(id: string, name: string): Promise<void> {
    const confirmed = await firstValueFrom(
      this.confirm.confirm(`Delete "${name}"?`, 'Delete item'),
    );

    if (!confirmed) {
      return;
    }

    // notifyOnSuccess: success toast on isSuccess, error toast (from failure) otherwise.
    await firstValueFrom(
      this.store
        .remove(id)
        .pipe(this.notifications.notifyOnSuccess('Item deleted.')),
    );
  }
}
