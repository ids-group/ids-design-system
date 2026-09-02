---
category: Page structure
---
Centred authentication shell — brand above a card, support links below. One `<main>` landmark for a sign-in, register or reset screen; nothing else on the page competes with it.

- Children are the card body: the form itself. The card takes `cardElevation` and `cardPadding` (same vocabulary as Card).
- `brand` renders a text wordmark; `logoLetter` draws a single-letter mark beside it. Project into `brand` instead when the brand is a logo element, and into `dsBrandName` for custom wordmark markup.
- `tagline` is the line under the brand — one short sentence, not a paragraph.
- `dsAuthSupport` slot holds the links under the card (help, terms, a locale switch).
- `landmark`: `'main'` (default) wraps the content in `<main>`; `'none'` when the host page already owns the landmark.

```tsx
<AuthLayout brand="Acme" logoLetter="A" tagline="Sign in to continue">
  <Input label="Email" type="email" />
  <Input label="Password" type="password" />
  <Button fullWidth>Sign in</Button>
  <span dsAuthSupport=""><a className="link" href="#">Forgot password?</a></span>
</AuthLayout>
```
