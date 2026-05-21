import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MenuComponent } from './menu.component';
import { MenuItemComponent } from './menu-item.component';

const meta: Meta<MenuComponent> = {
  title: 'Components/Menu',
  component: MenuComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [MenuItemComponent] }),
  ],
  parameters: {
    docs: {
      description: {
        component: `Inline menu (list-style, no overlay). Compose with \`<ds-menu-item>\` children.

### Tokens (menu-item)
- \`--ds-menu-item-fg\` — default \`var(--text-primary)\` — label colour, overridden by \`.danger\``,
      },
    },
  },
};
export default meta;
type Story = StoryObj<MenuComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <ds-menu>
        <ds-menu-item icon="users">Profile settings</ds-menu-item>
        <ds-menu-item icon="settings">Preferences</ds-menu-item>
        <ds-menu-item icon="x" [danger]="true">Sign out</ds-menu-item>
      </ds-menu>
    `,
  }),
};

export const WithDisabled: Story = {
  render: () => ({
    template: `
      <ds-menu>
        <ds-menu-item icon="edit">Edit</ds-menu-item>
        <ds-menu-item icon="copy" [disabled]="true">Duplicate</ds-menu-item>
        <ds-menu-item icon="x" [danger]="true">Delete</ds-menu-item>
      </ds-menu>
    `,
  }),
};

export const TextOnly: Story = {
  render: () => ({
    template: `
      <ds-menu>
        <ds-menu-item>View</ds-menu-item>
        <ds-menu-item>Rename</ds-menu-item>
        <ds-menu-item>Archive</ds-menu-item>
      </ds-menu>
    `,
  }),
};

export const Danger: Story = {
  render: () => ({
    template: `
      <ds-menu>
        <ds-menu-item icon="x" [danger]="true">Sign out</ds-menu-item>
      </ds-menu>
    `,
  }),
};
