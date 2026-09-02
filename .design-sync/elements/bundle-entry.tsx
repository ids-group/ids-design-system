// The design-sync bundle contract: one IIFE assigning every export to
// window.IdsDs. Pulling in the Angular build is what makes the difference from
// the React-port approach — the components the design agent renders ARE the
// shipped Angular components, upgraded into the wrapper's tags.
//
// The namespace is re-exported rather than imported for side effects only: the
// repo's package.json declares `"sideEffects": false`, which lets a bundler drop
// a bare `import './…'` and silently ship wrappers with nothing to upgrade them.
import * as angularElements from './dist/browser/main.js';

export const __angularElements = angularElements;
export * from './gen';
