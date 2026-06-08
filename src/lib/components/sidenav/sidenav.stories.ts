import type { Meta, StoryObj } from '@storybook/angular';
import { SidenavComponent } from './sidenav.component';
import { SidenavGroupComponent } from './sidenav-group.component';
import { SidenavItemComponent } from './sidenav-item.component';

const meta: Meta<SidenavComponent> = {
  title: 'Components/Sidenav',
  component: SidenavComponent,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: `### Tokens
Sidenav host:
- \`--ds-sidenav-bg\` — default \`var(--surface-default)\`
- \`--ds-sidenav-border\` — default \`var(--border-divider)\`
- \`--ds-sidenav-width\` — default \`var(--sidenav-w)\`
- \`--ds-sidenav-width-collapsed\` — default \`var(--sidenav-w-collapsed)\`
- \`--ds-sidenav-mark-bg\` — default \`var(--primary)\`
- \`--ds-sidenav-mark-fg\` — default \`var(--primary-on)\`

Item (\`<ds-sidenav-item>\`):
- \`--ds-sidenav-item-fg\` — default \`var(--text-secondary)\`
- \`--ds-sidenav-item-fg-hover\` — default \`var(--text-primary)\`
- \`--ds-sidenav-item-bg-hover\` — default \`var(--surface-secondary)\`
- \`--ds-sidenav-item-bg-active\` — default \`var(--primary-subtle)\`
- \`--ds-sidenav-item-fg-active\` — default \`var(--primary-strong)\`
- \`--ds-sidenav-item-radius\` — default \`var(--r-md)\`
- \`--ds-sidenav-alert-color\` — default \`var(--error)\`

Group label (\`<ds-sidenav-group>\`):
- \`--ds-sidenav-group-fg\` — default \`var(--text-tertiary)\``,
      },
    },
  },
  decorators: [
    (story) => ({
      ...story(),
      moduleMetadata: { imports: [SidenavGroupComponent, SidenavItemComponent] },
    }),
  ],
  args: { collapsed: false, brand: 'ManageMy' },
};
export default meta;
type Story = StoryObj<SidenavComponent>;

export const Expanded: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ds-sidenav [collapsed]="collapsed" [brand]="brand">
        <ds-sidenav-group>
          <ds-sidenav-item icon="home" label="Overview"></ds-sidenav-item>
          <ds-sidenav-item icon="users" label="Employers"></ds-sidenav-item>
          <ds-sidenav-item icon="file" label="Quotes" [badge]="3"></ds-sidenav-item>
          <ds-sidenav-item icon="chart" label="Commission" [active]="true"></ds-sidenav-item>
          <ds-sidenav-item icon="package" label="Carriers"></ds-sidenav-item>
          <ds-sidenav-item icon="sparkle" label="Campaigns" [hasAlert]="true"></ds-sidenav-item>
          <ds-sidenav-item icon="settings" label="Settings"></ds-sidenav-item>
        </ds-sidenav-group>
      </ds-sidenav>
    `,
  }),
};

export const Collapsed: Story = { ...Expanded, args: { collapsed: true, brand: 'ManageMy' } };
