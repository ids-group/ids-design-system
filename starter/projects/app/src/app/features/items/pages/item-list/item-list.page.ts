import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@ids-group-ltd/ids-design-system';
import { ItemStore } from '../../../../core/store/item.store';
import { ItemActionsService } from '../../services/item-actions.service';
import { ItemListItem } from '../../models';

@Component({
  selector: 'app-item-list-page',
  imports: [RouterLink, ButtonComponent],
  templateUrl: './item-list.page.html',
  styleUrl: './item-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemListPage implements OnInit {
  private readonly store = inject(ItemStore);
  private readonly actions = inject(ItemActionsService);

  protected readonly items = this.store.items;
  protected readonly loading = this.store.listLoading;

  ngOnInit(): void {
    this.store.loadList();
  }

  protected remove(item: ItemListItem): void {
    void this.actions.deleteItem(item.id, item.name);
  }
}
