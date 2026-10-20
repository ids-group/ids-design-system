openSheet(): void {
  const top = this.content.nativeElement.scrollTop;
  this.sheetOpen.set(true);
  requestAnimationFrame(() => (this.content.nativeElement.scrollTop = top));
}
