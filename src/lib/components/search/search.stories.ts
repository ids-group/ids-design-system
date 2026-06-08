import type { Meta, StoryObj } from '@storybook/angular';
import { SearchComponent } from './search.component';

const meta: Meta<SearchComponent> = {
  title: 'Components/Search',
  component: SearchComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-search-bg\` — default \`var(--surface-secondary)\`
- \`--ds-search-bg-focus\` — default \`var(--surface-default)\`
- \`--ds-search-border\` — default \`transparent\`
- \`--ds-search-border-hover\` — default \`var(--border-default)\`
- \`--ds-search-border-focus\` — default \`var(--primary)\`
- \`--ds-search-focus-shadow\` — default \`var(--focus-field)\`
- \`--ds-search-fg\` — default \`var(--text-primary)\`
- \`--ds-search-placeholder\` — default \`var(--text-tertiary)\`
- \`--ds-search-radius\` — default \`var(--r-md)\`
- \`--ds-search-height\` — default \`var(--search-h)\``,
      },
    },
  },
  argTypes: {
    placeholder: { control: 'text' },
    shortcut: { control: 'text' },
  },
  args: { placeholder: 'Search', shortcut: '', value: '' },
};
export default meta;
type Story = StoryObj<SearchComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `<div style="max-width:320px"><ds-search [(value)]="value" [placeholder]="placeholder" [shortcut]="shortcut"></ds-search></div>`,
  }),
};
export const WithShortcut: Story = { ...Default, args: { ...Default.args, shortcut: '⌘K' } };
export const WithValue: Story = { ...Default, args: { ...Default.args, value: 'health insurance' } };
