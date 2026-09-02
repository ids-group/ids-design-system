// Angular-side entry for the design-sync elements bundle: boots one zoneless
// application and registers every ds-* component as a custom element. Loading
// this module is all it takes — the React wrappers in the same bundle then
// render plain tags and the real components upgrade into them.
//
// A showcase card wants the OPPOSITE half, and says so before the bundle loads:
//
//   <script>window.__dsSectionsOnly = true</script>
//   <script src="_ds_bundle.js"></script>
//
// A ds-docs section renders `<ds-checkbox>` as an ANGULAR component, so registering that same tag as
// a custom element upgrades the host a second time. See defineDsSections for the measurement.
import { defineDsElements, defineDsSections } from './gen/elements';

declare global {
  interface Window {
    __dsSectionsOnly?: boolean;
  }
}

void (window.__dsSectionsOnly ? defineDsSections() : defineDsElements());
