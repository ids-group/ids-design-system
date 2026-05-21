import type { Meta, StoryObj } from '@storybook/angular';
import { TopBarComponent } from './topbar.component';
import { ButtonComponent } from '../button/button.component';
import { SearchComponent } from '../search/search.component';
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component';

const meta: Meta<TopBarComponent> = {
  title: 'Components/TopBar',
  component: TopBarComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-topbar-bg\` — default \`var(--surface-default)\`
- \`--ds-topbar-border\` — default \`var(--border-divider)\`
- \`--ds-topbar-height\` — default \`var(--topbar-h)\`
- \`--ds-topbar-action-fg\` — default \`var(--icon-default)\`
- \`--ds-topbar-action-fg-hover\` — default \`var(--icon-strong)\`
- \`--ds-topbar-action-bg-hover\` — default \`var(--surface-secondary)\`
- \`--ds-topbar-title-fg\` — default \`var(--text-primary)\`
- \`--ds-topbar-ping-color\` — default \`var(--danger)\``,
      },
    },
  },
  decorators: [
    (story) => ({ ...story(), moduleMetadata: { imports: [ButtonComponent, SearchComponent, BreadcrumbsComponent] } }),
  ],
};
export default meta;
type Story = StoryObj<TopBarComponent>;

export const TitleOnly: Story = {
  render: () => ({
    template: `<ds-topbar><span title class="t-m-bold">Commission Structure</span></ds-topbar>`,
  }),
};

export const WithSearchAndActions: Story = {
  render: () => ({
    template: `
      <ds-topbar>
        <span title class="t-m-bold">Commission Structure</span>
        <ds-search search [placeholder]="'Search'"></ds-search>
        <span actions>
          <ds-button variant="primary" size="m">+ Add Rule</ds-button>
        </span>
      </ds-topbar>
    `,
  }),
};

export const WithBreadcrumbs: Story = {
  render: () => ({
    props: { items: [{ label: 'Commissions', href: '/commissions' }, { label: 'Commission Structure' }] },
    template: `
      <ds-topbar>
        <ds-breadcrumbs title [items]="items"></ds-breadcrumbs>
        <span actions>
          <ds-button variant="primary" size="m">+ Add Rule</ds-button>
        </span>
      </ds-topbar>
    `,
  }),
};
