# Signal Forms - error text comes from the validator

A field knows it is invalid, but only your validator knows what to say. Without a message the field turns red with no words — deliberately, since the alternative is the library inventing copy for your domain. Two ways to supply it: per rule, as required(path.email, { message: '…' }), or once per app for the built-in kinds:

In dev, a field that is invalid with no resolvable message logs a warning naming the error kinds it could not resolve, so this fails loudly rather than silently.
