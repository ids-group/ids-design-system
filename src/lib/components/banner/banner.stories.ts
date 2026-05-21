import type { Meta, StoryObj } from '@storybook/angular';
import { BannerComponent } from './banner.component';

const meta: Meta<BannerComponent> = {
  title: 'Components/Banner',
  component: BannerComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-banner-bg\` — default \`var(--info-subtle)\`
- \`--ds-banner-fg\` — default \`var(--info-text)\`
- \`--ds-banner-bar\` — default \`var(--info)\`
- \`--ds-banner-border\` — default \`var(--info-border)\`
- \`--ds-banner-title-fg\` — default \`var(--text-primary)\`
- \`--ds-banner-close-fg\` — default \`var(--icon-default)\`
- \`--ds-banner-close-fg-hover\` — default \`var(--icon-strong)\`
- \`--ds-banner-radius\` — default \`var(--r-md)\`
- \`--ds-banner-bar-width\` — default \`var(--banner-bar-w)\`
Severity modifiers (\`.success/.warning/.severe/.error\`) override \`--ds-banner-bg/-fg/-bar/-border\`.`,
      },
    },
  },
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'warning', 'severe', 'error'] },
    title: { control: 'text' },
    dismissible: { control: 'boolean' },
  },
  args: { variant: 'info', title: 'Heads up', dismissible: false },
};
export default meta;
type Story = StoryObj<BannerComponent>;

const renderBanner: Story['render'] = (args) => ({
  props: args,
  template: `
    <ds-banner [variant]="variant" [title]="title" [dismissible]="dismissible">
      Something noteworthy happened. Here is some descriptive body text.
    </ds-banner>
  `,
});

export const Info: Story = { render: renderBanner };
export const Success: Story = { render: renderBanner, args: { variant: 'success', title: 'Saved', dismissible: false } };
export const Warning: Story = { render: renderBanner, args: { variant: 'warning', title: 'Heads up', dismissible: false } };
export const Severe: Story = { render: renderBanner, args: { variant: 'severe', title: 'Action required', dismissible: false } };
export const Error: Story = { render: renderBanner, args: { variant: 'error', title: 'Something went wrong', dismissible: false } };
export const Dismissible: Story = { render: renderBanner, args: { variant: 'info', title: 'Closable', dismissible: true } };
