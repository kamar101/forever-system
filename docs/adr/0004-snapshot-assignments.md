# Assignments are snapshotted, not derived

When a Pulse resolves, the system persists the resulting Assignment as frozen
rows — each item capturing the Task's description and its Gear **as of that
moment**, plus a per-item completed flag. Assignments are NOT recomputed from live
Goals/Tasks on read. This is a deliberate denormalization: editing or deleting a
Task later must never rewrite past Days, and a Day's green status is computed from
its own snapshot. Deriving instead would build the contribution calendar and all
telemetry on mutable data, silently falsifying history whenever a Task changes.

## Consequences

- Task description and Gear are duplicated into Assignment items on purpose; do
  not normalize this away.
- A re-Pulse writes a new Assignment snapshot; the Day settles against the final
  one (carrying over completion for items still in scope).
- Past Days remain accurate regardless of later edits to Goals or Tasks.
