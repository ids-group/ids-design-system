/** Pure helpers for the items feature. */

export const LOW_STOCK_THRESHOLD = 10;

/** True when an item's quantity is below the low-stock threshold. */
export function isLowStock(quantity: number): boolean {
  return quantity < LOW_STOCK_THRESHOLD;
}
