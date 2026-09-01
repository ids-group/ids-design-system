import * as React from 'react';

export interface DsHostProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Binds React props onto a custom element instance. Everything an Angular
 * component exposes arrives as a DOM property, never an attribute — attributes
 * stringify, so an array of table rows would land as "[object Object]" — and
 * outputs arrive as CustomEvents named exactly after the output.
 *
 * The listener is attached in a layout effect and the property writes happen in
 * the same pass, so the element sees its inputs before Angular's first change
 * detection for that view.
 */
export function useDsElement<Props extends object>(
  tag: string,
  componentProps: Props,
  forwarded: React.ForwardedRef<HTMLElement>,
  inputNames: readonly string[],
  events: ReadonlyArray<readonly [string, string]>,
): React.ReactElement {
  // Each generated wrapper passes its own `<Name>Props`, which has no index
  // signature — so the parameter is generic and indexed through one cast here
  // rather than widened at 85 call sites.
  const props = componentProps as Record<string, unknown>;
  const ref = React.useRef<HTMLElement | null>(null);
  const { children, className, style } = componentProps as DsHostProps;

  React.useImperativeHandle(forwarded, () => ref.current as HTMLElement);

  const inputValues = inputNames.map((name) => props[name]);
  React.useLayoutEffect(() => {
    let cancelled = false;
    const assign = () => {
      const element = ref.current as (Record<string, unknown> & HTMLElement) | null;
      if (cancelled || !element) return;
      for (const name of inputNames) {
        if (props[name] !== undefined) element[name] = props[name];
      }
    };

    // Writing a property before the element upgrades creates an OWN property
    // that permanently shadows the prototype setter Angular installs, so the
    // input would never reach the component. Registration resolves a microtask
    // after createApplication(), so this race is the normal case, not an edge.
    if (customElements.get(tag)) assign();
    else void customElements.whenDefined(tag).then(assign);

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, inputValues);

  const handlers = events.map(([, propName]) => props[propName]);
  React.useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const attached: Array<[string, EventListener]> = [];
    for (const [eventName, propName] of events) {
      const handler = props[propName] as ((value: unknown) => void) | undefined;
      if (!handler) continue;
      const listener: EventListener = (event) => handler((event as CustomEvent).detail);
      element.addEventListener(eventName, listener);
      attached.push([eventName, listener]);
    }

    return () => {
      for (const [eventName, listener] of attached) element.removeEventListener(eventName, listener);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, handlers);

  // React 19+ assigns unknown props on custom elements as PROPERTIES while the
  // element is still detached, which is the only moment that matters for a
  // component whose content-projection slots sit inside an `@if`: Angular claims
  // the light DOM when it creates the view in connectedCallback, so an input
  // that arrives afterwards (React 18's only option — a ref effect) renders the
  // conditional branch with the children already discarded. On 18 we still fall
  // back to effect-only assignment; objects would stringify as attributes there.
  const hostProps: Record<string, unknown> = { ref, class: className, style };
  if (SETS_PROPERTIES_ON_CUSTOM_ELEMENTS) {
    for (const name of inputNames) {
      if (props[name] !== undefined) hostProps[name] = props[name];
    }
  }

  return React.createElement(tag, hostProps, children);
}

const SETS_PROPERTIES_ON_CUSTOM_ELEMENTS = Number.parseInt(React.version, 10) >= 19;
