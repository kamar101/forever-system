# Forever System

A web application that keeps a user making progress toward long-term goals by
adapting each day's expectation to the user's current capacity, so that no day
is ever a "zero day."

## Language

**Vault**:
The unbounded collection of everything the user might ever pursue. Items sit
dormant here until activated.
_Avoid_: backlog, wishlist

**Life Area**:
A category that groups goals (e.g. "Language Learning", "Professional
Certifications"). Organizational only.
_Avoid_: category, bucket, domain

**Goal**:
A single long-term pursuit within a Life Area (e.g. "Complete a Udemy course").
Lives in the Vault until activated. A Goal contains Tasks and owns a Playbook.
_Avoid_: ambition, project, habit

**Task**:
The atomic unit of work — a concrete, doable thing that moves a Goal forward
(e.g. "watch 30 min of the course", "practice for 10 min"). Tasks are nested
within a Goal, and each Task carries a Gear (effort level). Tasks are what
ultimately fill an Assignment.
_Avoid_: action, item, step

**Active Goal**:
A Goal the user has currently activated. The system caps these at 3–5 at a time
to prevent overload; all other goals stay dormant in the Vault. Active Goals
carry a user-set priority ranking; as Capacity drops, the Assignment's breadth
peels goals off from the bottom of that ranking (Worst day = only the
top-ranked Goal survives).
_Avoid_: focus

**Gear**:
An effort level (1–4) carried by a Task, from Gear 4 (best day, most effort) to
Gear 1 (worst day, the safety-net minimum). A Goal's "Gear N" is the pool of its
Tasks tagged at that effort level. Capacity maps 1:1 to a Gear, selecting the
day's effort level.
_Avoid_: tier, mode

**Pulse**:
The user-initiated act of declaring "this is my Capacity, what should I do?",
taken whenever the user is ready to start working — not on a fixed schedule. A
Pulse sets the Capacity for the Day and produces the Assignment. The user may
re-Pulse at most once per Day if the day changes after committing; the Day always
settles against the final Pulse.
_Avoid_: check-in, triage, state report

**Capacity**:
The user's self-reported ability to act on a given day, chosen from Good /
Average / Bad / Worst. Maps 1:1 to a Gear (Good → Gear 4 … Worst → Gear 1).
Capacity is the single dial that sets both the Gear (intensity) of the day's work
and how many Active Goals the Assignment reaches into (breadth). Resettable via
re-Pulse.
_Avoid_: state, mood, condition

**Playbook**:
The user-established selection rule that decides which Task(s) to pull for a Goal
given the day's Gear. Each Goal owns its Playbook. The cross-goal breadth (how
many Goals are included) is a separate system-level rule driven by Capacity and
the goal priority ranking.
_Avoid_: flowchart, ruleset, recipe

**Assignment**:
The single bundle of Tasks the user must do on a given Day, combined across the
included Goals. There is exactly one Assignment per Day. Capacity determines how
many Goals it spans (a Good day spans all Active Goals, the lowest-capacity day
spans exactly one — the top-ranked Goal), and each included Goal's Playbook picks
which of its Tasks go in.
_Avoid_: action, directive, instruction

**Check-in**:
The user's after-the-fact confirmation of whether the Assignment was done. Happens
after the Assignment, not at the start of the day.
_Avoid_: verification, completion ping

**Day**:
The unit of success the system tracks. A Day is "green" when the user completes
the Assignment for the Capacity they committed to — regardless of which or how
many goals it touched. If the day turns out harder than expected, the user
re-Pulses downward and the bar lowers honestly rather than failing them.
Per-goal progress is a separate, secondary view.
_Avoid_: streak, entry
