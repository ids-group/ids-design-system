import type { TableColumn } from '@ids-group-ltd/ids-design-system';

interface Policy {
  id: string;
  holder: string;
  premium: string;
}

export const policyColumns: TableColumn<Policy>[] = [
  { key: 'id', label: 'Policy' },
  { key: 'holder', label: 'Policyholder', truncate: true },
  { key: 'premium', label: 'Premium', align: 'right' },
];
