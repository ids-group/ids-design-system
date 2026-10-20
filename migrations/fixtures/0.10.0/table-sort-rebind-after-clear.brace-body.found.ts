onSort(event: SortChangeEvent): void {
  if (event.dir === null) {
    setTimeout(() => {
      this.sortKey.set(DEFAULT_SORT_KEY);
      this.sortDirection.set('desc');
    });
    return;
  }
  this.sortKey.set(event.key);
  this.sortDirection.set(event.dir);
}
