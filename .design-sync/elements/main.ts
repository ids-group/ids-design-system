// Angular-side entry for the design-sync elements bundle: boots one zoneless
// application and registers every ds-* component as a custom element. Loading
// this module is all it takes — the React wrappers in the same bundle then
// render plain tags and the real components upgrade into them.
import { defineDsElements } from './gen/elements';

void defineDsElements();
