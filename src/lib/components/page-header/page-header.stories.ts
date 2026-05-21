import type { Meta, StoryObj } from '@storybook/angular';
import { PageHeaderComponent } from './page-header.component';
import { ButtonComponent } from '../button/button.component';
import { TabsComponent } from '../tabs/tabs.component';
import { TabComponent } from '../tabs/tab.component';

const meta: Meta<PageHeaderComponent> = {
  title: 'Components/PageHeader',
  component: PageHeaderComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-pagehdr-eyebrow-fg\` — default \`var(--text-tertiary)\`
- \`--ds-pagehdr-title-fg\` — default \`var(--text-primary)\`
- \`--ds-pagehdr-sub-fg\` — default \`var(--text-secondary)\`
- \`--ds-pagehdr-meta-fg\` — default \`var(--text-secondary)\`
- \`--ds-pagehdr-meta-icon-fg\` — default \`var(--icon-default)\`
- \`--ds-pagehdr-divider\` — default \`var(--border-divider)\``,
      },
    },
  },
  decorators: [
    (story) => ({ ...story(), moduleMetadata: { imports: [ButtonComponent, TabsComponent, TabComponent] } }),
  ],
  args: { eyebrow: '', title: 'Page title', sub: '', compact: false },
};
export default meta;
type Story = StoryObj<PageHeaderComponent>;

export const TitleOnly: Story = {
  render: (args) => ({
    props: args,
    template: `<ds-page-header [title]="title"></ds-page-header>`,
  }),
};

export const WithEyebrowSubAndActions: Story = {
  render: () => ({
    template: `
      <ds-page-header eyebrow="Commission" title="Commission Structure" sub="Configure commission hierarchy, rules, and splits for your organisation">
        <span actions>
          <ds-button variant="primary">+ Add Rule</ds-button>
        </span>
      </ds-page-header>
    `,
  }),
};

export const WithTabs: Story = {
  render: () => ({
    template: `
      <ds-page-header title="Commission Structure">
        <ds-tabs tabs>
          <ds-tab label="Structure">Structure body</ds-tab>
          <ds-tab label="Rules">Rules body</ds-tab>
          <ds-tab label="Payout Settings">Payout body</ds-tab>
          <ds-tab label="History">History body</ds-tab>
        </ds-tabs>
      </ds-page-header>
    `,
  }),
};

export const Compact: Story = { ...TitleOnly, args: { title: 'Compact title', compact: true } };
