import type { Meta, StoryObj } from '@storybook/angular';
import { TableComponent } from './table.component';
import type { TableColumn } from './table.types';

interface Rule {
  id: string;
  product: string;
  tier: string;
  rate: string;
  payType: string;
  status: string;
}

const RULES: Rule[] = [
  { id: '1', product: 'Hospital Indemnity', tier: 'Tier 1', rate: '15%', payType: 'Initial', status: 'Active' },
  { id: '2', product: 'Critical Illness', tier: 'Tier 2', rate: '12%', payType: 'Initial', status: 'Active' },
  { id: '3', product: 'Accident', tier: 'Tier 1', rate: '10%', payType: 'Renewal', status: 'Active' },
  { id: '4', product: 'Disability — Short Term', tier: 'Tier 3', rate: '8%', payType: 'Initial', status: 'Draft' },
  { id: '5', product: 'Life — Term', tier: 'Tier 1', rate: '18%', payType: 'Initial', status: 'Active' },
];

const COLUMNS: TableColumn<Rule>[] = [
  { key: 'product', label: 'Product', sortable: true },
  { key: 'tier', label: 'Tier', sortable: true },
  { key: 'rate', label: 'Rate', sortable: true, align: 'right' },
  { key: 'payType', label: 'Pay Type' },
  { key: 'status', label: 'Status' },
];

const meta: Meta<TableComponent<Rule>> = {
  title: 'Components/Table',
  component: TableComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-table-bg\` — default \`var(--surface-default)\`
- \`--ds-table-row-hover-bg\` — default \`var(--surface-secondary)\`
- \`--ds-table-row-selected-bg\` — default \`var(--brand-subtle)\`
- \`--ds-table-head-bg\` — default \`var(--surface-secondary)\`
- \`--ds-table-head-fg\` — default \`var(--text-tertiary)\`
- \`--ds-table-divider\` — default \`var(--border-divider)\`
- \`--ds-table-sort-active-fg\` — default \`var(--brand)\`
- \`--ds-table-cell-pad-x\` — default \`var(--table-cell-pad-x)\`
- \`--ds-table-cell-pad-y\` — default \`var(--table-cell-pad-y)\`
- \`--ds-table-radius\` — default \`var(--r-xl)\``,
      },
    },
  },
  args: {
    data: RULES,
    columns: COLUMNS,
    selectable: false,
    loading: false,
    stickyHeader: true,
    skeletonRows: 5,
  },
};
export default meta;
type Story = StoryObj<TableComponent<Rule>>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-table [data]="data" [columns]="columns" [selectable]="selectable" [loading]="loading"></ds-table>`,
  }),
};

export const Selectable: Story = {
  ...Default,
  args: { ...Default.args, selectable: true },
};

export const Loading: Story = {
  ...Default,
  args: { ...Default.args, loading: true, data: [] },
};

export const Empty: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-table [data]="data" [columns]="columns"><div empty>No commission rules yet. Add one to get started.</div></ds-table>`,
  }),
  args: { ...Default.args, data: [] },
};
