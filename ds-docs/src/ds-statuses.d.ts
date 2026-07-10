// ds-docs registers its demo status vocabulary so <ds-badge status="…"> autocompletes.
// (External consumers augment '@ids-group-ltd/ids-design-system' instead.)
import 'ds';

declare module 'ds' {
  interface DsStatusRegistry {
    planning: true;
    confirmed: true;
    active: true;
    completed: true;
    info: true;
    success: true;
    warning: true;
    error: true;
    neutral: true;
  }
}
