import type { Meta, StoryObj } from '@storybook/angular';
import { ModalComponent } from './modal.component';
import { ButtonComponent } from '../button/button.component';

const meta: Meta<ModalComponent> = {
  title: 'Components/Modal',
  component: ModalComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
- \`--ds-modal-bg\` — default \`var(--surface-overlay)\`
- \`--ds-modal-radius\` — default \`var(--r-lg)\`
- \`--ds-modal-shadow\` — default \`var(--shadow-modal)\`
- \`--ds-modal-divider\` — default \`var(--border-divider)\`
- \`--ds-modal-title-fg\` — default \`var(--text-primary)\`
- \`--ds-modal-title-fg-error\` — default \`var(--error-text)\`
- \`--ds-modal-close-fg\` — default \`var(--icon-default)\`
- \`--ds-modal-close-fg-hover\` — default \`var(--icon-strong)\`
- \`--ds-modal-backdrop\` — default \`var(--surface-scrim)\``,
      },
    },
  },
  decorators: [(story) => ({ ...story(), moduleMetadata: { imports: [ButtonComponent] } })],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    danger: { control: 'boolean' },
    open: { control: 'boolean' },
  },
  args: { open: true, size: 'md', danger: false, title: 'Confirm action' },
};
export default meta;
type Story = StoryObj<ModalComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-modal [open]="open" [size]="size" [danger]="danger" [title]="title">
        <p body style="margin: 0">Are you sure you want to continue with this action?</p>
        <ng-container actions>
          <ds-button variant="ghost">Cancel</ds-button>
          <ds-button variant="primary">Confirm</ds-button>
        </ng-container>
      </ds-modal>
    `,
  }),
};

export const Danger: Story = { ...Default, args: { open: true, size: 'md', danger: true, title: 'Delete policy?' } };
export const Large: Story = { ...Default, args: { open: true, size: 'lg', danger: false, title: 'Large modal' } };
