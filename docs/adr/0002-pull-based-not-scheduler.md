# The system is pull-based (user-initiated), not a scheduler

The original brain-dump assumes the system pushes a check-in notification at a
user-defined time (§3.1). We are instead making the system **pull-based**: the
user initiates a **Pulse** whenever they are ready to work ("this is my Capacity,
what should I do?"), and the system responds with the day's Assignment. The
system never pushes a scheduled "how's your day?" prompt. This respects user
agency, avoids the "nagging app" feel, and means the MVP needs no scheduler or
notification backend.

## Considered Options

- **Scheduled push (rejected):** the system pings the user at a set time. Drives
  engagement, but requires scheduling/notification infrastructure and reintroduces
  the pressure the product is trying to remove.
- **Pull-based (chosen):** the user shows up when ready and declares Capacity.

## Consequences

- No scheduler/notification backend is required for the MVP.
- To prevent gaming the bar, a user may re-Pulse **at most once per Day**; the Day
  settles against the final Pulse.
- Web push, if added later, is a re-engagement nudge only — the response still
  happens via a user-initiated Pulse in the app.
