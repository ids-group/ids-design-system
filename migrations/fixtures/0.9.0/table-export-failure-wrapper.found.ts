readonly exportFetcher = async (): Promise<Order[]> => {
  try {
    return await firstValueFrom(this.orders.exportAll());
  } catch (error) {
    this.notifications.error('The export failed. Try again.');
    throw error;
  }
};
