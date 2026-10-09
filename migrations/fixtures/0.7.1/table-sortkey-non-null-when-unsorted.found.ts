export const query = {
  page: store.page(),
  sorting: store.sortKey()
    ? { path: store.sortKey()!, order: store.sortDir() ?? 'Asc' }
    : undefined,
};
