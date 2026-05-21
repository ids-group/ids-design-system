import type { Meta, StoryObj } from '@storybook/angular';
import { PaginationComponent } from './pagination.component';

const meta: Meta<PaginationComponent> = {
  title: 'Components/Pagination',
  component: PaginationComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-pagination-btn-bg\` — default \`var(--surface-default)\`
- \`--ds-pagination-btn-bg-hover\` — default \`var(--surface-secondary)\`
- \`--ds-pagination-btn-fg\` — default \`var(--text-secondary)\`
- \`--ds-pagination-btn-fg-hover\` — default \`var(--text-primary)\`
- \`--ds-pagination-btn-border\` — default \`var(--border-default)\`
- \`--ds-pagination-active-bg\` — default \`var(--brand)\`
- \`--ds-pagination-active-fg\` — default \`var(--brand-on)\`
- \`--ds-pagination-radius\` — default \`var(--r-md)\``,
      },
    },
  },
  args: { total: 47, pageSize: 10, currentPage: 1, pageSizeOptions: [10, 25, 50, 100], showLabel: true },
};
export default meta;
type Story = StoryObj<PaginationComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-pagination [total]="total" [pageSize]="pageSize" [(currentPage)]="currentPage" [pageSizeOptions]="pageSizeOptions"></ds-pagination>`,
  }),
};
export const MiddlePage: Story = { ...Default, args: { ...Default.args, currentPage: 5 } };
export const LastPage: Story = { ...Default, args: { ...Default.args, currentPage: 5 } };
export const FewPages: Story = { ...Default, args: { ...Default.args, total: 25 } };
export const ManyPages: Story = { ...Default, args: { ...Default.args, total: 1000, currentPage: 50 } };
