onSort(event: SortChangeEvent): void {
  if (event.dir === null) {
    this.sortKey.set(null);
    setTimeout(() => this.sortKey.set(DEFAULT_SORT_KEY));
    return;
  }
  this.sortKey.set(event.key);
  this.sortDirection.set(event.dir);
}
