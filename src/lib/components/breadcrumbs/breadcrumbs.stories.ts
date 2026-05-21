import type { Meta, StoryObj } from '@storybook/angular';
import { BreadcrumbsComponent } from './breadcrumbs.component';

const meta: Meta<BreadcrumbsComponent> = {
  title: 'Components/Breadcrumbs',
  component: BreadcrumbsComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-breadcrumbs-fg\` — default \`var(--text-tertiary)\`
- \`--ds-breadcrumbs-fg-hover\` — default \`var(--brand)\`
- \`--ds-breadcrumbs-current-fg\` — default \`var(--text-primary)\`
- \`--ds-breadcrumbs-separator-fg\` — default \`var(--icon-muted)\``,
      },
    },
  },
};
export default meta;
type Story = StoryObj<BreadcrumbsComponent>;

export const TwoLevel: Story = {
  render: () => ({
    props: { items: [{ label: 'Home', href: '/' }, { label: 'Commission Structure' }] },
    template: `<ds-breadcrumbs [items]="items"></ds-breadcrumbs>`,
  }),
};

export const ThreeLevel: Story = {
  render: () => ({
    props: { items: [{ label: 'Home', href: '/' }, { label: 'Commissions', href: '/commissions' }, { label: 'Commission Structure' }] },
    template: `<ds-breadcrumbs [items]="items"></ds-breadcrumbs>`,
  }),
};
