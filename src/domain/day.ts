// A Day is the unit of success the system tracks. It is "green" when the user
// completes the Assignment they committed to for the day. Completion lives on
// the Assignment items themselves (the `completed` flag) — there is no separate
// completions entity. See CONTEXT.md.

/** The minimal shape `isDayGreen` needs from an Assignment item. */
type CompletableItem = { completed: boolean };

/**
 * A Day is green iff every item in its Assignment is completed.
 *
 * An Assignment with no items is NOT green: there is nothing to complete, so the
 * Day stays `empty` until real work is checked in. (Without this guard an empty
 * `every` would vacuously report green.)
 */
export function isDayGreen(items: readonly CompletableItem[]): boolean {
  return items.length > 0 && items.every((item) => item.completed);
}
