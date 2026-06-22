/** API wire shape. */
export interface ItemDto {
  id: string;
  name: string;
  category: string;
  quantity: number;
}

/** Form state shape (no id — that's route/context). */
export interface ItemFormModel {
  name: string;
  category: string;
  quantity: number;
}

/** Projected list-row shape. */
export interface ItemListItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
}

export const EMPTY_ITEM_FORM: ItemFormModel = {
  name: '',
  category: '',
  quantity: 1,
};

export function dtoToListItem(dto: ItemDto): ItemListItem {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    quantity: dto.quantity,
  };
}

export function dtoToFormModel(dto: ItemDto): ItemFormModel {
  return { name: dto.name, category: dto.category, quantity: dto.quantity };
}
