import type { TableColumn } from '@ids-group-ltd/ids-design-system';

interface Policy {
  id: string;
  holder: string;
  premium: string;
  renewal: string;
}

export const policyColumns: TableColumn<Policy>[] = [
  { key: 'id', label: 'Policy' },
  { key: 'holder', label: 'Policyholder', truncate: true },
  { key: 'premium', label: 'Premium', align: 'right' },
  { key: 'renewal', label: 'Renewal', sortValue: (policy) => policy.renewal },
];

export const claimColumns = [
  { key: "reference", label: "Claim" },
  { key: "amount", label: "Amount", align: "right" },
];
