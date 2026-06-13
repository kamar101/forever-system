# Product Requirements Document
**Project:** The Forever System (GearBox Architecture)
**Status:** Comprehensive Specification | Draft v1.0

---

## 1. Executive Summary & Core Philosophy
The "Forever System" is a behavioral orchestration application designed to eliminate the reliance on willpower, motivation, and perfect conditions. Traditional habit trackers are brittle; they demand users to conform to rigid schedules and break completely when life intervenes. This application flips the paradigm: it acts as an intelligent orchestration layer that adapts dynamically to the user's daily capacity.

Drawing on principles of engineering failure mode analysis and automated incident response, the system treats the user's life as a stream of states. By mapping a user's current capacity (energy, time, mood) to pre-defined "Gears" (levels of effort), the system ensures that a user never experiences a "Zero Day." It gracefully degrades expectations to maintain consistency, ensuring mathematical progress toward overarching goals through a frictionless, AI-driven interface.

---

## 2. System Architecture: The Semantic Playbook Engine
The application relies on "Semantic Playbooks" rather than rigid code or static alerts. While the backend logic mirrors the conditional routing of enterprise automation (if/then, variables, branching), the frontend is entirely natural language. The AI serves as both the compiler and the execution environment.

### 2.1 Life Areas & The Vault
*   **The Vault:** Users can dump an unlimited number of ambitions, goals, and interests into the system. These are categorized into "Life Areas" (e.g., Language Learning, Professional Certifications, Career Transition).
*   **Active Execution Limit:** To prevent cognitive overload, the system forces the user to select only 3 to 5 Active Goals at a given time. For example, a user might prioritize studying for a CISSP exam, learning Spanish, and executing a professional consulting pivot. All other goals remain safely in the Vault for future activation.

### 2.2 The 4-Gear Contingency Framework
For each active goal, the system automatically generates a 4-tiered execution plan (The Gears) during onboarding. This prevents the "single point of failure" common in habit formation.

| Gear Level | State Description | Execution Example (e.g., CISSP Prep) |
| :--- | :--- | :--- |
| **Gear 4** (Best Day) | High energy, perfect conditions, ample time. | Take a full 50-question practice exam and review missed concepts in technical documentation. |
| **Gear 3** (Average Day) | Normal baseline. Standard workday fatigue. | Read 2 pages of the study guide or watch a 15-minute concept video. |
| **Gear 2** (Bad Day) | Unexpected friction (e.g., traffic, late meetings, poor sleep). | Listen to an audiobook chapter while driving or cooking dinner. |
| **Gear 1** (Worst Day) | Absolute exhaustion, zero willpower. The safety net. | Open a mobile app and do exactly 5 flashcards from bed. |

### 2.3 Visual Node Playbooks (The Mind Map)
Users can view their playbooks not as lines of code, but as a clean, text-based flowchart. Editing the playbook requires zero technical skill; the user simply prompts the AI with natural language (e.g., *"Actually, let's change my Gear 2 action to just reviewing my notes."*), and the AI dynamically rewires the flowchart nodes.

---

## 3. User Experience (UX): Frictionless Execution
The success of the app hinges on requiring near-zero "activation energy" from the user, especially when they are in a Gear 1 state.

### 3.1 OS-Level Lock Screen Triage
The system utilizes interactive push notifications to parse the user's state without requiring them to unlock their phone or open the app.
*   **The Trigger:** At a user-defined check-in time (e.g., end of the workday), the system sends a notification: *"How is the day going?"*
*   **Interactive Buttons:** The notification contains native OS buttons: `[Good]` `[Average]` `[Bad]` `[Worst]` `[🎙️ Record Diary]`.
*   **Instant Routing:** If the user selects `[Worst]`, the app instantly pushes a secondary notification with the Gear 1 instruction. The user receives their directive without opening the application.

### 3.2 Natural Language Ingest (The Audio Diary)
For users who prefer to vent or document their day, they can select the Diary option. The user opens the app and records a short audio clip (e.g., *"Work was brutal today, I'm exhausted, I just want to order food."*). The AI natively transcribes the audio, detects the sentiment and context, maps it to the "Bad Day" condition in the semantic playbook, and outputs the correct Gear 2 or 1 action.

### 3.3 Intelligent Filtering
If a user is having a Gear 1 day, the system will **not** output three different Gear 1 tasks for all three active goals. To do so would cause overwhelm. Instead, the AI intelligently selects the single highest-leverage action across all priorities to keep the momentum alive, temporarily pausing the others.

---

## 4. The Iteration Engine (The Meta-System)
A system that doesn't adapt will eventually break. The application features a built-in automated incident response loop designed to debug human behavior.

> **The Sunday Review (Conversational UI)**
> If the telemetry detects that the user has relied on Gear 1 for multiple consecutive days, the system triggers a conversational review session. The UI mimics a calm, minimalist environment (similar to a meditation app).

### 4.1 The AI Dual-Persona
During the review, the user talks to the AI via audio. The AI operates with two simultaneous personas:
*   **The Therapist (Frontend):** Empathetic and conversational. It validates the user's fatigue and discusses why the friction was too high, removing shame from the interaction.
*   **The Engineer (Backend):** Silently analyzing the transcript to identify logic bottlenecks. It extracts conditions (e.g., "Evening fatigue") and proposes a logic patch (e.g., "Shift heavy reading to the morning; change evening Gear to passive learning"). If the user agrees, the backend playbook is automatically rewired.

---

## 5. Telemetry & Psychological Reframing
Habit trackers often cause user churn by visualizing failure (broken streaks). This system engineers out the concept of failure through its safety net.

### 5.1 Delayed Verification
To keep the execution phase frictionless, the app assumes completion when a user accepts a Gear assignment via notification. It sends a single, low-pressure ping the following day: *"Did you knock out those 5 flashcards yesterday?"* This avoids integrating with complex third-party APIs while maintaining accurate telemetry.

### 5.2 The Contribution Calendar & Shadow Metrics
The primary dashboard features a GitHub-style contribution graph with a calm color palette. Green dots represent successful execution of *any* gear.
*   **Anti-Shame Design:** A Gear 1 execution is treated as a 100% success rate for a Gear 1 condition. It is marked green, not yellow or red.
*   **Shadow Metrics:** The app actively reframes the user's perspective by showing the compounding math of the safety net. *"You had 6 'Worst' days this month, but your system caught you. You banked 30 practice questions instead of taking a zero."*

---

## 6. Phased Implementation Strategy

### Phase 1: Minimum Viable Product (MVP)
The core objective is testing the "Lock Screen Routing" and "Semantic Playbooks."
*   Manual goal entry (User defines the 4 Gears themselves).
*   Interactive push notifications for state logging `[Good, Bad, Worst]`.
*   Simple text-based dashboard displaying the active Gear instruction.
*   Manual habit checking for the contribution calendar.

### Phase 2: The AI Orchestrator
*   AI-assisted onboarding (interrogating failure modes to build the playbooks).
*   Audio-diary ingest and natural language state parsing.
*   The Conversational Sunday Review (AI proposing playbook updates).

### Phase 3: The Zen Environment
*   Full minimalist UI overhaul (animations, calming colorways).
*   Advanced shadow metrics and psychological reframing summaries.
*   Visual Node Playbook viewer.