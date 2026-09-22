/** What a drop or a pick contributes, given the dropzone's file count.
 *
 *  The native `multiple` attribute constrains the PICKER and nothing else: a drag of several
 *  files reaches the element whatever it is set to. Both ways in run through here so the count
 *  means the same thing for each.
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
