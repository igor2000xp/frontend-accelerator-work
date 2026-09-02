# Product Context: Basketball Training Sessions Workspace

## Product Summary
A centralized scheduling and operational dashboard for basketball academy operators [2]. The system unites scheduling, trainer assignments, and location management into a single, clean workspace, replacing fragmented spreadsheets, calendars, and text messages [2].

## Target Users
*   **Primary User:** A busy basketball trainer/operator who repeatedly scans schedules, manages capacity, and creates new sessions [7]. This user values fast, dense data scanning and predictable actions over decorative presentation [7].
*   **Secondary Users:** Basketball coaches checking their assigned sessions, and location administrators verifying court availability.

## Jobs to be Done (JTBD)
*   **Schedule Scanning:** "When I am managing weekly schedules, I want to see all scheduled, full, cancelled, and completed sessions in one place, so I can spot capacity constraints and coach conflicts instantly." [2, 7]
*   **Session Creation:** "When parent bookings open, I want to quickly schedule a session with pre-validated constraints, so that I don't accidentally overbook a court or assign a coach who is busy." [8]
*   **Context Preservation:** "When inspecting details of a training session, I want to keep my spot in the master schedule list so that I don't lose my filter and scroll state." [7, 9]

## Core User Flows
1.  **Search & Filter Workspace:** Operator searches sessions by title, coach, or court name, filtering by status to evaluate availability [7].
2.  **Inspect Session Details:** Operator opens a session's side drawer or modal to view description notes, coach contacts, and timestamps [9].
3.  **Create Training Session:** Operator fills out a comprehensive scheduling form, getting inline feedback on validation issues before successfully appending the session [8, 9].

## Success Metrics
*   **Zero Color-Only Dependencies:** Statuses (Scheduled, Full, Cancelled, Completed) are immediately distinguishable using text and shape tokens, ensuring complete accessibility [7, 10].
*   **Context Retention:** Checking details never resets list scroll, active search queries, or status filters [7, 9].
*   **Flawless Offline Mode:** The system operates perfectly in local/mock environments via intercepted API layers [11].

## Current Priorities (Now / Next / Later)
*   **Now:** Implementation of the first vertical slice (Sessions list, Search, Status filtering, MSW API boundary) [7, 12].
*   **Next:** Session Details side-drawer and the multi-field Creation Form [9].
*   **Later:** Optional extensions like URL parameter synchronization, pagination, and optimistic updates [13].

## Explicit Out-of-Scope (Non-Goals)
*   Real backend database or API implementation (Vite client-only) [2, 13].
*   User authentication, roles, or registration [13].
*   Interactive drag-and-drop calendars or attendee enrollment workflows [13].
*   Processing financial transactions or sending real emails [13].

## Assumptions and Risks
*   **Timestamp Decay:** To keep mock data from showing past-due dates, fixture timestamps must be dynamically rebased relative to the current local date at runtime [14].
*   **No API Creep:** Developers must adhere to the fixed API Contract and not fabricate endpoints [15].
