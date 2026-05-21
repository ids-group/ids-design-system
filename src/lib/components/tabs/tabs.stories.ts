import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TabComponent } from './tab.component';
import { TabsComponent } from './tabs.component';

const meta: Meta<TabsComponent> = {
  title: 'Components/Tabs',
  component: TabsComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-tab-fg\` — default \`var(--text-secondary)\`
- \`--ds-tab-fg-hover\` — default \`var(--text-primary)\`
- \`--ds-tab-fg-active\` — default \`var(--brand)\`
- \`--ds-tab-indicator-color\` — default \`var(--brand)\`
- \`--ds-tab-indicator-width\` — default \`var(--bw-strong)\`
- \`--ds-tab-pad-x\` — default \`var(--s-4)\`
- \`--ds-tab-pad-y\` — default \`var(--s-3)\`
- \`--ds-tabs-divider\` — default \`var(--border-divider)\`
- \`--ds-tabs-pills-bg\` — default \`var(--surface-secondary)\` (pills variant)
- \`--ds-tab-pill-bg-active\` — default \`var(--surface-default)\``,
      },
    },
  },
  decorators: [moduleMetadata({ imports: [TabComponent] })],
};
export default meta;
type Story = StoryObj<TabsComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <ds-tabs>
        <ds-tab label="Structure">Structure content</ds-tab>
        <ds-tab label="Rules">Rules content</ds-tab>
        <ds-tab label="Payout Settings">Payout settings content</ds-tab>
        <ds-tab label="History">History content</ds-tab>
      </ds-tabs>
    `,
  }),
};

export const WithCount: Story = {
  render: () => ({
    template: `
      <ds-tabs>
        <ds-tab label="All" [count]="42">All items</ds-tab>
        <ds-tab label="Active" [count]="12">Active items</ds-tab>
        <ds-tab label="Archived" [count]="30">Archived items</ds-tab>
      </ds-tabs>
    `,
  }),
};

export const Pills: Story = {
  render: () => ({
    template: `
      <ds-tabs variant="pills">
        <ds-tab label="Day">Day view</ds-tab>
        <ds-tab label="Week">Week view</ds-tab>
        <ds-tab label="Month">Month view</ds-tab>
      </ds-tabs>
    `,
  }),
};
