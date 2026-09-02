import * as React from 'react';
import { AuthLayout, Button, Input, Checkbox } from '@ids-group-ltd/ids-design-system';

const stack: React.CSSProperties = { display: 'grid', gap: 16 };

/** The default sign-in shell: wordmark, single-letter mark, tagline, card body. */
export const SignIn = () => (
  <AuthLayout brand="Acme" logoLetter="A" tagline="Sign in to continue">
    <div style={stack}>
      <Input label="Email" type="email" value="ops@acme.example" />
      <Input label="Password" type="password" value="hunter2" />
      <Checkbox label="Keep me signed in" checked />
      <Button fullWidth>Sign in</Button>
    </div>
  </AuthLayout>
);

/** A denser card for a short form — `cardPadding` and `cardElevation` are the Card vocabulary. */
export const Compact = () => (
  <AuthLayout brand="Acme" logoLetter="A" cardPadding="sm" cardElevation="flat">
    <div style={stack}>
      <Input label="Email" type="email" placeholder="you@company.com" />
      <Button fullWidth>Send reset link</Button>
    </div>
  </AuthLayout>
);
