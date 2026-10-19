openFilters(): void {
  document.body.style.overflow = 'hidden';
  this.filtersOpen.set(true);
}

closeFilters(): void {
  document.body.style.overflow = '';
  this.filtersOpen.set(false);
}
