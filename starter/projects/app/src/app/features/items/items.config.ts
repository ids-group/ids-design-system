import { FeatureConfig } from '../../core/store/helpers';

export const ITEMS_CONFIG: FeatureConfig = {
  defaultPageSize: 10,
  rowsPerPageOptions: [10, 25, 50],
  defaultSortField: 'name',
  defaultSortOrder: 'Asc',
};
