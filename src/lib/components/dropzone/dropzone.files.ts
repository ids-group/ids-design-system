/** The native `multiple` attribute constrains the PICKER and nothing else: a drag of several
 *  files reaches the element whatever it is set to, so the count is enforced here instead.
 *
 *  @internal */
export function filesToAdd(
  list: readonly File[],
  multiple: boolean,
): readonly File[] {
  if (!list.length) {
    return [];
  }

  return multiple ? [...list] : list.slice(0, 1);
}
