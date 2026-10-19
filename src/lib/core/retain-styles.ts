import {
  ApplicationRef,
  EnvironmentInjector,
  Injector,
  StaticProvider,
  Type,
  createComponent,
  inject,
} from '@angular/core';

const retainedByApp = new WeakMap<ApplicationRef, Set<Type<unknown>>>();

/** Keeps a component's stylesheet in the document for the life of the app. Angular removes the sheet with the
 *  component's last instance; one hidden instance, never attached or rendered, keeps the count above zero, so
 *  showing and hiding the component inserts and removes no sheet. Call in an injection context; the first call
 *  per app and component creates the instance, later calls do nothing. `providers` satisfy what the component's
 *  constructor injects beyond the environment. */
export function retainStyles(
  component: Type<unknown>,
  providers: StaticProvider[] = [],
): void {
  const app = inject(ApplicationRef);
  let retained = retainedByApp.get(app);
  if (!retained) {
    retained = new Set();
    retainedByApp.set(app, retained);
  }
  if (retained.has(component)) {
    return;
  }
  retained.add(component);
  const holder = createComponent(component, {
    environmentInjector: inject(EnvironmentInjector),
    elementInjector:
      providers.length > 0 ? Injector.create({ providers }) : undefined,
  });
  app.onDestroy(() => holder.destroy());
}
