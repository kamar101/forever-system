# Web app, not mobile; lock-screen triage is a nice-to-have

The original PRD builds the core UX around OS-level interactive lock-screen
notifications (§3.1) on mobile. We are instead building a **web application**,
because that is what the team can actually build and maintain. As a consequence,
the "respond entirely from the lock screen with zero activation energy" flow is
demoted from the product's central premise to an optional nice-to-have. The
preferred interaction is the user opening the app and entering their state
directly. Web push may later provide nudges, but the response always happens
in-app.

## Consequences

- The daily check-in (§3.1) becomes an in-app flow, not a notification action.
- Delayed verification (§5.1) likewise happens in-app rather than via a
  notification ping the user answers from the lock screen.
- Platform-specific native notification work is out of scope.
