# Workflow Log

Task: `task-001-onboarding-sessions`

Developer: `igor2000xp <igor.aniskevich@innowise.com>`

Active work started: `2026-09-02T04:18+02:00`

## Runtime Readiness

- Doctor result: `DEGRADED` at start -> `READY` after project init
- Runtime hook status: `claude: ACTIVE / codex: ACTIVE` (codex was `PENDING_ACTIVATION` at start)
- Blocking effect, if any: `none`

Detail. The first `node ./toolchain/bin/doctor.mjs --json` run reported `DEGRADED` for two checks:
`hooks:codex = PENDING_ACTIVATION` and `lint = "no existing lint script was found"`. Neither
blocked the workflow: it is driven through Claude, whose hooks were already `ACTIVE`, and the lint
gate was degraded only because the repository had no `package.json` yet. After project init the
same command reports `READY` with all eight checks `PASS`.

Doctor evidence at start: `training/frontend-accelerator-onboarding/workflow-log-doctor.md`.

## Role Decisions

| Time | Role | Exact prompt used | Result reviewed | Developer decision | Next action |
| --- | --- | --- | --- | --- | --- |
| `2026-09-02T04:07+02:00` | `developer (no role)` | `n/a — developer-authored task brief` | `tasks/task-001-onboarding-sessions/task.md` | `accept` | `initialize the React application before any role runs` |
| `2026-09-02T04:18-04:23+02:00` | `developer (no role)` | `n/a — environment bootstrap, outside the timebox` | `Vite 7 + React 19 + TS 5.9 strict app initialized; ED layers, Tailwind 4, React Router 7, TanStack Query 5, i18next en+ru, Biome, MSW, Vitest wired. build / typecheck / lint / test all pass; dev server renders the shell with MSW active. Doctor re-run: READY.` | `accept` | `manually select requirements-analyst` |
| `2026-09-02T06:02-06:07+02:00` | `requirements-analyst` | verbatim in "Prompt: requirements-analyst" below | `tasks/task-001-onboarding-sessions/requirements.md` — 27 acceptance criteria (AC-01..AC-27), non-goals from TASK.md "Explicitly Optional", facts F-01..F-12, assumptions A-01..A-08, open questions Q-01..Q-08, decisions D-01..D-06, specialist gaps for architect / api-integration / ui-designer. Verdict: ready for planning with recorded decisions. Role STOPped. | `accept with corrections` — coverage checked against TASK.md and factual claims spot-checked; two developer corrections recorded below (assessment material is reference-only; mock data authored locally) | `manually select writing-plans`, with D-01..D-06 answered in the prompt |
| `2026-09-02T15:59+02:00` | `api-integration` | verbatim in "Prompt: api-integration" below | `tasks/task-001-onboarding-sessions/api-integration.md` — Q-01 minute-bucket future rule with an injectable formatter timezone, Q-02 omit-empty query params, Q-03 invalidate-and-refetch only, Q-04 no change to `http.ts`, Q-07 `server.use` in tests plus a `?mock=` switch in the browser, D-02 defaults owned by the feature model, plus types, wrapper signatures, seed data, handler algorithms, and `sessions` i18n keys in en and ru. Role STOPped. | `accept with two clarifications` — recorded below | `manually select writing-plans` |

Add one row for each role invocation or important correction. Preserve each prompt exactly, but do
not copy full role responses into this file.

### Developer Review Of `requirements.md`

Reviewed `2026-09-02T06:15+02:00`. Accepted as the basis for planning.

Coverage against TASK.md is complete: list with title/status/start, `All` plus one status filter,
loading, one recoverable request-error state, create form, trimmed 3-80 title, future date/time,
duplicate-submission prevention, validation message, created session visible in the list, mock
boundary, and one behavior-level test. Factual claims were spot-checked and are correct:
`src/services/api/http.ts` throws without reading the error body, `src/mocks/handlers.ts` and
`src/services/api/endpoints/` are empty, the router index renders `null`, only the `common` i18n
namespace exists, ARCHITECTURE.md 8.4 does require loading/empty/success/error (so AC-06 is a real
repository constraint, not added scope), and section 7 matches AC-27.

Two corrections, both developer-owned:

1. Scope authority. `training/frontend-accelerator-onboarding/README.md` states: "Do not use files
   from `frontend-accelerator-assessment/` during this task." My prompt named that directory's
   `API_CONTRACT.md` as source 4, so the analyst used it correctly, but for this task id the
   assessment material is reference-only for naming and payload shape. TASK.md stays the sole
   authority. Consequence: D-02 needs no contract-deviation proposal, and the form does not grow
   extra fields; the endpoint wrapper may supply fixed defaults for the fields the form does not
   collect.
2. Mock data. Fixtures are not imported from `training/frontend-accelerator-assessment/fixtures/`.
   Equivalent mock data is authored under `src/mocks/` with future-dated `startsAt` values. This
   moots Q-06 (fixture location) and reduces Q-05/D-03 (fixture-clock rebasing) to seeding future
   dates, which removes the past-date confusion at no cost. AC-09 and AC-10 remain valid as long as
   the local seed mirrors the five records and their statuses.

Superseded below: the developer subsequently dropped AC-22 when settling D-06. See
"Developer Decisions D-01..D-06".

Carried into the `writing-plans` prompt: AC-02 asserts local-timezone rendering, which is
machine-dependent. The plan must pin the timezone in the test or assert through the same formatter
the UI uses.

### Developer Decisions D-01..D-06

Recorded `2026-09-02T15:48+02:00`. These answer the decisions `requirements-analyst` left to human authority. They
are settled input for the roles that follow; roles must not re-open them.

| Id | Decision |
| --- | --- |
| D-01 | The single filter status is `scheduled`. |
| D-02 | Option (a): the endpoint wrapper or model supplies fixed defaults for `type`, `durationMinutes`, `coachId`, `locationName`, `locationAddress`, `capacity`, `visibility`, so the POST body stays contract-shaped. The form collects only title and start date/time. |
| D-03 | Implement locally seeded, future-dated mock data in `src/mocks/`. No fixture-clock rebasing and no imports from `training/frontend-accelerator-assessment/`. |
| D-04 | The workspace route is `/sessions`; the index route `/` redirects to it. |
| D-05 | After a successful create the form closes and resets. The active filter is unchanged (AC-12 stands). |
| D-06 | Drop AC-22. No create-error UI state is required. |

Developer note on D-06. Dropping AC-22 means a failed `POST /api/sessions` shows the user no
message. Accepted as a deliberate scope reduction for onboarding, and recorded as a known
limitation. One guardrail remains non-negotiable: the pending state from AC-20 must end when the
request settles, success or failure, so the submit control cannot stay permanently disabled. That
is correct pending-state handling under AC-20, not a reinstatement of AC-22.

Developer note on D-04. "Index redirect" is read as `/` redirecting to `/sessions`, which is the
only reading in which the redirect does anything. The workspace itself lives at `/sessions`.

Next role: `api-integration`, selected because G-02 in `requirements.md` assigns Q-01 to Q-05 and
the D-02 payload shape to that specialist. `writing-plans` follows once the API decisions exist.

### Prompt: requirements-analyst

```text
Task id: task-001-onboarding-sessions

Produce tasks/task-001-onboarding-sessions/requirements.md for the onboarding sessions workspace.

Sources, in priority order:
1. training/frontend-accelerator-onboarding/TASK.md (wins on any conflict)
2. tasks/task-001-onboarding-sessions/task.md
3. ai/context/product.md
4. training/frontend-accelerator-assessment/API_CONTRACT.md (only GET /api/sessions and POST /api/sessions matter here)
5. AGENTS.md and ARCHITECTURE.md for constraints only

Scope is the required flow only: list sessions from the mock API, filter by All plus one status, open a create form, create a session with a trimmed 3-80 character title and a future date/time, see it in the list. Include loading, one recoverable request-error state, duplicate-submission prevention, and a useful validation message.

Write independently verifiable acceptance criteria for each behavior. Separate facts, assumptions, open questions, and decisions that need my call. Treat everything under "Explicitly Optional" in TASK.md as non-goals and list them as such. Do not merge scope from ai/context/tasks/task-001-sessions-workspace.md.

Note any gap that belongs to architect, api-integration, or ui-designer (for example: which single status the filter uses, how "future" is evaluated against local time, and what the POST response shape means for adding the created session to the list) instead of resolving it yourself.

Do not select architecture, write or change code, or edit living specs. Finish with a readiness verdict and the recommended next role, create a needed record in the workflow-log.md file then STOP.
```

### Prompt: api-integration

```text
Task id: task-001-onboarding-sessions

Read `tasks/task-001-onboarding-sessions/requirements.md` (especially G-02, Q-01 to Q-05, Q-07, F-03, F-05, F-06), `tasks/task-001-onboarding-sessions/task.md`, and the "Developer Decisions D-01..D-06" section of `tasks/task-001-onboarding-sessions/workflow-log.md`.

Produce `tasks/task-001-onboarding-sessions/api-integration.md` defining how this frontend consumes `GET /api/sessions` and `POST /api/sessions` for the onboarding scope only.

Settled developer decisions. Do not re-open them:
- D-01 the single filter status is `scheduled`.
- D-02 option (a): the endpoint wrapper or model supplies fixed defaults for `type`, `durationMinutes`, `coachId`, `locationName`, `locationAddress`, `capacity`, `visibility`. The form collects only title and start date/time.
- D-03 mock data is seeded locally under `src/mocks/` with future-dated `startsAt`. No fixture-clock rebasing, no imports from `training/frontend-accelerator-assessment/`; that directory is reference-only for naming and payload shape per the onboarding README.
- D-04 the workspace route is `/sessions`, with `/` redirecting to it.
- D-05 after a successful create the form closes and resets; the active filter is unchanged.
- D-06 AC-22 is dropped: specify no create-error UI state. Still specify that the pending state ends when the request settles, so submit cannot stay permanently disabled.

Resolve each of these with a concrete decision and a one-line rationale:
- Q-01 the exact "future" rule for `startsAt`: `datetime-local` value to ISO 8601 UTC conversion, comparison granularity, whether the current minute is rejected, whether the check re-runs on submit, and how a test pins clock and timezone deterministically given AC-02 asserts local-time rendering.
- Q-02 the query-parameter policy for `GET /api/sessions` under `All` versus `scheduled`, and what the handler does with each.
- Q-03 whether the `201` body is written into the TanStack Query cache, triggers invalidate and refetch, or both, and what the mock must do so a created session survives a refetch.
- Q-04 whether `src/services/api/http.ts` stays as is with a generic translated message, or is minimally extended to expose the error code and message. If you propose a change, give the exact signature and keep it minimal.
- D-02 the concrete default values and the module that owns them.

Also specify: the TypeScript request and response types, the endpoint wrapper signatures for `src/services/api/endpoints/`, the shape of the local seed data, and MSW handler behavior including how the list-error state is triggered for both the manual browser check and tests without presentation components branching on scenario names (Q-07).

Constraints: manual API mode only, no raw `fetch` in feature UI, ED layer import rules from `AGENTS.md`, npm only, i18n keys in both `en` and `ru`. Do not write or modify production code, do not edit `requirements.md`, and do not edit living specs.

Report the resolved decisions and any remaining risk, then STOP without invoking another role.
```

### Developer Review Of `api-integration.md`

Reviewed `2026-09-02T15:59+02:00`. Accepted. The five API questions G-02 assigned to this role are closed, and the
Q-01 answer resolves the machine-dependent-timezone concern carried over from the requirements
review by giving the formatter an explicit `timeZone` and `locale` instead of pinning `TZ`
globally.

Two clarifications, both developer-owned:

1. D-03 refinement. "Future-dated seed" applies to the `scheduled` and `full` records only.
   Seeding `completed` and `cancelled` sessions in the future is semantically wrong, and the role
   flagged it rather than re-opening the decision. Those two records may sit in the past. This
   does not affect AC-09 or AC-10, which count all records and filter on `scheduled`.
2. Test layering. ARCHITECTURE.md section 5 forbids anything under `app/`, `features/`,
   `services/`, or `shared/` importing from `mocks/`, while the same section requires colocated
   tests. The proposed one-line `src/test/msw.ts` re-export satisfies both and is accepted.
   Colocated tests import `server` from `@/test/msw`, never from `@/mocks/server`.

Carried into the `writing-plans` prompt: D-04 moves the workspace to `/sessions`, so the existing
`src/app/App.smoke.test.tsx`, which renders `initialEntries: ["/"]` and asserts the layout
heading, must be confirmed still passing or updated as part of the change.

Accepted risks, to be restated as known limitations at completion: a failed create is silent
(D-06); static seed dates go stale after mid-2027; the list query uses `retry: false`, deviating
per-query from the global `retry: 1` in `src/app/providers.tsx`, which the error-state test
requires.

### Repository Precondition Note

The README assumes "a prepared React and TypeScript repository with the Frontend Accelerator
installed". Only the accelerator was installed: no `package.json`, no `src/`, no `ARCHITECTURE.md`,
no `ai/recipes/`, no `ai/prompts/`, no `.claude/skills/react-spa-best-practices/`, and no
`npm run scaffold:*` scripts, although `AGENTS.md` references all of them. The application was
therefore bootstrapped by the developer before the role sequence, which the README places outside
the timebox. The `coder` prompt stays bounded to the feature slice.

## Manual Browser Observation

- Command and URL: `<actual command and discovered URL>`
- Flow exercised: `<list -> filter -> create>`
- Observed result: `<what actually happened>`
- Unverified or incomplete behavior: `<none or short list>`

## Completion

- Active work finished: `<timestamp>`
- Known limitations:
  - `npm run scaffold:feature` / `scaffold:route` do not exist in this repository; feature folders
    were created by hand following the ED layer rules in AGENTS.md.
  - At bootstrap `ARCHITECTURE.md`, `ai/recipes/`, `ai/prompts/`, and
    `.claude/skills/react-spa-best-practices/SKILL.md` were absent although AGENTS.md references
    them. `ARCHITECTURE.md` and the skill were added afterwards; `ai/recipes/` and `ai/prompts/`
    exist but are still empty.
  - `src/features/home/` does not exist, so no in-repo example feature was available as a model.
  - `<add remaining limitations after review and verification>`
