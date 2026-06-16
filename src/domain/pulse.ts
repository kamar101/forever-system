// The re-Pulse cap. A Day starts with an initial Pulse (sequence 1). If the day
// changes, the user may re-Pulse at most once (sequence 2); the Day always
// settles against this final Pulse, so an optimistic first Pulse never fails
// them. A second re-Pulse is rejected. See CONTEXT.md (Pulse) and ADR-0002.

/** The highest sequence a single Day's Pulse can reach (initial + one re-Pulse). */
const MAX_PULSE_SEQUENCE = 2;

/**
 * Given the current Pulse's sequence for the Day (or null if none has been
 * taken yet), return the sequence the next Pulse should carry — or null when
 * the re-Pulse cap is already reached and a further Pulse must be rejected.
 */
export function nextPulseSequence(currentSequence: number | null): number | null {
  if (currentSequence === null) return 1;
  if (currentSequence >= MAX_PULSE_SEQUENCE) return null;
  return currentSequence + 1;
}
