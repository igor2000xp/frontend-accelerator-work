# Product Context: Basketball Training Sessions Workspace

## Product Summary

A centralized scheduling and operational dashboard for basketball academy operators. The system
unites scheduling, trainer assignments, and location management into a single, clean workspace,
replacing fragmented spreadsheets, calendars, and text messages.

## Target Users

* **Primary user:** a busy basketball trainer/operator who repeatedly scans schedules, manages
  capacity, and creates new sessions. This user values fast, dense data scanning and
  predictable actions over decorative presentation.
* **Secondary users:** basketball coaches checking their assigned sessions, and location
  administrators verifying court availability.

## Jobs to be Done (JTBD)

* **Schedule scanning:** "When I am managing weekly schedules, I want to see all scheduled,
  full, cancelled, and completed sessions in one place, so I can spot capacity constraints and
  coach conflicts instantly."
* **Session creation:** "When parent bookings open, I want to quickly schedule a session with
  pre-validated constraints, so that I don't accidentally overbook a court or assign a coach
  who is busy."
* **Context preservation:** "When inspecting details of a training session, I want to keep my
  spot in the master schedule list so that I don't lose my filter and scroll state."

## Core User Flows

1. **Search & filter workspace:** the operator searches sessions by title, coach, or court
   name, filtering by status to evaluate availability.
2. **Inspect session details:** the operator opens a session's side drawer or modal to view
   description notes, coach contacts, and timestamps.
3. **Create training session:** the operator fills out a scheduling form, gets inline feedback
   on validation issues, and sees the new session appended to the list.

## Domain Vocabulary

* **Session status:** `scheduled`, `full`, `cancelled`, `completed`.
* **Session type:** `training`, `camp`, `private`.
* **Visibility:** `public`, `invite-only`.
* Every session has a coach, a location, a start time (ISO 8601 UTC over the wire, shown in the
  user's local timezone), a duration in minutes, a capacity, and a booked count.

## Success Metrics

* **No color-only status cues:** statuses are distinguishable by text and shape tokens, not
  color alone.
* **Context retention:** checking details never resets list scroll, active search queries, or
  status filters.
* **Fully offline-capable:** the app runs completely in local/mock mode through the MSW
  boundary.

## Current Priorities (Now / Next / Later)

* **Delivered:** onboarding task `task-001-onboarding-sessions` — the `/sessions` workspace
  lists sessions from the mock API, offers `All` plus the `Scheduled` status filter (mirrored
  into the `?status=` URL parameter), and creates sessions through a form validating a trimmed
  3–80 character title and a strictly future start time, with loading, empty, and error states.
  A failed create shows no message by design (decision D-06); the form stays open and editable.
* **Next:** the broader assessment scope — search by title/coach/location, all four status
  filters, and the session details side drawer.
* **Later:** optional extensions such as pagination and optimistic updates. URL parameter
  synchronization is no longer deferred: the status filter already round-trips through the URL.

## Explicit Out-of-Scope (Non-Goals)

* Real backend database or API implementation (Vite client-only).
* User authentication, roles, or registration.
* Interactive drag-and-drop calendars or attendee enrollment workflows.
* Processing financial transactions or sending real emails.

## Assumptions and Risks

* **Timestamp decay:** to keep mock data from showing past-due dates, fixture timestamps must
  be rebased relative to the current local date at runtime.
* **No API creep:** developers must adhere to the fixed API contract and not fabricate
  endpoints.

## Source Documents

* `training/frontend-accelerator-onboarding/TASK.md` — the active onboarding brief
* `training/frontend-accelerator-assessment/FRONTEND_ASSESSMENT_SPEC.md` — full product scope
* `training/frontend-accelerator-assessment/API_CONTRACT.md` — fixed API contract (`/api`)
* `training/frontend-accelerator-assessment/MOCKING_GUIDE.md` — MSW mocking rules
