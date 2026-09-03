# task-001-onboarding-sessions: Training Sessions Workspace (onboarding scope)

Author role: `requirements-analyst`. Sources in priority order:
`training/frontend-accelerator-onboarding/TASK.md` (wins on conflict) >
`tasks/task-001-onboarding-sessions/task.md` > `ai/context/product.md` >
`training/frontend-accelerator-assessment/API_CONTRACT.md` (only `GET /api/sessions` and
`POST /api/sessions`) > `AGENTS.md` / `ARCHITECTURE.md` (constraints only).
`ai/context/tasks/task-001-sessions-workspace.md` was deliberately not used.

Tags used below: `[T]` required by TASK.md, `[C]` derived from a repository constraint
(AGENTS.md / ARCHITECTURE.md), `[P]` derived from product.md, `[A-n]` depends on assumption n.

## Goal

A trainer opens one workspace screen, sees training sessions loaded from the mock API, narrows
the list with `All` plus one status filter, opens a create form, creates a session with a
trimmed 3-80 character title and a future date/time, and sees the new session in the list.
Loading, one recoverable request-error state, duplicate-submission prevention, and a useful
validation message are part of the flow. Nothing else is.

## Users And Outcome

- User: a busy basketball trainer/operator who scans the schedule and creates sessions
  (`ai/context/product.md`). Values fast scanning and predictable actions.
- Outcome: the required flow (list -> filter -> open form -> create -> see in list) works end to
  end against MSW in the browser and is covered by at least one behavior-level test.
- Done condition: `training/frontend-accelerator-onboarding/PASS_CRITERIA.md` is satisfied
  (binary, no score).

## Acceptance Criteria

Each criterion is checkable on its own. "Fixture list" means the five records from
`training/frontend-accelerator-assessment/fixtures/sessions.json` (statuses: `scheduled` x2,
`full`, `cancelled`, `completed`).

### List

- [ ] AC-01 `[T]` Opening the workspace route issues exactly one `GET /api/sessions` through
      `src/services/api/http.ts` (no `fetch` in `src/features/**`) and renders one row per
      returned session showing its title, its status, and its start date/time.
- [ ] AC-02 `[T]` Start date/time is rendered from the ISO 8601 UTC `startsAt` value converted to
      the user's local timezone (product.md, API_CONTRACT.md). Verify: a fixture `startsAt` of
      `...T16:00:00Z` displays as the equivalent local wall-clock time, not `16:00` verbatim in a
      non-UTC zone.
- [ ] AC-03 `[T]` While the list request is pending, a translated loading indicator is visible
      and no session rows are rendered. Verify with a delayed MSW handler.
- [ ] AC-04 `[T]` When `GET /api/sessions` responds `500` (`SESSIONS_UNAVAILABLE`), the list area
      shows one translated, human-readable error message and a retry control. No raw status
      code, stack, or English-only string.
- [ ] AC-05 `[T]` Activating the retry control re-issues `GET /api/sessions`; if the retry
      succeeds the error state is replaced by the rendered list (recoverable, no page reload).
- [ ] AC-06 `[C]` When the response is `{ data: [], meta: { total: 0 } }`, the list area shows a
      translated empty message and no error. (ARCHITECTURE.md 8.4 requires every flow to handle
      loading, empty, success, and error; TASK.md does not name the empty state, so this is a
      constraint-derived criterion, not a product one.)
- [ ] AC-07 `[P]` Status is shown as a text label (not colour alone). Verify: with styles removed
      the status word is still readable.

### Filter

- [ ] AC-08 `[T]` The filter control offers exactly two choices: `All` and one session status
      (see Decision D-01 for which status). Both labels come from i18n keys.
- [ ] AC-09 `[T]` `All` is the initial selection and shows every session in the response
      (five for the fixture list).
- [ ] AC-10 `[T]` Selecting the single status shows only sessions whose `status` equals that
      value and hides the rest. For the fixture list with `scheduled`, exactly `U14 Shooting Lab`
      and `Private Footwork Review` remain visible.
- [ ] AC-11 `[T]` Selecting `All` after the status restores the full list.
- [ ] AC-12 `[T]` The filter remains usable while the create form is open and after a session is
      created (no reset to `All` unless the developer decides otherwise in D-05).

### Create form

- [ ] AC-13 `[T]` The workspace has one translated control that opens the create form. Before it
      is activated the title and date/time inputs are not rendered (or not visible); after it is
      activated they are, together with a submit control.
- [ ] AC-14 `[T]` The form contains a title input and a date-and-time input (both required) and
      a submit control. No other fields are required of the user (see D-02 for how the remaining
      contract fields are supplied).
- [ ] AC-15 `[T]` Title is validated after trimming. Submitting `"ab"`, `"  ab  "`, `""`, or a
      string whose trimmed length is 81 blocks submission and shows a translated validation
      message that states the 3-80 character rule. `"abc"`, `"  abc  "`, and a trimmed
      80-character string pass.
- [ ] AC-16 `[T]` The value sent as `title` in the POST body is the trimmed string.
- [ ] AC-17 `[T]` Date/time is validated as strictly in the future relative to the moment of
      validation. An empty value, a past value, and the current minute block submission and
      show a translated validation message that says the date/time must be in the future
      (see Q-01 for the precise comparison rule; the criterion only requires a past or
      present value to be rejected and a clearly future value to be accepted).
- [ ] AC-18 `[T]` Validation messages are rendered next to (or clearly associated with) the field
      they concern and are removed or updated once the field becomes valid.
- [ ] AC-19 `[T]` No `POST /api/sessions` is sent while any validation error exists. Verify with
      an MSW handler that records calls.
- [ ] AC-20 `[T]` While `POST /api/sessions` is pending, the submit control is disabled or the
      submit handler ignores further activations, and a translated pending indication is
      visible. Verify: activating submit twice in quick succession with a delayed handler
      produces exactly one POST.
- [ ] AC-21 `[T]` On a `201` response the created session appears in the visible list with the
      submitted (trimmed) title, its status, and the submitted start date/time rendered in local
      time, without a page reload.
- [ ] AC-22 `[A-05]` On a `500` (`CREATE_SESSION_FAILED`) response the form shows a translated
      error message, keeps the entered values, and re-enables submit so the user can retry.
      TASK.md only mandates the list error state; this criterion exists so that a failed create
      does not leave the form stuck in the pending state from AC-20.

### Mock boundary and quality gates

- [ ] AC-23 `[T][C]` `GET /api/sessions` and `POST /api/sessions` are served by MSW handlers
      registered in `src/mocks/handlers.ts`; the app runs with `npm run dev` and no backend
      process; nothing under `src/app`, `src/features`, `src/services`, or `src/shared` imports
      from `src/mocks`.
- [ ] AC-24 `[C]` Every user-visible string in the feature comes from i18n keys present in both
      `src/shared/i18n/locales/en/<ns>.json` and `src/shared/i18n/locales/ru/<ns>.json`; the
      namespace is registered in `src/shared/i18n/index.ts`. Verify: `i18n.changeLanguage("ru")`
      renders Russian text for the list heading, filter labels, form labels, validation and error
      messages, with no missing-key fallbacks.
- [ ] AC-25 `[T]` At least one Vitest behavior-level test exists under `src/**/*.test.tsx` that
      renders the workspace against the MSW node server and asserts either (a) filtering by the
      single status hides non-matching fixture sessions, or (b) submitting a valid title and a
      future date/time results in the new session being visible in the list. `npm run test`
      passes.
- [ ] AC-26 `[C]` `npm run lint`, `npm run typecheck`, and `npm run build` pass after the change.
- [ ] AC-27 `[C]` The feature lives in `src/features/<feature>/` with `ui/`, `model/`, and
      `index.ts`; the route is registered in `src/app/router.tsx` via the feature barrel; typed
      wrappers live in `src/services/api/endpoints/*`; the import direction rules in
      ARCHITECTURE.md section 4 hold.

## Constraints

- TASK.md wins over every other source on conflict.
- Existing stack only: React 19, React Router 7 (library mode), TanStack Query 5, Tailwind 4 +
  shadcn/ui, TypeScript 5.9 strict, Vite 7, i18next (en + ru), MSW 2, Vitest 4 + Testing
  Library, Biome 2, npm only.
- ED small layers and import rules (AGENTS.md, ARCHITECTURE.md section 4). Feature barrel rule
  (section 6). Feature layout (section 7); no `compose/` preemptively.
- Manual API mode: `http.ts` client, typed wrappers in `src/services/api/endpoints/*`, TanStack
  Query hooks in `features/<feature>/model/`, no raw `fetch` in feature UI.
- No hardcoded UI strings; keys in both locales; new namespace registered in `resources`.
- Biome formatting: tabs (width 4) for TS/TSX, 2 spaces elsewhere, double quotes, width 100.
- No `useMemo` / `useCallback` by default. No Next.js / RSC / SWR assumptions.
- API contract authority: endpoint paths, required request fields, response fields, and error
  codes must not be silently changed; a deviation needs an explicit proposal in task
  documentation and approval (API_CONTRACT.md "Contract Authority"). See D-02.
- `npm run scaffold:*` does not exist in this repository (workflow-log.md); feature folders are
  created by hand.
- Do not rewrite unrelated code or configuration. Do not add features outside the required
  flow.
- Report unperformed checks honestly.

## Non-Goals

Everything under "Explicitly Optional" in TASK.md is out of scope for this task id:

- session details view, drawers, modals for details, or deep links;
- search (`query` as a user-facing input) or more than one status filter;
- pagination (the `meta.page` / `meta.pageSize` values are passed through, not acted on);
- a complete API contract implementation or scenario matrix (`GET /api/sessions/:id`,
  `GET /api/coaches`, `POST .../cancel`, the optional scenarios, permission input);
- desktop/mobile screenshot sets;
- exhaustive responsive and accessibility validation;
- full test coverage;
- CI, deployment, or a public URL;
- strict TypeScript migration or unrelated refactoring.

Additional non-goals from product.md and the API contract: a real backend, authentication or
roles, drag-and-drop calendars, enrollment, payments, email. Not merging anything from
`ai/context/tasks/task-001-sessions-workspace.md` (search, four filters, no create form).

## Facts

- F-01 TASK.md required flow: list from mock API; filter by one status; open create form;
  create with title + future date/time; see it in the list. Required behavior: title/status/
  start date-time per row; `All` + one status; loading; one recoverable error; trimmed title
  3-80; future date/time; duplicate-submission prevention; useful validation message; add
  created session to the visible list; mock behind a replaceable boundary; one behavior test;
  one recorded manual browser check.
- F-02 The repository already has the mock mechanism: MSW worker started from `src/main.tsx` in
  dev, `src/mocks/server.ts` for tests, `src/test/setup.ts` with `onUnhandledRequest: "error"`.
  `src/mocks/handlers.ts` currently exports an empty array.
- F-03 `src/services/api/http.ts` exposes `http.get` / `http.post` with base `/api` and throws
  `HttpError(status, url)` on non-2xx. It does not read the error body, so `ApiError.error.
  message` and `fieldErrors` are not available to callers today.
- F-04 `src/services/api/endpoints/` contains only `.gitkeep`. `src/app/router.tsx` has a
  single index child rendering `null`. Only the `common` i18n namespace exists.
- F-05 API contract for `GET /api/sessions`: query parameters `query` and `status` (both listed
  as required with empty defaults, "one status in v1"); `200` returns `{ data: SessionSummary[],
  meta: { page, pageSize, total } }`; errors `400 INVALID_FILTER`, `500 SESSIONS_UNAVAILABLE`.
  Handlers must apply `status` before computing `meta.total`.
- F-06 API contract for `POST /api/sessions`: request requires `title`, `type`, `startsAt`,
  `durationMinutes`, `coachId`, `locationName`, `locationAddress`, `capacity`, `visibility`
  (optional `description`, `trainerNotes`). `201` returns `SessionDetails` (a superset of
  `SessionSummary`) that echoes normalized values and must become visible in subsequent list
  reads. Errors `400 VALIDATION_FAILED` (with `fieldErrors`), `500 CREATE_SESSION_FAILED`,
  optional `409 COACH_SCHEDULE_CONFLICT`. Client must prevent duplicate submission but must not
  fabricate idempotency.
- F-07 `SessionStatus` is `scheduled | full | cancelled | completed`. Fixture list has five
  sessions: `scheduled` x2, `full`, `cancelled`, `completed`.
- F-08 All timestamps over the wire are ISO 8601 UTC and are displayed in the user's local
  timezone (product.md, API_CONTRACT.md).
- F-09 Fixture `startsAt` values are dated 2026-07-24 to 2026-08-08 against `referenceNow`
  `2026-07-27T12:00:00Z` (`fixtures/fixture-clock.json`). Today is 2026-09-02, so without
  rebasing every fixture session is already in the past. The contract requires the MSW
  boundary to rebase timestamps at mock startup; TASK.md does not mention it.
- F-10 Deterministic mock scenarios `normal`, `empty`, `list-error`, `create-error` exist in
  `fixtures/mock-scenarios.json` with ready-made error bodies. Scenario selection is
  infrastructure; presentation components must not branch on scenario names.
- F-11 Assessment fixtures live under `training/frontend-accelerator-assessment/fixtures/`,
  outside `src/`. Nothing in `src/` references them yet.
- F-12 PASS_CRITERIA.md requires: app starts with a documented command; list, filter, create
  work end to end; loading and recoverable error implemented; one passing behavior test; truthful
  verification; one real manual browser observation; requirements, plan, review, verification,
  workflow-log artifacts exist.

## Assumptions

- A-01 The workspace is a single screen with the list, the filter, and the create form; no
  second route is needed for the form.
- A-02 The one status filter is applied to the data the user sees; whether it is applied by the
  MSW handler via `?status=` or client-side is an architecture choice (G-02) and does not change
  the acceptance criteria.
- A-03 The created session's status is `scheduled` (the contract's POST request has no `status`
  field, so the mock assigns one). Consequence: if D-01 selects `scheduled`, a newly created
  session is visible under both `All` and the status filter.
- A-04 The date/time input is a single `datetime-local`-style input yielding local wall-clock
  time; the client converts it to an ISO 8601 UTC string for `startsAt`.
- A-05 A failed create should be recoverable in the same way as a failed list load (AC-22),
  even though TASK.md only names the list error state. Keep values, show message, re-enable
  submit.
- A-06 A language switcher is not required; both locale files must be complete, and `ru` can be
  verified via `i18n.changeLanguage` in a test or dev tools.
- A-07 No user-facing empty-state action (e.g. "create your first session") is required beyond
  the translated empty message in AC-06.
- A-08 The `query` parameter is not exposed in the UI; the client either omits it or sends it
  empty (Q-02).

## Open Questions

Each question names the owning specialist. None is resolved here.

- Q-01 (api-integration / architect) How is "future" evaluated: compared with local `Date.now()`
  at validation time; what granularity (minute, since `datetime-local` has no seconds); is
  "now + 0 minutes" rejected; is the check repeated on submit if the form sat open for a while;
  how do tests freeze time consistently with the fixture-clock rule?
- Q-02 (api-integration) `GET /api/sessions` lists `query` and `status` as required with empty
  defaults. Should the client always send `?query=&status=` (including `status=` empty for
  `All`), or omit absent parameters, and how does the handler treat each?
- Q-03 (api-integration) The POST response is `SessionDetails`. Should the client (a) insert the
  returned object into the TanStack Query cache for the list, (b) invalidate and refetch the
  list, or (c) both? The mock must also make the session visible on the next GET regardless.
- Q-04 (api-integration) `HttpError` drops the response body (F-03). Is a generic translated
  message enough for the onboarding error states, or should `http.ts` be extended to expose
  `ApiError.error.code`/`message`/`fieldErrors`? Changing `http.ts` touches shared services
  code; keep the change minimal if made.
- Q-05 (api-integration) Is fixture-clock rebasing in scope for onboarding (F-09)? Without it
  all fixture sessions display past dates, which is harmless for list/filter but confusing next
  to a "must be in the future" rule for new sessions.
- Q-06 (architect / api-integration) Where do the fixtures used by `src/mocks/handlers.ts` live:
  copied into `src/mocks/fixtures/`, imported from `training/.../fixtures/` (crosses into a
  non-source directory), or inlined? Does the handler keep created sessions in module-level
  memory so a refetch returns them?
- Q-07 (architect / test-generator) How does the manual check and the test trigger the
  list-error state: `server.use` override in tests, a query-string or env switch for the
  browser, or something else? Presentation code must not branch on scenario names (F-10).
- Q-08 (ui-designer) What does the filter look like (segmented control, select, radio group);
  is the create form inline, a collapsible panel, or a dialog; does it close, reset, or stay
  open after success; where do the loading, empty, and error states sit relative to the filter?

## Decisions Requiring Human Authority

The developer must decide these before or during `writing-plans`; the analyst has proposed a
default for each but has not applied it.

- D-01 Which single status the filter offers. Proposed default: `scheduled` (two fixture
  matches, and the natural status for created sessions per A-03). Owner: developer, with
  ui-designer input if wanted.
- D-02 How the seven POST fields not collected by the form (`type`, `durationMinutes`,
  `coachId`, `locationName`, `locationAddress`, `capacity`, `visibility`) are supplied. Options:
  (a) the endpoint wrapper or model fills fixed defaults (e.g. `type: "training"`, coach
  `coach_01` from `fixtures/coaches.json`) and the body stays contract-compliant; (b) the mock
  accepts a reduced body, which is a contract deviation requiring an explicit proposal per
  "Contract Authority"; (c) add the fields to the form, which exceeds TASK.md scope. Owner:
  developer decides, api-integration specifies the body.
- D-03 Whether fixture-clock rebasing (Q-05) is implemented now or recorded as a known
  limitation.
- D-04 Route placement: the workspace at the index route `/` or at `/sessions` (with or without
  an index redirect). Owner: architect / developer.
- D-05 Behaviour after a successful create: close the form and reset it, or keep it open; keep
  the active filter or reset to `All`. Owner: developer with ui-designer input.
- D-06 Whether to accept A-05 (recoverable create error, AC-22) as in scope or drop AC-22.

## Specialist Gaps

- G-01 architect: route placement (D-04), feature folder name and barrel exports, list cache
  strategy after create (Q-03), fixture location and in-memory store shape in the mock
  (Q-06), how the error scenario is triggered in the browser (Q-07), and where date
  formatting / future-check helpers live (feature `model/` vs `shared/lib`).
- G-02 api-integration: exact request/response types for the two endpoints, query-parameter
  policy (Q-02), POST body defaults (D-02), what the `201` body means for the list (Q-03),
  `http.ts` error-body handling (Q-04), fixture-clock rebasing (Q-05), and the "future"
  comparison rule for `startsAt` including UTC conversion (Q-01).
- G-03 ui-designer: filter control type, form placement and post-success behaviour, placement
  of loading / empty / error / validation messages, and status label presentation (Q-08,
  D-05). Only minimal direction is needed; visual polish is explicitly non-blocking.

## Readiness

Verdict: **ready for planning with recorded decisions**. The product scope is unambiguous
(TASK.md is precise and small), and every acceptance criterion above is verifiable without
further product input. What remains is not product ambiguity but a handful of technical and
presentation choices (D-01 to D-06, Q-01 to Q-08) that the developer can settle inline while
authoring the `writing-plans` prompt. The one decision that materially affects contract
compliance is D-02 (POST body fields); it should be stated explicitly in the plan so the coder
does not silently deviate from the contract.

Recommended next role: `writing-plans`, with the prompt stating the developer's answers to
D-01, D-02, D-03, D-04, and D-05 (or delegating them to the plan with a rationale). Invoke
`api-integration` first only if the developer wants D-02, Q-01 to Q-05 resolved in a separate
artifact rather than inside the plan. `architect` and `ui-designer` are optional for this
scope. `brainstorm` is not needed: there is no product ambiguity.
