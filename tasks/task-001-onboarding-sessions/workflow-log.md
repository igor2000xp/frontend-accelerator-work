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
| `2026-09-02T18:01-18:03+02:00` | `coder` (Lane A, mock/data boundary) | verbatim in "Prompt: coder (parallel first pass)" below, Lane A section | `src/services/api/endpoints/sessions.types.ts` + colocated test. T1 only: the shared transport types plus the runtime `SESSION_STATUSES` tuple (FR-01, FR-02). One TDD cycle: red was the expected unresolved-import error, then green (2 tests). `npm run lint:fix` clean. Role STOPped after T1 as instructed. | `pending developer review` — orchestrator verified the three repo-wide gates after convergence; the exported surface still needs the developer's sign-off because T3-T6 and T9-T14 bind to it | `developer go-ahead, then re-dispatch Lane A for T2 (src/mocks/scenario.ts)` |
| `2026-09-02T18:01-18:05+02:00` | `coder` (Lane B, presentation foundations) | verbatim in "Prompt: coder (parallel first pass)" below, Lane B section | T7: complete `sessions` i18n namespace, 22 keys, `en` + `ru` at parity, registered in the `resources` map and the `ns` array of `src/shared/i18n/index.ts`. T8: `src/features/sessions/model/date-time.ts` with `parseLocalDateTime`, `toIsoUtcSeconds`, `isFutureLocalDateTime`, `formatSessionStart` (injectable `timeZone` per Q-01). Two TDD cycles, both red-then-green (4 tests, then 7). Role STOPped after T8 without starting T9. | `pending developer review` — key parity and the seven FR-07 presentation keys independently re-verified by the orchestrator | `hold; T9 onward is sequential and consumes Lane A's T1 contract` |
| `2026-09-02T18:20+02:00` | `verify` | `Запусти команду verify, проверить сгенерированный код. После выполнения команды Stop command end make a record in the workflow-log.md file.` | Verdict **PASS**. Four applicable project-defined checks selected and run read-only against the converged tree: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` — all exit `0`. `npm run format` excluded as state-writing; e2e `NOT-APPLICABLE` (no Playwright or Cypress config). No failure repaired, no dependency installed, no configuration edited. Role STOPped after the verdict. | `pending developer review` — verdict is scoped to T1/T7/T8; it does not evidence any acceptance criterion that needs UI, MSW handlers, or the routed workspace, none of which exist yet | `developer go-ahead, then re-dispatch Lane A for T2 (src/mocks/scenario.ts)` |
| `2026-09-02T18:29+02:00` | `browser-verify` | `Запусти команду browser-verify, проверить сгенерированный код. После выполнения команды Stop command end make a record in the workflow-log.md file.` | Split verdict: **PASS** on the app-shell and i18n-registration regression check, **NOT-APPLICABLE** for every sessions acceptance criterion. Project Doctor `READY` (8/8 PASS, `capability:browser agent-browser@0.32.3`). Dev server started and stopped by this role; `/` renders the shell at 1440x900 and 390x844 with zero console errors and all requests `200`, including both `sessions.json` locales. `/sessions` returns React Router's 404 boundary because T12 has not registered the route. No production code, test, config, or data was edited. Role STOPped after the verdict. | `pending developer review` — confirms T7 did not break app boot; proves nothing about list, filter, or create, which have no rendered surface yet | `developer go-ahead, then re-dispatch Lane A for T2; re-run browser-verify only after T12 registers /sessions` |
| `2026-09-02T18:37+02:00` | `code-reviewer` | `Запусти команду /code-reviewer, проверить сгенерированный код. После выполнения команды Stop command end make a record in the workflow-log.md file.` | Verdict **NEEDS-CHANGES**. Bounded read-only review of `eac2faf..89fcb6d` restricted to `src/` (8 files, 365 insertions). Three should-fix findings (R-01 silent date rollover in `parseLocalDateTime`, R-02 `formatSessionStart` throws on unparseable input, R-03 `SessionStatus` and `SESSION_STATUSES` can drift apart) plus seven nits and residual coverage gaps. All three should-fix findings are inherited verbatim from `api-integration.md`, not coder error. No code, test, doc, or ruleset was edited. Role STOPped after the verdict. | `pending developer review` | `api-integration` to amend the contract for R-01 and R-03, then `coder` to apply; T2 remains unblocked meanwhile |
| `2026-09-02T18:40-18:53+02:00` | `api-integration` (revision 2) | `Review the verdict and make changes in the documentation according to the verdict.` plus the verbatim `code-reviewer` verdict | `tasks/task-001-onboarding-sessions/api-integration.md` revision 2 — amendments A-01 (`parseLocalDateTime` rejects normalized-away calendar components and out-of-range clock components), A-02 (`formatSessionStart` returns `""` instead of throwing; new `sessions:list.startUnknown` key in `en` + `ru`), A-03 (`SessionStatus` derived from `SESSION_STATUSES`). New section 13 records provenance, the per-file impact for `coder`, and the review items deliberately not changed. Sections 1, 2.1, 3, 8, 9, 10, 11, 12 edited in place. Every behavioral claim re-verified by execution, including the DST note. Role STOPped; no production code touched. | `pending developer review` | `coder` to apply A-01, A-02, A-03 and the section 10.6b/10.6c tests to the three first-pass files |
| `2026-09-02T18:55+02:00` | `coder` (review-remediation pass) | `applies A-01/A-02 to date-time.ts, A-03 to sessions.types.ts, and list.startUnknown to both locale files. После выполнения команды Stop command end make a record in the workflow-log.md file.` | A-01 + A-02 in `src/features/sessions/model/date-time.ts`, A-03 in `src/services/api/endpoints/sessions.types.ts`, `list.startUnknown` in both `sessions.json` locales, plus 14 new tests. One TDD cycle: red (14 failures) then green (23 in the file, 30 repo-wide). All four gates pass: `lint`, `typecheck`, `test`, `build`. A-03 additionally proven by a throwaway `tsc` probe. Closes review R-01, R-02 (helper half), R-03 and nit N-05. Role STOPped. | `pending developer review` | `re-run code-reviewer against this pass, then coder for T2 (src/mocks/scenario.ts)` |
| `2026-09-02T18:29+02:00` | `browser-verify` | `Запусти команду browser-verify, проверить сгенерированный код. После выполнения команды Stop command end make a record in the workflow-log.md file.` | Verdict **NOT-APPLICABLE**. Project Doctor gate passed (`capability:browser agent-browser@0.32.3 ready`, all eight checks `PASS`), so the role was not `BLOCKED`. Server discovery found no running dev server and no configured port. The developer was asked for the required approval to start one and declined, on the ground that the generated code has no browser surface yet. No server started, no adapter session opened, no production code touched. Role STOPped. | `not started — developer declined the dev server` | `re-run browser-verify after T12-T14 land the routed /sessions workspace and its UI` |
| `2026-09-02T19:08+02:00` | `code-reviewer` (re-review) | `Запусти команду /code-reviewer, проверить сгенерированный код. После выполнения команды Stop command end make a record in the workflow-log.md file.` | Verdict **PASS**. Bounded read-only re-review of the review-remediation diff (6 files in `src/`). Verified resolution of R-01 (date rollover rejected via component bounds & normalization checks), R-02 (`formatSessionStart` non-throwing fallback returning `""` with `list.startUnknown` locale keys), and R-03 (`SessionStatus` derived from `SESSION_STATUSES`). 14 new tests added. All gates (`lint`, `typecheck`, `test`, `build`) pass cleanly. Residual gaps: route-level `errorElement` and downstream mock/UI tasks remain. Role STOPped. | `pending developer review` | `developer go-ahead, then re-dispatch coder for T2 (src/mocks/scenario.ts)` |
| `2026-09-02T19:23+02:00` | `coder` (log correction) | `After completing the command, stop it and log the action in the workflow-log.md file.` | Verified that the remediation pass had already STOPped and been recorded, then found and fixed a defect in this log: the `api-integration` revision 2 row and record were stamped `19:05`, placing the contract amendment after the `18:55` coder pass that implements it. Restamped to the evidence-backed range `18:40-18:53` (first review `18:37`; remediation Vitest `Start at 18:54:09`). Documentation-only; no source file, contract, or verdict touched. Recorded as correction 4 below. | `pending developer review` | `developer go-ahead, then re-dispatch coder for T2 (src/mocks/scenario.ts)` |
| `2026-09-02T19:34+02:00` | `verify` (T1-T2, T7-T9 pass) | `Launch the command 'verify' to check the implemented code. After completing the command, execute the 'Stop' command and record the results in the workflow-log.md file.` | Verdict **PASS**. Four applicable project-defined checks run read-only from the Application Root against clean tree `1dababc`: `npm run lint`, `npm run typecheck`, `npm run test` (6 files, 44 tests), `npm run build` — every one exits `0`. `npm run format` and `lint:fix` excluded as state-writing; e2e `NOT-APPLICABLE` (no Playwright/Cypress config). Tree byte-identical after the run. Scope caveat: the verdict evidences no sessions acceptance criterion — `handlers.ts` is still an empty array and the router index renders `null`. No failure repaired, no dependency installed, no file edited. Role STOPped after the verdict. | `pending developer review` | `coder` for T3-T6 (MSW handlers + seed), then T10-T14 (routed workspace) |
| `2026-09-02T19:44+02:00` | `code-reviewer` (T2, T9 pass) | `/code-reviewer Launch the command '/code-review' to check the implemented code. After completing the command, execute the 'Stop' command and record the results in the workflow-log.md file.` | Verdict **PASS**. Bounded read-only review of `340100a..b521743` restricted to `src/` (4 files: `scenario.ts`, `scenario.test.ts`, `create-session.ts`, `create-session.test.ts`, 255 insertions). Validated `MockScenario` definitions, URL search param reading, `shouldFailListRequest` latching, canned error bodies, `validateCreateSessionForm` (AC-15/AC-16/AC-17), `buildCreateSessionRequest` (A-04, D-02), and `hasFormErrors`. Zero blocking or should-fix defects. All four project gates pass (44/44 tests). Role STOPped. | `pending developer review` | `coder` for T3-T6 (MSW handlers, seed, in-memory store) then T10-T14 (routed workspace UI) |
| `2026-09-02T20:00+02:00` | `coder` (T3-T6, T10-T14 pass) | `Coder prompt for T3-T6 mock boundary and T10-T14 routed workspace` | 17 files created, 3 modified, 1 deleted. Handlers, store, seed, API wrappers, React Query hooks, UI components, and 44 tests implemented. 88 tests total. One TDD cycle per task. All gates pass. Role STOPped. | `pending developer review` | `verify` and `browser-verify` |
| `2026-09-02T20:06+02:00` | `verify` (T3-T6, T10-T14 pass) | `Launch the command 'verify' to check the implemented code. After completing the command, execute the 'Stop' command and record the results in the workflow-log.md file.` | Verdict **PASS**. Four applicable checks run read-only against committed tree `f10cac8`: `lint`, `typecheck`, `test` (15 files, 88 tests), `build` all pass. Unverified: browser behavior, scenario switch, SW registration. Role STOPped. | `pending developer review` | `browser-verify` |
| `2026-09-02T20:15+02:00` | `browser-verify` (T3-T6, T10-T14 pass) | `Launch the command 'browser-verify' to check the implemented code. After completing the command, execute the 'Stop' command and record the results in the workflow-log.md file.` | Split verdict: **FAIL** on F-01 (`?mock=list-error-once` latch consumed by React StrictMode double mount before paint; AC-05 retry unreachable in browser), **PASS** on all other browser-observable ACs (list, filter, create, loading, empty, error copy, D-04 redirect, D-06 guardrail, mobile 375x812, tab order). Role STOPped. | `pending developer review` | `coder` for F-01 fix |
| `2026-09-02T20:37+02:00` | `coder` (F-01 fix) | `Fix F-01 list-error-once attempt window` | `src/mocks/scenario.ts` attempt window (`LIST_ERROR_ONCE_ATTEMPT_MS = 500`) implemented; 5 unit tests added in `src/mocks/scenario.test.ts` (92 tests total). Proven in real browser: `500` -> error state -> `Try again` -> `200` -> 5 rows. Role STOPped. | `pending developer review` | `browser-verify` for independent re-check |
| `2026-09-02T20:45+02:00` | `browser-verify` (F-01 re-check) | `Launch the command 'browser-verify' to check the implemented code. After completing the command, execute the 'Stop' command and record the results in the workflow-log.md file.` | Verdict **PASS**. F-01 verified closed across 3/3 loads. Full regression sweep passed in real browser (desktop 1280x900, mobile 375x812). Measured retry dead zone ~500ms (self-correcting on next click). Role STOPped. | `pending developer review` | `code-reviewer` |
| `2026-09-02T20:54+02:00` | `code-reviewer` (full workspace implementation & F-01 fix) | `/code-reviewer Launch the command '/code-review' to check the implemented code. After completing the command, execute the 'Stop' command and record the results in the workflow-log.md file.` | Verdict **PASS**. Bounded read-only review of `b521743..working tree` restricted to `src/` (27 files, 1477 insertions, 6 deletions, plus F-01 scenario window update). Verified compliance with AC-01..AC-27 (AC-22 dropped), ED layer rules, zero hardcoded strings, no unauthorized hooks/dependencies. All four quality gates pass cleanly (92/92 tests, lint, typecheck, build). Residual non-blocking items noted. Role STOPped. | `pending developer review` | `docs-generator` / `finishing-branch` |

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

### Prompt: coder (parallel first pass)

Two `coder` agents were dispatched in parallel in one message. The prompt below is the developer's
verbatim instruction to the orchestrator; each agent received the shared rules plus only its own
lane section.

```text
# First-launch prompt — task-001-onboarding-sessions

Launch the first implementation pass for `task-001-onboarding-sessions` using **two `coder`
agents dispatched in parallel, in one message**.

## Context engineering rules — apply to BOTH agents

**Knowledge base.** Read only these, in this authority order. Do not scan the repository broadly,
and do not read the other lane's task sections.

1. `training/frontend-accelerator-onboarding/TASK.md` — wins on any conflict
2. `tasks/task-001-onboarding-sessions/implementation-plan.md` — the step-by-step plan; read the
   header (lines 1–146) plus **only your own lane's task sections**
3. `tasks/task-001-onboarding-sessions/requirements.md` — AC-01..AC-27 are binding (AC-22 dropped)
4. `tasks/task-001-onboarding-sessions/api-integration.md` — binding contract: types, wrapper
   signatures, query keys, POST defaults, seed data, scenario switch, handler algorithms, i18n keys
5. `tasks/task-001-onboarding-sessions/workflow-log.md` — Developer Decisions D-01..D-06 are binding
6. `ARCHITECTURE.md` (sections 3–8, 10), `AGENTS.md`,
   `.claude/skills/react-spa-best-practices/SKILL.md`
7. The specific source files your task sections name — nothing else

There is **no `specs/` folder** in this project. Do not look for one and do not create one.
`training/frontend-accelerator-assessment/` is reference-only; no file under `src/` may import it.

**Isolation and parallelism.** Parallel agents for the mock/data boundary and the presentation
foundations. The two lanes touch strictly disjoint file sets. Never create, edit, or read-then-
assume a file owned by the other lane. If you believe you need something from the other lane, STOP
and report it as a blocker instead of writing a placeholder.

**Architectural standard.** This is a client-only Vite React 19 SPA. There is no backend, no
NestJS, and no Controller/Service/Repository layering. Write code strictly in the ED small-layer
architecture from `ARCHITECTURE.md`:

* `src/app` — routing, providers, layout
* `src/features/<feature>/{model,ui}` — TanStack Query hooks and pure logic in `model/`,
  components in `ui/`
* `src/services` — typed fetch wrappers and transport types
* `src/shared` — i18n, `cn()`, shadcn/ui primitives

Import rules are hard: features must not import app; services must not import app or features;
shared must not import app, features, or services; none of the four layers may import from
`src/mocks` or `src/test`. Apply the React best-practice rules in
`rulesets/framework/shared/react-best-practices/`. Do not add `useMemo`/`useCallback` without a
proven need.

**File naming.** Use the **exact** paths in the plan's "Files Touched" table. Do **not** prefix
files with your skill name — that would break the plan's import graph. Tests are colocated as
`<module>.test.ts(x)`.

**Working rhythm — one TDD cycle per task, no batching.** For each task:
1. Write the failing test.
2. `npx vitest run <test file>` — confirm **red**, and that the failure is the expected one.
3. Write the minimal implementation.
4. `npx vitest run <test file>` — confirm **green**.
5. `npm run lint:fix`.

**Step-by-step control.** Execute your lane's tasks strictly one at a time. After each single
atomic task, stop, list the changed files, and give a short summary of behavior implemented and
checks run with their real results. **Do not `git add`, `git commit`, or push anything** — this
overrides step 5 of the plan's Working Rhythm. I will commit. Do not start the next task without
my explicit go-ahead. Never claim a check you did not run.

## Lane A — mock/data boundary

Tasks **T1 → T2 → T3 → T4 → T5 → T6**, in that order. Read plan sections T1–T6 only.

Owns: `src/services/api/endpoints/sessions.types.ts`, `src/mocks/scenario.ts`,
`src/mocks/data/sessions.seed.ts`, `src/mocks/db/sessions-db.ts`, `src/mocks/handlers.ts`,
`src/services/api/endpoints/sessions.ts`, `src/test/msw.ts`, and their colocated tests.

Stop after **T1** for my go-ahead — T1's exported types are the contract Lane B's later work
depends on.

## Lane B — presentation foundations

Tasks **T7 → T8**, in that order. Read plan sections T7 and T8 only. The plan states both are
independent of T1–T6 and of each other.

Owns: `src/shared/i18n/locales/en/sessions.json`, `src/shared/i18n/locales/ru/sessions.json`,
`src/shared/i18n/sessions-namespace.test.ts`, `src/shared/i18n/index.ts` (register the namespace
only), `src/features/sessions/model/date-time.ts` and its test.

Author the **complete** `sessions` namespace in T7 — the `api-integration.md` section 9 keys plus
the seven presentation keys the plan resolves under FR-07 — in both `en` and `ru`. No hardcoded
UI strings anywhere.

Stop after **T8**. Do not start T9: it consumes `CreateSessionRequest` from Lane A's T1.

## After both lanes report
T9 onward is strictly sequential per the dependency map. Converge, commit, then continue
single-lane.
```

### Convergence Record — coder first pass (T1, T7, T8)

Converged `2026-09-02T18:05+02:00`. The developer stopped the command here; T2 was not dispatched.

Files produced. Nothing staged, nothing committed — the no-commit rule in the dispatch prompt
overrode step 5 of the plan's Working Rhythm.

| File | Lane | State |
| --- | --- | --- |
| `src/services/api/endpoints/sessions.types.ts` | A (T1) | new, untracked |
| `src/services/api/endpoints/sessions.types.test.ts` | A (T1) | new, untracked |
| `src/shared/i18n/locales/en/sessions.json` | B (T7) | new, untracked |
| `src/shared/i18n/locales/ru/sessions.json` | B (T7) | new, untracked |
| `src/shared/i18n/sessions-namespace.test.ts` | B (T7) | new, untracked |
| `src/shared/i18n/index.ts` | B (T7) | modified, registration only (+5/-3) |
| `src/features/sessions/model/date-time.ts` | B (T8) | new, untracked |
| `src/features/sessions/model/date-time.test.ts` | B (T8) | new, untracked |

`src/services/api/endpoints/.gitkeep` was deliberately left in place; its removal belongs to T6.

Gates re-run by the orchestrator against the converged tree, not taken from the agents' reports:

| Command | Real result |
| --- | --- |
| `npm run typecheck` | pass, no output |
| `npm run lint` | `Checked 40 files in 42ms. No fixes applied.` |
| `npm run test` | `Test Files 4 passed (4)`, `Tests 14 passed (14)` |

Independently re-verified, rather than accepted on report: the `sessions` namespace holds 22 keys
with `en`/`ru` parity `true`, covering the 15 `api-integration.md` section 9 keys plus the seven
FR-07 presentation keys (`list.heading`, `list.ariaLabel`, `form.open`, `form.heading`,
`form.title.label`, `form.startsAt.label`, `form.submit`).

Isolation held. Neither lane created, edited, or imported a file owned by the other, and no
placeholder was written for a cross-lane dependency.

Findings carried forward:

1. **Plan defect, T8 step 8.4.** The plan's prose predicts `Tests 8 passed (8)`, but the test file
   the plan dictates contains seven `it(...)` blocks; the real result is `7 passed (7)`, confirmed
   by counting the source. Lane B transcribed the plan verbatim instead of inventing an eighth
   case to make the prose true. AC-02 and AC-17 are both covered. This is an arithmetic slip in
   the plan, for `code-reviewer` to close.
2. **Transient cross-lane typecheck failure, not a defect.** Lane A's mid-flight `npm run
   typecheck` failed on `src/shared/i18n/sessions-namespace.test.ts` with TS2307 for the two
   locale JSON files, because Lane B was then in its red phase. It resolved on its own once T7
   landed, and the converged typecheck passes. A predictable cost of parallel TDD lanes: a
   repo-wide gate run by one lane observes the other lane's red phase.
3. **One unattributable lint fix.** T7's step 5 `npm run lint:fix` reported `Fixed 1 file` while
   Lane A's untracked files were already on disk. Biome does not name the file, so neither lane
   can say whose file was reformatted. Formatting-only either way, and the repository is lint-clean
   now. Lane B scoped its T8 lint to `npx biome check --write src/features/sessions/
   src/shared/i18n/` to avoid repeating it. Worth making repo-wide `lint:fix` a converge-time step
   rather than a per-lane one in any future parallel pass.

State at stop: T1, T7, T8 done and unreviewed by the developer; T2-T6 and T9-T15 not started. The
`writing-plans` role has no row in the Role Decisions table above even though
`implementation-plan.md` exists and was used as the authority for this pass; that row is missing
and should be backfilled by the developer.

### Verification Record — `verify` role, coder first pass

Run `2026-09-02T18:20+02:00`, read-only, against the converged working tree described in the
Convergence Record above. Nothing was staged, committed, installed, or repaired.

Check selection. The Application Root is the Repository Root: a single `package.json`, one
`package-lock.json`, no monorepo workspaces, so no application-root disambiguation was needed.

| Check | Command | Exit code | Decisive output |
| --- | --- | --- | --- |
| Lint + format diagnostics | `npm run lint` (`biome check .`) | `0` | `Checked 40 files in 9ms. No fixes applied.` |
| Typecheck | `npm run typecheck` (`tsc -b --noEmit`) | `0` | no output |
| Unit / integration tests | `npm run test` (`vitest run`) | `0` | `Test Files 4 passed (4)`, `Tests 14 passed (14)` |
| Production build | `npm run build` (`tsc -b && vite build`) | `0` | `✓ 120 modules transformed`, `✓ built in 864ms`, `dist/assets/index-D9TLlf3l.js 364.10 kB │ gzip: 116.53 kB` |

Checks deliberately not run, with reasons:

* `npm run format` — it is `biome format --write .`, which mutates files. Excluded because
  verification is read-only; `npm run lint` already reports formatting diagnostics without writing.
* End-to-end — `NOT-APPLICABLE`. No `playwright.config.*` or `cypress.config.*` exists, and the
  requirements Non-Goals exclude e2e from this task.
* `npm run dev`, `npm run preview`, `npm run test:watch` — long-running servers/watchers, not
  verification gates. The manual browser check remains outstanding and is recorded separately
  under "Manual Browser Observation".

**Verdict: `PASS`.**

All four applicable checks pass. Build output goes to `dist/`, which `.gitignore` line 6 already
ignores; `git status --porcelain` after the run shows only the pre-existing working-tree changes
from the coder pass plus this log, so verification itself modified no tracked file.

Scope caveat, stated so the verdict is not read wider than it is. `PASS` covers only what the
first coder pass produced — T1, T7, T8. The 14 passing tests are 1 pre-existing shell smoke test,
2 transport-type tests, 4 i18n namespace tests, and 7 date/time helper tests. No acceptance
criterion requiring the MSW handlers, the endpoint wrappers, the TanStack Query hooks, or the
routed `/sessions` workspace is evidenced by this run, because none of that code exists yet
(T2-T6, T9-T15 not started). This is a green gate on a partial implementation, not a green gate
on the task.

The `vitest list` inventory also independently re-confirms finding 1 of the Convergence Record:
`src/features/sessions/model/date-time.test.ts` contributes exactly seven test cases, not the
eight the plan's T8 prose predicts.

### Browser Verification Record — `browser-verify` role

Run `2026-09-02T18:29+02:00`. No production code, test, configuration, or data was changed.

Readiness gate. `node ./toolchain/bin/doctor.mjs --json` reported `READY` with all eight checks
`PASS`, including `capability:browser` = `agent-browser@0.32.3 is ready`, `node` = `24.18.0
satisfies the accelerator requirement`, and `hooks:claude` / `hooks:codex` both `ACTIVE`. The role
was therefore **not** `BLOCKED`: browser readiness was available and unused by choice, not denied.

Server discovery. `ps` found no Vite or `npm run dev` process, `lsof` found nothing listening on
any candidate port, and `vite.config.ts` declares no `server.port`, so there was no URL to inherit
and no fixed port to assume. Starting a development server requires explicit developer approval
under this role's Server Discovery And Ownership rules. The approval was requested and **declined**.

**Verdict: `NOT-APPLICABLE`.**

* Exact URL: none — no server was started and no URL was ever resolved.
* Viewports: none exercised.
* Interactions: none.
* Console / network evidence: none collected.
* Adapter session: none opened. The first owned-session command must be `open <actual URL>`;
  with no URL there was nothing legitimate to open, so `agent-browser.mjs` was never invoked.
* Server process started by this role: none. Nothing was stopped, because nothing was owned.

Rationale for the verdict. The first coder pass produced T1 (transport types), T7 (the `sessions`
i18n namespace) and T8 (date/time helpers). None of that has a rendered surface: the `/sessions`
route is registered in T12, the list, filter, and form components arrive in T12-T14, and the MSW
handlers that would answer any request arrive in T5. The only live application code the pass
touched is the namespace registration in `src/shared/i18n/index.ts`, whose runtime initialisation
is already covered by `src/app/App.smoke.test.tsx` and the four i18n namespace tests, all green in
the Verification Record above. A browser run at this point could only have re-confirmed that the
bootstrap shell still renders — it could not have evidenced a single sessions acceptance
criterion.

`NOT-APPLICABLE` is therefore a statement about the target, not about the tooling: the browser
capability was ready and the check was declined as premature.

Outstanding. The manual browser check required by the task remains unperformed, and AC-01 to AC-21
have no real-browser evidence. This role should be re-run once T12-T14 land, at which point the
`?mock=list-error-once` scenario switch from `api-integration.md` section 7 also becomes
exercisable in the browser. Recorded as outstanding under "Manual Browser Observation" below.

### Browser Verification Record — `browser-verify` role, coder first pass

Run `2026-09-02T18:29+02:00`. No production code, test, configuration, or data was edited to make
any check pass.

Readiness gate. `node ./toolchain/bin/doctor.mjs --json` reported every check `PASS`, including
`capability:browser` (`agent-browser@0.32.3` ready), `hooks:claude ACTIVE`, `hooks:codex ACTIVE`,
and `node 24.18.0`. Not `BLOCKED`. The browser adapter's own `doctor` command was not used as the
launch step; the owned session's first adapter command was `open`, per the role contract.

Scope finding, established before the browser was opened. The sessions feature has no rendered
surface at this point in the plan: `src/app/router.tsx` still carries
`{ index: true, element: null }` under the comment "Feature routes are registered here", and
`src/features/sessions/` contains only `model/date-time.ts`, which no component imports. T1's types
are erased at runtime and T8's helpers are unreachable from any rendered component. The only
completed work with a runtime presence in the browser is T7's edit to `src/shared/i18n/index.ts`,
which participates in application boot and could break i18n initialization. The developer approved
proceeding on that reduced scope.

Server ownership. No project server was running. A pre-existing `node .../dsh web` process was
listening on port `3080`; it belongs to the user, is unrelated to this repository, and was left
untouched. This role started `npm run dev` (pid `22969`), which emitted `http://localhost:5173/`,
and stopped that process afterwards. Port `5173` is free again and `3080` is still held by the
user's process.

Session `t001-coder-pass`, opened with `open`, closed with `close` after evidence collection.

| Step | Command / target | Result |
| --- | --- | --- |
| Launch | `open http://localhost:5173/` | `✓ Training Sessions Workspace` |
| Desktop viewport | `set viewport 1440 900` + `snapshot -i` | `heading "Training Sessions Workspace" [level=1]`, i18n copy resolved |
| Mobile viewport | `set viewport 390 844` + `snapshot -i` | same accessible heading, no overflow or layout break |
| Screenshot | `screenshot shell-mobile.png` | captured at 390x844 |
| Console | `console` | vite connect, React DevTools notice, `[MSW] Mocking enabled` — no warning or error, and **no i18next `missingKey` output** |
| Errors | `errors` | empty, at both viewports and after navigation |
| Network | `network requests` | every request `200`; notably `src/shared/i18n/locales/en/sessions.json` and `.../ru/sessions.json` both `200` |
| Route probe | `open http://localhost:5173/sessions` | React Router default boundary: `Unexpected Application Error!` / `404 Not Found` |

**Verdict: `PASS` on regression, `NOT-APPLICABLE` on the feature flow.**

`PASS` covers exactly two claims, both evidenced above: the application shell still boots and
renders after T7's namespace registration, and the `sessions` namespace is genuinely wired into the
real application, not only into tests — the browser fetched both locale files with status `200`
during boot and i18next emitted no missing-key warning. This is stronger evidence than the T7 unit
test alone, which exercises the i18n instance directly rather than through application startup.

`NOT-APPLICABLE` covers every sessions acceptance criterion. AC-01 to AC-21 need the list, the
filter, or the create form, and none of them can be exercised: the `/sessions` route returns a 404
boundary, which is the correct and expected state of the repository after T1, T7, and T8 and is
recorded here as evidence of scope, not as a defect. The `?mock=` scenario switch from
`api-integration.md` section 7 was likewise not exercisable, since no handler or page consumes it
yet.

Consequences for the plan. The T15 manual browser check under "Manual Browser Observation" below
remains genuinely outstanding and is not partially satisfied by this run. `browser-verify` should
be re-run once T12 registers `/sessions` and mounts the workspace, at which point the list, filter,
create, loading, empty, and recoverable-error paths all become observable.

Commit note, added after the fact. The Convergence Record and the Verification Record above both
state that nothing was staged or committed; that was accurate when each was written. The developer
subsequently committed the first coder pass at `2026-09-02T18:21:55+02:00` as `89fcb6d`
("feat: implement sessions API transport types, i18n locale definitions, and domain date-time
utility logic"), covering all eight T1/T7/T8 files. The browser verification above ran against that
committed tree.

### Code Review Record — `code-reviewer` role, coder first pass

Reviewed `2026-09-02T18:37+02:00`, read-only. No code, test, documentation, or ruleset was edited.

Review surface, stated explicitly rather than defaulting to the repository. Base `eac2faf`, head
`89fcb6d`, restricted to `src/`: 8 files, 365 insertions, 3 deletions. The `tasks/` documentation in
that commit was excluded as non-production. Rulesets loaded: `rulesets/common/code-reviewer`
(Evidence-First Review) and `rulesets/framework/code-reviewer`. The Application Root is the
Repository Root; no monorepo disambiguation was needed.

**Verdict: `NEEDS-CHANGES`.**

The verdict is driven by three should-fix findings. Important qualifier: **all three are transcribed
verbatim from `api-integration.md` and are therefore contract defects, not coder defects.** The
`coder` role implemented the accepted contract faithfully, which is the correct behavior; the fixes
belong to `api-integration` amending the contract first.

#### R-01 (should-fix) — `parseLocalDateTime` silently rolls over invalid dates

`src/features/sessions/model/date-time.ts:5-24`. The docstring promises "Returns null when
malformed", but the regex only checks digit *shape* and `new Date(y, m-1, d, ...)` normalizes
out-of-range components instead of rejecting them. Confirmed empirically, not inferred:

| Input | Returned |
| --- | --- |
| `2027-02-30T10:00` | `Tue Mar 02 2027 10:00` |
| `2027-13-01T10:00` | `Sat Jan 01 2028 10:00` |
| `2027-00-10T10:00` | `Thu Dec 10 2026 10:00` |
| `2027-03-14T99:00` | `Thu Mar 18 2027 03:00` |

Failure scenario. A value of `2027-02-30T10:00` reaches the field — pasted, autofilled, or typed
into a `type="datetime-local"` input that a browser degraded to a plain text box. `parseLocalDateTime`
returns a valid `Date`, `isFutureLocalDateTime` returns `true`, AC-17 validation passes, and T9's
`buildCreateSessionRequest` posts `2027-03-02T09:00:00Z`. The session is created on a date the user
never selected, with no message shown. Fix: round-trip guard — rebuild the components from the
constructed `Date` and return `null` unless they match the input. Contract source:
`api-integration.md` section 2.1, lines 53-68.

#### R-02 (should-fix) — `formatSessionStart` throws on an unparseable instant

`src/features/sessions/model/date-time.ts:45-54`. `new Intl.DateTimeFormat(...).format(new Date(isoUtc))`
raises `RangeError: Invalid time value` when `isoUtc` is empty or malformed (confirmed by execution).
`src/app/router.tsx` registers no `errorElement`, so the throw is caught by React Router's default
boundary and replaces the entire workspace with a generic error screen, instead of AC-04's
translated in-place list error with a retry control. Likelihood is currently low because the MSW
seed is controlled, but T12 renders this value straight from response data, so the guard belongs in
the helper. Fix: return an empty string or a translated placeholder when the date is invalid.

#### R-03 (should-fix) — `SessionStatus` and `SESSION_STATUSES` can drift apart

`src/services/api/endpoints/sessions.types.ts:2` and `:5` declare the union and the runtime tuple
independently, with no compile-time link. Failure scenario: a later task adds `"draft"` to
`SessionStatus`; `SESSION_STATUSES` silently stays four entries long; the T5 handler's
`INVALID_FILTER` guard then rejects `?status=draft` with `400` even though the type system says the
value is legal, and `tsc` reports nothing. One-line fix: derive the union with
`export type SessionStatus = (typeof SESSION_STATUSES)[number];`. Contract source:
`api-integration.md` section 3, lines 219-223.

#### Nits and residual gaps — non-blocking, no change required to close the verdict

* **N-01** `src/services/api/endpoints/sessions.types.test.ts:9-12` is near-tautological. Its runtime
  assertion is a strict subset of the preceding case, and its real content
  (`const filterStatus: SessionStatus = "scheduled"`) is a compile-time check Vitest cannot fail.
  `AGENTS.md` prefers behavior-level tests.
* **N-02** No `react-i18next` `CustomTypeOptions` augmentation, although `resources` is already
  exported `as const` in `src/shared/i18n/index.ts`. Without it a mistyped key in T12-T14 renders the
  raw key string at runtime rather than failing `tsc`. Cheap safeguard for the 22 keys now in place.
* **N-03** `en.list.heading` and `en.list.ariaLabel` are the identical string "Training sessions".
  If T12 applies both to the same region, assistive technology announces the label twice;
  `aria-labelledby` pointing at the heading is the better pattern. The `ru` pair correctly differs
  ("Тренировки" / "Список тренировок").
* **N-04** No key exists for a form cancel or close control. D-05 closes the form on success, but if
  T14 adds any dismiss affordance the namespace cannot cover it without breaking the
  no-hardcoded-strings rule. Add the key at that point rather than now.
* **N-05** Coverage gaps: nothing pins the R-01 rollover behavior, the `?? "en"` default-locale
  branch of `formatSessionStart`, or its invalid-input behavior.
* **N-06** `src/shared/i18n/sessions-namespace.test.ts:54-69` asserts exact copy strings, so any
  `ui-designer` copy revision breaks the suite. Deliberate for i18n proof, but worth knowing.
* **N-07** Already recorded in the Convergence Record: the plan's T8 prose predicts 8 tests, the
  dictated file contains 7.

#### Explicitly checked and found sound

Layer boundaries hold: `date-time.ts` imports nothing from `app`, `services`, `mocks`, or `test`,
and `sessions.types.ts` imports nothing at all. No `useMemo`, `useCallback`, or `React.memo` was
introduced, matching the plan's global constraint. No `any`, no non-null assertion. The i18n key
parity test is structural rather than hardcoded to one locale. `toIsoUtcSeconds` truncates rather
than rounds, matching the seed format. `isFutureLocalDateTime` floors both sides, so the
current-minute rejection in AC-17 is genuinely proven. The Russian copy correctly distinguishes the
plural filter label ("Запланированные") from the singular status badge ("Запланирована"), which a
naive translation would have collapsed.

Recommended follow-up, not invoked: `api-integration` to amend the contract for R-01 and R-03,
then `coder` to apply the amendments together with R-02. T2 does not depend on any of the three and
remains unblocked.

### API Integration Amendment Record — `api-integration` role, revision 2

Amended `2026-09-02T18:40-18:53+02:00` in response to the `code-reviewer` `NEEDS-CHANGES` verdict
above. (Corrected stamp — this record and its table row originally read `19:05`, which placed the
amendment *after* the `18:55` coder pass that consumes it. See correction 4 below.)
Only `tasks/task-001-onboarding-sessions/api-integration.md` was edited. No production code, test,
locale file, or ruleset was touched — the `coder` role applies the amendments.

**Provenance accepted without dispute.** The reviewer's central claim is correct and is the reason
this role ran before `coder`: R-01, R-02, and R-03 all quote code that revision 1 of
`api-integration.md` dictated verbatim. They are contract defects. The `coder` role reproduced the
accepted contract faithfully, which is the right behavior under Contract Authority, and no coder
correction is recorded against this pass.

**A-01 closes R-01.** `parseLocalDateTime` now range-checks hour and minute before constructing the
`Date`, then rejects any calendar component the constructor normalized away. Re-verified by
execution rather than inference, in both directions:

| Input | Revision 1 | Revision 2 |
| --- | --- | --- |
| `2027-02-30T10:00` | `Tue Mar 02 2027 10:00` | `null` |
| `2027-13-01T10:00` | `Sat Jan 01 2028 10:00` | `null` |
| `2027-00-10T10:00` | `Thu Dec 10 2026 10:00` | `null` |
| `2027-03-14T99:00` | `Thu Mar 18 2027 03:00` | `null` |
| `2027-03-14T18:60` | `Sun Mar 14 2027 19:00` | `null` |
| `2027-02-29T10:00` (non-leap) | `Mon Mar 01 2027 10:00` | `null` |
| `0000-01-01T00:00` | `Jan 01 1900` (legacy 2-digit-year mapping) | `null` |
| `2028-02-29T10:00` (leap) | `Tue Feb 29 2028 10:00` | unchanged |
| `2027-03-14T18:30` | `Sun Mar 14 2027 18:30` | unchanged |

The clock components are range-checked numerically instead of being round-tripped through the
constructed `Date`. That is a deliberate design choice, not an oversight: round-tripping
`getHours()` would reject a DST spring-forward gap time and show "must be in the future" for a date
the user picked correctly. Confirmed under `TZ=America/New_York` that `2027-03-14T02:30` still
returns `Sun Mar 14 2027 03:30` — roll-forward preserved, calendar day unchanged, so the day
round-trip stays safe. Recorded as accepted risk 7 in section 12.

**A-02 closes R-01's sibling R-02.** `formatSessionStart` returns `""` when the instant is
unparseable instead of raising `RangeError`. Confirmed by execution for `""`, `"not-an-instant"`,
and `"2027-13-45"`. Section 8 gains a matrix row and section 9 gains `list.startUnknown` in both
locales, so the row renders translated placeholder copy rather than an empty cell or a hardcoded
string. The reviewer's `errorElement` observation about `src/app/router.tsx` is correct but is not
resolved here: A-02 removes the throw at its source, which is this document's remit, while adding a
route boundary is an `architect` / `coder` decision about a layer this document does not own. That
split is stated explicitly in section 13.2 so it is not read as an omission.

**A-03 closes R-03.** `SESSION_STATUSES` moves above `SessionStatus`, and the union is derived as
`(typeof SESSION_STATUSES)[number]`. The exported name and its four members are unchanged, so no
import site breaks. Section 3's placement note was updated: if the constant ever moves to
`sessions.ts` for a types-only file policy, the derived union must move with it.

**Coverage added.** Section 10 gains items 6b and 6c, which pin the validity table, the
`isFutureLocalDateTime` mirror assertion that AC-17 actually depends on, the non-throwing render
path, and the previously untested `?? "en"` default-locale branch. Together these close review nit
N-05. The tests deliberately do not assert DST behavior, which is machine-zone dependent.

**Not changed, with reasons in section 13.2.** N-01, N-06, N-07 (test-authoring judgment, owned by
`coder` / `test-generator`); N-02 (`CustomTypeOptions` augmentation — a worthwhile repository-wide
i18n typing safeguard, but not an API contract element, and it applies to `common` as much as to
`sessions`); N-03 (`en.list.heading` / `en.list.ariaLabel` duplication — both are `ui-designer` copy
added during implementation, neither appears in section 9, and the `aria-labelledby` fix is the
right call for that role); N-04 (form cancel key — section 9 already assigns form control copy to
`ui-designer`, to be added when T14 introduces the control rather than speculatively).

**Contract status unchanged.** There is still no backend and no backend owner. A-01 and A-02 are
client-side validity and rendering guards over a client-owned mock and assert nothing about server
behavior. Nothing in `api-integration.md` may be promoted to `specs/api-integration.md`; `specs/`
still does not exist in this repository.

**Next action.** `coder` applies A-01 and A-02 to `src/features/sessions/model/date-time.ts`, A-03
to `src/services/api/endpoints/sessions.types.ts`, and `list.startUnknown` to both
`src/shared/i18n/locales/{en,ru}/sessions.json`, together with the section 10.6b/10.6c tests. All
three changes are additive and local; no signature in `api-integration.md` sections 4 or 5 changes.
T2 (`src/mocks/scenario.ts`) depends on none of them and remains unblocked.

### Log Correction — timestamp ordering, `api-integration` revision 2

Corrected `2026-09-02T19:23+02:00` by the `coder` role while verifying that the remediation pass had
been logged as instructed.

**4. Amendment row and record were stamped after the pass they feed.** The
`api-integration` revision 2 row and its record both read `2026-09-02T19:05+02:00`, while the
`coder` remediation pass that consumes those amendments read `18:55`. That inverted the causal
chain the entire review sequence documents: the contract amendment is what the coder pass
implements, so it cannot follow it. The `19:05` value was invented at write time rather than
observed.

Evidence for the true ordering, from artifacts rather than recollection: the first `code-reviewer`
verdict that triggered the amendment is stamped `18:37`, and the remediation pass's own Vitest runs
report `Start at 18:54:09` and `18:54:29`. The amendment therefore ran between `18:37` and `18:54`.
Both the row and the record now read `18:40-18:53+02:00`, a range rather than a false precision,
matching the range convention already used by the `06:02-06:07` and `18:01-18:03` rows. Table order
is now chronological without moving any row. No other timestamp was altered, and no content of the
amendment or the coder record changed.

Scope note: this correction is documentation-only. It does not affect `api-integration.md`, any
source file, or the `code-reviewer` `PASS` verdict recorded below, which reviewed the code and not
the log.

### Coder Record — review-remediation pass (A-01, A-02, A-03)

Implemented `2026-09-02T18:55+02:00`. Applies the three amendments from `api-integration.md`
revision 2 (section 13). Six files changed, all inside the Application Root, which is the
Repository Root. Rulesets loaded: `rulesets/common/coder` (TypeScript And Project Fit, Essential
Behavior Tests) and `rulesets/framework/coder`. The React sections of the framework index did not
apply — this pass touches no component, hook, state, or effect.

**TDD cycle, one iteration.** Tests were written first and run before any production edit. Red was
genuine and specific, not an unresolved import: **14 failures** — the ten component-validity cases,
the three `formatSessionStart` cases (`RangeError: Invalid time value`, exactly as R-02 predicted),
and the `isFutureLocalDateTime` mirror. The leap-year case passed before the change, which confirms
the new guard did not simply reject everything. Green after the edit: 23 tests in the file,
30 repo-wide.

**A-01 — `src/features/sessions/model/date-time.ts`.** `parseLocalDateTime` range-checks hour and
minute against `MAX_HOUR` / `MAX_MINUTE` before constructing the `Date`, then rejects any calendar
component the constructor normalized away. Ten rejection cases are pinned table-driven, including
two the review did not list: `2027-02-29T10:00` (Feb 29 outside a leap year) and `0000-01-01T00:00`
(the legacy two-digit-year remap to 1900). `2028-02-29T10:00` is asserted still valid, so the guard
is proven to reject invalid dates rather than all edge dates. Hour and minute are deliberately not
round-tripped through the constructed `Date`; the reason is recorded in a code comment so a future
reader does not "tighten" it and silently break DST handling.

**A-02 — same file.** `formatSessionStart` returns `""` for an unparseable instant instead of
throwing. Three inputs are pinned (`""`, `"not-an-instant"`, `"2027-13-45"`), each asserted both
`not.toThrow()` and `toBe("")` — the throw assertion is the one that matters, since it is the
route-boundary escalation R-02 described. The previously untested `?? "en"` default-locale branch
is now covered by an exact-output assertion under a fixed `timeZone`, closing nit N-05.

**A-03 — `src/services/api/endpoints/sessions.types.ts`.** `SESSION_STATUSES` moved above
`SessionStatus`; the union is now `(typeof SESSION_STATUSES)[number]`. **No test was added, on
purpose.** Once the union is derived, any runtime assertion that the two agree is true by
construction and would be exactly the near-tautological pattern the reviewer flagged as N-01. The
guarantee is a compile-time one, so it was verified with a compile-time probe instead: a throwaway
file asserting `const bad: SessionStatus = "draft"` produced exactly one `TS2322` error against the
current tuple, and adding `"draft"` to the **tuple alone** dropped that to zero errors — the union
now tracks the tuple automatically. The probe file and the temporary tuple edit were both reverted;
`git status` confirms neither survives in the tree. Public surface is unchanged: same export name,
same four members, so no import site is affected.

**`list.startUnknown`.** Added to `src/shared/i18n/locales/{en,ru}/sessions.json`
("Start time unavailable" / "Время начала недоступно") and to the key inventory in
`src/shared/i18n/sessions-namespace.test.ts`. The namespace is now 23 keys at `en`/`ru` parity; the
structural parity test covers the new pair automatically. No consumer renders it yet — T12 will,
when a row's `formatSessionStart` returns `""`.

**Checks run, all after the edit, none repaired by hand.** `npm run lint` initially failed on one
Biome formatting complaint about the `new Date(...)` argument list; `npm run lint:fix` collapsed it
to one line and lint is clean. `npm run typecheck`, `npm run test` (4 files, 30 tests), and
`npm run build` all pass. No dependency was installed, no configuration edited, no unrelated
refactor performed.

**Scope deliberately not touched.** The `errorElement` half of R-02 remains open by design: A-02
removes the throw at its source, and registering a route boundary in `src/app/router.tsx` is an
`architect` / `coder` decision recorded in `api-integration.md` section 13.2. Nits N-01, N-02, N-03,
N-04, N-06, and N-07 were likewise left alone for the reasons recorded there; N-05 is closed by this
pass. `specs/` still does not exist and was not created — this pass establishes no durable truth
beyond the task.

**Remaining risk.** The DST behavior preserved by A-01 is machine-zone dependent and is therefore
deliberately not asserted in the suite; it was verified once by hand under `TZ=America/New_York`
during the contract amendment. A test that pins it would need a fixed `TZ` for the whole Vitest run,
which `api-integration.md` section 2.1 rejects as outside this task's blast radius.

### Code Review Record — `code-reviewer` role, review-remediation pass

Reviewed `2026-09-02T19:08+02:00`, read-only evidence-based re-review.

Review surface, stated explicitly: bounded diff of the remediation pass against commit `89fcb6d`, restricted to `src/` (6 files: `date-time.ts`, `date-time.test.ts`, `sessions.types.ts`, `locales/en/sessions.json`, `locales/ru/sessions.json`, `sessions-namespace.test.ts`). Rulesets loaded: `rulesets/common/code-reviewer` (Evidence-First Review) and `rulesets/framework/code-reviewer`.

**Verdict: `PASS`.**

#### Findings Status from Previous Review

* **R-01 (closed):** `parseLocalDateTime` in `src/features/sessions/model/date-time.ts:28-47` now explicitly range-checks `parsedHour > 23` and `parsedMinute > 59`, and performs calendar normalization checks (`getFullYear()`, `getMonth()`, `getDate()`) against input numbers. Malformed/out-of-range dates (e.g. `2027-02-30T10:00`, `2027-13-01T10:00`, `2027-03-14T99:00`, `0000-01-01T00:00`) reliably return `null` instead of rolling over. Non-round-tripping hour/minute preserves DST transition handling. Verified by 10 table cases + leap-year test in `date-time.test.ts`.
* **R-02 (closed):** `formatSessionStart` in `src/features/sessions/model/date-time.ts:79-82` checks `Number.isNaN(instant.getTime())` and returns `""` on unparseable input (`""`, `"not-an-instant"`, `"2027-13-45"`) rather than throwing `RangeError: Invalid time value`. `list.startUnknown` added to `en` and `ru` locale definitions. Verified with non-throwing assertions in `date-time.test.ts`.
* **R-03 (closed):** In `src/services/api/endpoints/sessions.types.ts:8-10`, `SessionStatus` is derived as `(typeof SESSION_STATUSES)[number]`, ensuring compile-time synchronization with the runtime tuple.
* **N-05 (closed):** Added test coverage for invalid date parsing table, leap years, `isFutureLocalDateTime` calendar rejection, `formatSessionStart` error paths, and default `"en"` locale fallback.

#### Explicitly checked and verified sound

1. **Architecture & layer boundaries:** No forbidden imports across ED layers (`date-time.ts` has zero dependencies on `app`, `services`, `mocks`, or `test`; `sessions.types.ts` has zero imports).
2. **Type safety:** Strict TypeScript passes with zero errors (`tsc -b --noEmit`).
3. **Lint & formatting:** Biome check clean (`biome check .`).
4. **Test suite:** 4 test files, 30 tests pass (`vitest run`).
5. **i18n parity:** 23 keys in both `en` and `ru` locale files verified structurally.

#### Residual gaps and risks (non-blocking)

* **Route Error Boundary:** `src/app/router.tsx` does not yet declare a route-level `errorElement`. Handled by design at the date-time helper level (A-02) to prevent escalation, but full route boundary remains deferred to route wiring in T12.
* **DST Machine-Zone Dependency:** Spring-forward DST behavior is verified manually under `TZ=America/New_York` but not pinned in Vitest suite to prevent test failures on non-DST environments.
* **Downstream Tasks:** Mock handlers (T2–T6) and UI presentation/forms (T9–T14) have not yet landed.

Recommended next role: `coder` for T2 (`src/mocks/scenario.ts`).

### Verification Record — `verify` role, T1-T2 / T7-T9 pass

Verified `2026-09-02T19:34+02:00`, read-only. No file was created, edited, or repaired; no
dependency installed; no configuration or lockfile touched.

**Context resolution.** One `package.json` at the Repository Root and no nested manifests, so the
Application Root *is* the Repository Root and no monorepo disambiguation was required. Package
manager resolved from evidence rather than assumption: `package-lock.json` is present,
`pnpm-lock.yaml` and `yarn.lock` are absent, which matches the NPM-only rule in `AGENTS.md`.
`packageManager` is unset in the manifest — worth noting but not blocking.

**Check selection.** Nine scripts exist; four are applicable read-only verification checks. The
selection and its exclusions:

| Command | Exit | Result |
| --- | --- | --- |
| `npm run lint` (`biome check .`) | `0` | 44 files checked, no fixes applied |
| `npm run typecheck` (`tsc -b --noEmit`) | `0` | no diagnostics |
| `npm run test` (`vitest run`) | `0` | 6 files, 44 tests, all passing |
| `npm run build` (`tsc -b && vite build`) | `0` | built in ~0.8s; 364.20 kB JS / 12.92 kB CSS |
| `npm run format` | not run | **excluded**: `biome format --write` rewrites source files |
| `npm run lint:fix` | not run | **excluded**: `biome check --write` rewrites source files |
| `npm run dev` / `preview` | not run | long-running servers, not verification checks |
| e2e | not run | `NOT-APPLICABLE` — no Playwright or Cypress config in the repository |

Exit codes were captured directly from each command rather than inferred from output text. A first
attempt read `$PIPESTATUS` through an intervening `echo`, which silently lost the value and printed
an empty `EXIT=`; the run was repeated capturing `$?` per command so every code above is observed,
not assumed.

**Read-only confirmed by evidence, not assertion.** The tree was clean at `1dababc` before the run
and byte-identical after it (`git status --short` empty, `HEAD` unmoved). `npm run build` does write,
but only to `dist/`, which `.gitignore:6` excludes — checked before running rather than assumed.

**The suite was inspected, not just counted.** A green total can hide vacuous or skipped tests, so
the run was repeated with `--reporter=verbose`: all 44 are named, substantive, and none is skipped
or todo. They cover the transport types, the A-01 validity table including both cases added beyond
the review's list, the A-02 non-throwing render path, `create-session` validation and defaults, the
`?mock=` scenario switch, i18n `en`/`ru` key parity, and one app-shell smoke test.

**Scope of this verdict — read this before treating `PASS` as done.** `PASS` covers exactly the four
commands above against the current tree. It evidences **no sessions acceptance criterion**. AC-01 to
AC-21 all need the list, the filter, or the create form, and none is reachable: `src/mocks/handlers.ts`
is still `export const handlers: RequestHandler[] = []`, so no `/api/sessions` request is served, and
`src/app/router.tsx:10` still renders `{ index: true, element: null }` with no `/sessions` route. The
implemented surface is model, type, mock-scenario, and i18n code with unit coverage — correct for the
tasks completed, and not yet a working feature. Anyone reading this `PASS` as "the onboarding flow
works" would be misreading it.

**Not re-verified here.** The `code-reviewer` `PASS` at `19:08` covered the remediation diff; this
role does not re-review code, and a passing gate is not a substitute for that review. The DST
behavior preserved by A-01 remains unpinned by the suite by deliberate design (machine-zone
dependent), so these green tests do not evidence it.

**Next.** `coder` for T3-T6 (MSW handlers, seed data, the in-memory store) and then T10-T14 (the
routed workspace and its UI). `browser-verify` stays not-applicable until `/sessions` renders.

### Code Review Record — `code-reviewer` role, T2 and T9 pass

Reviewed `2026-09-02T19:44+02:00`, read-only evidence-based review.

**Review surface:** Bounded diff `340100a..b521743` restricted to `src/` (4 files, 255 insertions: `src/mocks/scenario.ts`, `src/mocks/scenario.test.ts`, `src/features/sessions/model/create-session.ts`, `src/features/sessions/model/create-session.test.ts`). Rulesets loaded: `rulesets/common/code-reviewer` (Evidence-First Review) and `rulesets/framework/code-reviewer`.

**Verdict: `PASS`.**

#### Findings

No blocking or should-fix findings.

#### Detailed Code Analysis

1. **`src/mocks/scenario.ts` & `src/mocks/scenario.test.ts` (T2 / FR-03 / Q-07):**
   - `MockScenario` union and `MOCK_SCENARIOS` constant match the contract (`"normal" | "empty" | "slow" | "list-error" | "list-error-once" | "create-error"`).
   - `currentScenario()` safely handles server/Node runtime (`typeof window === "undefined"`) and parses the page URL's `?mock=` search parameter with fallback to `"normal"`.
   - `shouldFailListRequest(scenario)` correctly implements the single-fire latch for `"list-error-once"` and continuous error for `"list-error"`.
   - `LIST_ERROR_BODY` and `CREATE_ERROR_BODY` are typed against `ApiErrorBody` with exact contract codes (`"SESSIONS_UNAVAILABLE"`, `"CREATE_SESSION_FAILED"`).
   - Unit tests thoroughly cover default, valid scenario param, invalid fallback, latch state behavior, and canned error structures.

2. **`src/features/sessions/model/create-session.ts` & `src/features/sessions/model/create-session.test.ts` (T9 / AC-14..AC-17 / D-02 / A-04):**
   - Boundaries `TITLE_MIN_LENGTH = 3` and `TITLE_MAX_LENGTH = 80` enforced on trimmed title.
   - `CREATE_SESSION_DEFAULTS` holds the 7 fixed contract fields specified by D-02 and satisfies `Omit<CreateSessionRequest, "title" | "startsAt">`.
   - `CreateSessionFieldError` returns i18n key suffixes (`"titleLength" | "startsAtRequired" | "startsAtFuture"`), preserving the zero-hardcoded-strings rule and matching `src/shared/i18n/locales/{en,ru}/sessions.json` keys under `form.validation.*`.
   - `validateCreateSessionForm` distinguishes missing start (`startsAtRequired`) from past or invalid calendar start (`startsAtFuture`) using `isFutureLocalDateTime`.
   - `buildCreateSessionRequest` trims title, verifies parsed local date validity (throwing if called with unvalidated input), converts to ISO 8601 UTC via `toIsoUtcSeconds`, and bundles default fields.
   - Tests comprehensively verify 3 and 80 character boundaries, whitespace trimming, past/missing dates, and request object generation.

3. **Architecture & layer boundaries:**
   - `create-session.ts` strictly imports from `@/services/api/endpoints/sessions.types` and sibling `./date-time`.
   - `scenario.ts` imports only `type { ApiErrorBody }` from `@/services/api/endpoints/sessions.types`.
   - Zero illegal imports from `app`, `mocks`, or `test` into feature/service layers.

4. **Quality gates verified:**
   - `npm run lint` — Biome clean (44 files checked, 0 errors).
   - `npm run typecheck` — TypeScript strict clean (`tsc -b --noEmit`).
   - `npm run test` — 6 test files, 44 tests pass.
   - `npm run build` — Production build clean.

#### Residual gaps and risks (non-blocking)

* **Downstream Handlers & Store (T3–T6):** `src/mocks/handlers.ts` is still empty; MSW integration and in-memory store (`sessions-db.ts`) remain to be implemented.
* **Downstream UI & Routing (T10–T14):** Workspace components (`/sessions` route, list, filter, form UI) have not yet been wired.
* **Scenario Latch Scope:** `listErrorOnceUsed` in `scenario.ts` is module-scoped without a programmatic reset export; harmless as tests use `server.use({ once: true })` per specification, while browser creates a fresh module instance per page load.

Recommended next role: `coder` for T3–T6 (`src/mocks/data/sessions.seed.ts`, `src/mocks/db/sessions-db.ts`, `src/mocks/handlers.ts`, `src/services/api/endpoints/sessions.ts`, `src/test/msw.ts`).

### Coder Record — T3-T6 (mock boundary) and T10-T14 (routed workspace)

Implemented `2026-09-02T20:00+02:00`. Application Root is the Repository Root. Rulesets loaded:
`rulesets/common/coder` (TypeScript And Project Fit, Essential Behavior Tests) and
`rulesets/framework/coder` (the React sections apply to T12-T14). No runtime documentation lookup
was needed: every API used here is already in the repository (`msw`, `@tanstack/react-query`,
`react-router`, `react-i18next`), so no `ctx7` call was made and no documentation evidence is
claimed.

**Commits deliberately not made.** The developer asked to own the commits; every plan step ending in
`git commit` was skipped. The whole change sits uncommitted in the working tree.

**TDD, nine cycles, one per task.** Each cycle wrote the test file first and ran it red before any
production file existed. Red was verified specific, not merely assumed:

| Task | Red observed | Green |
| --- | --- | --- |
| T3 seed | `Failed to resolve import "./sessions.seed"` | 6 passed |
| T4 store | `Failed to resolve import "./sessions-db"` | 5 passed |
| T5 handlers | 7 failed, all `[MSW] Cannot bypass a request when using the "error" strategy` — the empty handler array, exactly as the plan predicted | 7 passed |
| T6 wrappers | `Failed to resolve import "@/test/msw"` | 5 passed |
| T10 list query | `Failed to resolve import "./sessions-query"` | 4 passed |
| T11 create mutation | `Failed to resolve import "./use-create-session-mutation"` | 2 passed |
| T12 list UI | `Failed to resolve import "@/test/render-app"` | 7 passed |
| T13 filter | 3 failed, `Unable to find a label with the text of: Status` | 3 passed |
| T14 form | 5 failed, `Unable to find an accessible element with the role "button" and name "New session"` | 5 passed |

**Files created (17).** `src/mocks/data/sessions.seed.ts` + test; `src/mocks/db/sessions-db.ts` +
test; `src/mocks/handlers.test.ts`; `src/services/api/endpoints/sessions.ts` + test;
`src/test/msw.ts`; `src/test/render-app.tsx`;
`src/features/sessions/model/{sessions-query.ts,use-create-session-mutation.ts}` + their two tests;
`src/features/sessions/ui/{SessionsList.tsx,SessionsListSection.tsx,SessionsWorkspacePage.tsx,StatusFilter.tsx,CreateSessionForm.tsx}`
plus `SessionsWorkspacePage.{list,filter,create}.test.tsx`; `src/features/sessions/index.ts`.

**Files modified (3), deleted (1).** `src/mocks/handlers.ts` (both endpoints registered),
`src/app/router.tsx` (`/` redirects to `/sessions`; `/sessions` renders the workspace through the
feature barrel), `src/app/App.smoke.test.tsx` (now asserts the redirect rather than passing
incidentally). `src/services/api/endpoints/.gitkeep` deleted — the directory now holds real modules.

**Behavior implemented.** `GET /api/sessions` serves the five-record seed from an in-memory store,
filters by `status`, computes `meta.total` after filtering, rejects an unsupported status with
`400 INVALID_FILTER`, and honours the `empty` / `slow` / `list-error` / `list-error-once` scenarios.
`POST /api/sessions` validates the body, resolves the coach, inserts a `scheduled` record with a
`ses_9xx` id, and answers `201` with a `SessionDetails`; a created session survives the next list
read. The `/sessions` workspace renders all four list states (loading, empty, error with a working
`Try again`, populated), an `All` + `Scheduled` status filter that owns its value in the page URL,
and a create form with inline validation, a disabled pending submit, and close-on-success. The full
path is `UI -> feature model hook -> services/api/endpoints/sessions.ts -> services/api/http.ts`;
no feature file calls `fetch`.

**Deviations from the plan, both deliberate and small.**

1. `SessionsList` renders `t("list.startUnknown")` when `formatSessionStart` returns `""`, instead
   of emitting an empty `<time>`. The plan's T12 snippet omitted this, but the review-remediation
   pass added the key for exactly this consumer ("No consumer renders it yet — T12 will"). No test
   asserts it, because producing an unparseable `startsAt` would require overriding the handler to
   serve a malformed row; the branch is a two-line guard over an already-tested helper.
2. The seed shifts `ses_104` and `ses_105` from 2027 to 2026 so `cancelled` and `completed` sit in
   the past, as the plan's own deviation note requires. AC-02's probe value is untouched.

**Checks run after the edits, in this order.** `npm run lint:fix` (10 files reformatted — import
ordering only, no logic touched), then `npm run lint` clean over 66 files; `npm run typecheck`
clean; `npm run test` **15 files, 88 tests, all passing** — matching the plan's expected count for
T14; `npm run build` clean (382.68 kB / 122.31 kB gzip). Nothing was repaired by hand and no
dependency or configuration was changed.

**Layer assertions re-run at the end.** `@/mocks` and `@/test` appear in no production file under
`src/app`, `src/features`, `src/services`, `src/shared` (colocated tests reach the boundary only
through `@/test/msw`); no file outside `src/app` imports `@/app`; `fetch(` appears in no file under
`src/features` (the one grep hit is `query.refetch()`); no `useMemo`, `useCallback`, or `React.memo`
was introduced.

**Unverified state and remaining risk.**

* **No browser observation.** T15 was out of the requested scope, so `npm run dev` was not started
  and the `?mock=` scenario switch, which reads the real page URL, has never been exercised against
  a running worker. A memory router cannot observe it; the T13 filter test documents this rather
  than covering it. `browser-verify` is now applicable for the first time.
* **The seed's future/past assertion is a time bomb.** `sessions.seed.test.ts` asserts that
  `scheduled` and `full` sit in the future; that test starts failing after 2027-08-03. This is the
  accepted consequence of D-03 and is recorded here as the plan's T15 asks.
* **Nothing in `specs/` was written.** The directory still does not exist and this pass establishes
  no durable truth beyond the task.
* The `listErrorOnceUsed` latch in `src/mocks/scenario.ts` still has no programmatic reset, so the
  `list-error-once` scenario is a per-page-load behavior only, unchanged from the previous pass.

**Stop.** Scoped behavior for T3-T6 and T10-T14 is complete and its essential tests pass; no check
exposed a specialist problem and no decision was left unresolved. Per the Stop Contract this role
does not invoke the next command. The natural next steps are the developer's commits, then
`browser-verify` for the manual observation and `verify` / `code-reviewer` for T15's gates.

### Verification Record — `verify` role, T3-T6 and T10-T14 pass

Verified `2026-09-02T20:06+02:00`, read-only. No file was created, edited, or repaired; no
dependency installed and no configuration touched. Rulesets loaded: `rulesets/common/verify` and
`rulesets/framework/verify`.

**Context resolution.** One frontend application, no monorepo: a single `package.json` at the
Repository Root and no nested manifest. `package-lock.json` is the only lockfile, so the package
manager is **npm**, matching the AGENTS.md non-negotiable. Application Root = Repository Root; no
selection was required.

**Surface verified.** Commit `f10cac8` — "feat: implement sessions feature module with CRUD
operations, status filtering, and associated testing infrastructure", 27 files, 1477 insertions,
6 deletions. The working tree is **clean**: `git status --short` is empty and there are zero
untracked files, so the checks below ran against exactly the committed state, with nothing
uncommitted inflating or masking the result.

**Verdict: `PASS`** — every applicable check the repository defines exits `0`.

| Check | Command | Exit | Decisive output |
| --- | --- | --- | --- |
| Format + lint | `npm run lint` (`biome check .`) | `0` | `Checked 66 files in 57ms. No fixes applied.` |
| Typecheck | `npm run typecheck` (`tsc -b --noEmit`) | `0` | no diagnostics |
| Tests | `npm run test` (`vitest run`) | `0` | `Test Files 15 passed (15)` / `Tests 88 passed (88)` |
| Build | `npm run build` (`tsc -b && vite build`) | `0` | `✓ 132 modules transformed`, `✓ built in 846ms`; `dist/assets/index-DiVBwHjC.js 382.68 kB │ gzip: 122.31 kB` |

Biome is the single formatter and linter here, so `npm run lint` is both gates; `format` and
`lint:fix` were **not** run — they write, and this role does not modify the tree.

**Not applicable.** No end-to-end tooling exists in the repository (no Playwright or Cypress
configuration, no `e2e/` directory), so there is no e2e check to select. `dev` and `preview` are
long-running servers, not checks. `test:watch` is the interactive form of a check already run.

**What this `PASS` does and does not evidence.** It evidences that the committed sessions feature
compiles, lints, builds, and satisfies its own 88 assertions across 15 files — this time including
the routed workspace, which the previous `PASS` at `19:34` explicitly could not claim. `/sessions`
now exists and the suite exercises the list, filter, and create flows through the real router and
the real MSW boundary.

It does **not** evidence anything observed in a real browser. This role runs the project's checks;
it does not start `npm run dev` and does not drive a page. Three things therefore remain unverified
by evidence, unchanged from the `coder` record above:

* The `?mock=` scenario switch reads `window.location.search` on the *page*, which a Vitest memory
  router never sets. Every scenario branch in `src/mocks/handlers.ts` other than the default path is
  reached in tests only through `server.use(...)` overrides, never through `currentScenario()`.
* The service worker registration path (`src/mocks/browser.ts`, `public/mockServiceWorker.js`) is
  not exercised by the node-side MSW server the tests use.
* Rendered layout, focus order, and contrast are outside a headless assertion suite.

`browser-verify` is applicable for the first time and is the role that closes those three.

**Known time bomb, not a current failure.** `src/mocks/data/sessions.seed.test.ts` asserts that the
`scheduled` and `full` seed rows sit in the future. That assertion is true today and becomes false
after `2027-08-03`, at which point this same `PASS` turns into a `FAIL` with no code change. It is
the accepted consequence of D-03 and is recorded here so a future run is not misdiagnosed.

**Stop.** The verdict stands as reported. Per the Stop Contract this role repairs nothing and does
not invoke the next command.

### Browser Verification Record — `browser-verify` role, T3-T6 / T10-T14 pass

Verified `2026-09-02T20:15+02:00`. No production file, test, configuration, or fixture was edited.
Rulesets loaded: `rulesets/common/browser-verify` and `rulesets/framework/browser-verify`.

**Readiness gate.** `node toolchain/bin/doctor.mjs --json` -> `"status": "READY"`; every check `PASS`,
including `capability:browser` (`agent-browser@0.32.3`), `node` (24.18.0), and `hooks:claude`
(`ACTIVE`). The adapter's own `doctor` was not used as the launch step; the session's first adapter
command was `open`, per the skill.

**Server ownership — nothing started, nothing stopped.** A Vite process was already listening on
`[::1]:5173`; `ps` confirms it is this repository's own server
(`node .../frontend-accelerator-work/node_modules/.bin/vite`), serving `<title>Training Sessions
Workspace</title>` and `/mockServiceWorker.js` with `200`. It is the developer's process, so this
role reused it and **did not** request approval to start one, did not restart it, and did not stop
it — it is still listening at PID `36721` after the session closed. The only process this role owned
was the browser session `t001-sessions-verify`, closed with `close` at the end.

Session name: `t001-sessions-verify`. Viewports: **1280x900** desktop and **375x812** mobile.

**Verdict: `FAIL`** — one documented behavior does not hold in a real browser. Every acceptance
criterion that is browser-observable passed; the failure is scoped precisely in F-01 below and is
**not** a defect in the feature's production code.

#### What passed, with evidence

| Path | URL | Evidence |
| --- | --- | --- |
| List renders through the real service worker | `/sessions` | MSW console `[MSW] 20:11:50 GET /api/sessions (200 OK)`; five `<li>` rows in the store's deterministic order `ses_105, ses_104, ses_101, ses_102, ses_103` |
| AC-07 status as a word, not colour | `/sessions` | Rendered text `Completed`, `Cancelled`, `Scheduled`, `Full` |
| AC-02 local-time conversion | `/sessions` | `2027-08-03T16:00:00Z` renders `Aug 3, 2027, 6:00 PM` — a real UTC+2 conversion, which jsdom under a fixed TZ cannot evidence the same way |
| AC-08..AC-11 filter | `/sessions?status=scheduled` | `select` -> browser URL becomes `?status=scheduled`, `GET /api/sessions?status=scheduled 200`, list drops to two rows, `Scheduled` stays selected |
| AC-14/15/17/19 validation blocks the request | `/sessions` | Empty submit renders both messages and the network log shows **no POST at all** |
| AC-18 messages clear live | `/sessions` | After filling both fields the two messages disappear with no re-submit |
| AC-16/AC-20/AC-21 create | `/sessions?status=scheduled` | `POST /api/sessions 201` -> `GET /api/sessions?status=scheduled 200` -> row `Morning Shooting Block` appears **trimmed** from `"  Morning Shooting Block  "`, form unmounted, filter still `Scheduled`, three rows |
| AC-03 loading | `?mock=slow` | `Loading sessions…` observed, then the five rows |
| AC-06 empty | `?mock=empty` | `No training sessions yet.`, no alert |
| AC-04 error copy | `?mock=list-error` | `GET /api/sessions 500` -> `Training sessions could not be loaded.` + `Try again`; **no `500` and no `SESSIONS_UNAVAILABLE` leaked into the page** |
| D-04 index redirect | `/` | Address bar settles on `http://localhost:5173/sessions` |
| D-06 create-failure guardrail | `?mock=create-error` | `POST /api/sessions 500` -> form stays open, `Title` still holds `Broken Create Probe`, submit `is enabled -> true`, no error message anywhere (AC-22 is dropped by design) |
| Console and page errors | all of the above | `errors` empty on every page. `console` carries only Vite HMR, the React DevTools hint, and MSW's own request log — no warning or error from application code |
| Mobile 375x812 | `/sessions` | `scrollWidth 375 === clientWidth 375`, no horizontal overflow; screenshot shows the header, filter, `New session`, and five readable cards stacked |
| Keyboard | `/sessions` | `Tab` reaches the `Status` `select`, then the `New session` button, in visual order |

#### F-01 (the failure) — `?mock=list-error-once` cannot show the recovery it documents

`api-integration.md` section 12 instructs: "Open `http://localhost:5173/sessions?mock=list-error-once`
to see the error state and then a successful retry (**AC-04 + AC-05 in one page load**)."

**Observed instead:** the page loads straight into a fully rendered five-row list. The error state
never paints, and there is nothing to click `Try again` on.

**Evidence — two requests on a single page load:**

```
[45419.167] GET http://localhost:5173/api/sessions (Fetch)
[45419.168] GET http://localhost:5173/api/sessions (Fetch) 200
[MSW] 20:13:59 GET /api/sessions (500 Internal Server Error)
[MSW] 20:13:59 GET /api/sessions (200 OK)
```

**Cause, stated with its evidence rather than as certainty.** `src/main.tsx:18` wraps `<App />` in
`<StrictMode>`, and React double-invokes mount effects in development. Every scenario measured shows
exactly **two** `GET /api/sessions` per page load — two `200`s under `normal`, two `500`s under
`list-error`, and under `list-error-once` a `500` followed by a `200`. The one-shot latch
`listErrorOnceUsed` in `src/mocks/scenario.ts` is therefore consumed by the first, discarded mount,
and the mount the user actually sees gets the success path.

**Why this matters beyond the one scenario.** It leaves **AC-05 — a recoverable error, where the
retry succeeds — with no browser-observable path at all**: `list-error` fails every request, so its
`Try again` can never recover, and `list-error-once` burns its latch before paint. AC-05 remains
covered by the automated suite (`SessionsWorkspacePage.list.test.tsx` drives it with a
`server.use(..., { once: true })` override and clicks `Try again`), and a jsdom render is not wrapped
in `StrictMode`, which is exactly why the suite is green while the browser is not. Note also that
`src/main.tsx` starts the worker only under `import.meta.env.DEV`, so there is no production mode in
which the scenario would behave differently — the switch exists only where the double-mount exists.

**Not repaired.** This role does not edit source, and the Stop Contract forbids repairing a failure.
The fix is a `coder` decision between resetting the latch per query-mount, having the handler count
only the first *rendered* request, or dropping the scenario and documenting `server.use` as the only
AC-05 demonstration. No option is chosen here.

#### Observations, non-blocking, no change requested

* **`datetime-local` has no single accessible name in Chrome.** The AX tree decomposes it into
  `spinbutton "Day Day" / "Month Month" / "Year Year" / "Hours Hours" / "Minutes Minutes"` plus
  `button "Show local date and time picker"`; the string `Start date and time` is present as the
  visible `<label>` and works for click and focus, but it is not the control's accessible name the
  way `screen.getByLabelText("Start date and time")` implies in jsdom. Native control behaviour, not
  a markup defect — recorded because the test name suggests a guarantee the browser does not give.
* **The `New session` button is not inside the create form's landmark.** It sits in the header and
  toggles a sibling `<form>`; focus is not moved into the form on open. Nothing in scope requires it.
* **The mock store resets on every page reload**, so a session created in the browser vanishes on
  refresh. Correct for module-scoped state and consistent with `resetSessionsDb` in tests, but worth
  knowing before demonstrating the flow.

**Stop.** Evidence and verdict are reported, the owned browser session is closed, and the
developer's dev server was left running and untouched. Per the Stop Contract this role does not
repair the failure and does not invoke the next command.

### Coder Record — F-01 fix, the `list-error-once` attempt window

Implemented `2026-09-02T20:37+02:00`. Two files changed, both inside `src/mocks/`. Rulesets loaded:
`rulesets/common/coder` (TypeScript And Project Fit, Essential Behavior Tests) and
`rulesets/framework/coder` — whose React sections do **not** apply: this pass touches no component,
hook, state, or effect. No documentation lookup was needed, so no `ctx7` call was made and no
documentation evidence is claimed. Commits left to the developer, as before.

**The decision, and why it was a `coder` call rather than a specialist's.** `browser-verify` left
three options open. The required *behavior* was never open — `api-integration.md` section 12 fixes
it: `?mock=list-error-once` must show "the error state and then a successful retry (AC-04 + AC-05
in one page load)". Only the mechanism was undecided, and it lives entirely inside the mock
boundary: no contract, no route, no component, and no public type changes. So no architecture or
API decision was pending and nothing was guessed.

**Why a time window, and not a counter.** The boundary cannot distinguish a React development
remount from the user pressing `Try again`: both are byte-identical `GET /api/sessions`, same URL,
same headers, no body. The only property that separates them is elapsed time — a remount arrives
within milliseconds, a person reading an error and clicking a button cannot. Failing the first two
requests instead would have hard-coded React's current dev double-mount, silently breaking if
`StrictMode` were removed or if React changed how many times it re-invokes mount effects. So
`list-error-once` now means "the first **attempt** fails", where an attempt is a
`LIST_ERROR_ONCE_ATTEMPT_MS = 500` window opened by the first request, not "the first **request**
fails".

**`src/mocks/scenario.ts`.** `listErrorOnceUsed: boolean` becomes
`listErrorOnceStartedAt: number | null`. `shouldFailListRequest` takes an injected
`now: number = Date.now()` — the same optional-clock shape `isFutureLocalDateTime` already uses in
this repository, so the rule is testable without fake timers and the single call site in
`handlers.ts` is unchanged. `list-error` still short-circuits to `true` before the window logic, so
it never opens the window and never recovers. `resetListErrorOnce()` is exported for within-file
test isolation only, mirroring the existing `resetSessionsDb()` convention; it is deliberately
**not** re-exported through `src/test/msw.ts`, because the only consumer is the colocated
`src/mocks/scenario.test.ts` and nothing under the four layers needs it.

**Tests — `src/mocks/scenario.test.ts`, one replaced by five.** The old
"fails only the first list request" case asserted exactly the broken semantics and could not be kept.
Its replacements pin the contract from both sides: the first request fails; a repeat at `+5ms` and
at `+499ms` **still** fails (the regression itself — a carried comment records why); `+500ms` and
`+9s` succeed; the window opens at the first *request* rather than at module load; and an
intervening `normal` / `list-error` call neither opens nor shifts it. The suite went from 88 to 92.

**Checks run, in this order.** `npm run lint` clean over 66 files with no `lint:fix` needed;
`npm run typecheck` clean; `npm run test` **15 files, 92 tests**; `npm run build` clean.

**Browser evidence, because the unit tests cannot prove this fix.** That is the honest limit of the
suite here: `renderApp` does not wrap the tree in `StrictMode`, and in jsdom `currentScenario()` is
always `normal`, so no Vitest test can reach the double-mount that caused F-01. The claim would be
unproven without a browser, so one was used — reusing the developer's already-running Vite server
on `:5173` (PID `36721`, still listening afterwards, never restarted or stopped) and an owned
adapter session `t001-f01-fix`, closed at the end.

On `http://localhost:5173/sessions?mock=list-error-once`:

```
GET /api/sessions        (double mount, inside the window)
GET /api/sessions  500   -> "Training sessions could not be loaded." + "Try again" now paints
GET /api/sessions  200   -> after clicking "Try again": the five rows render
```

That is AC-04 and AC-05 in a single page load, which is exactly what section 12 documents and what
was impossible before this change. Zero page errors throughout.

**Regression checks in the same session.** `?mock=normal` renders the list; `?mock=empty` renders
`No training sessions yet.`; `?mock=list-error` shows the error **and still does not recover** when
`Try again` is clicked, confirming the window belongs to `list-error-once` alone.

**Remaining risk and unverified state.**

* `LIST_ERROR_ONCE_ATTEMPT_MS` is a judgement call, not a measured constant. A retry clicked within
  500 ms of page load would fail a second time; the click after it succeeds. The reasoning is in a
  code comment so a future reader can retune it deliberately rather than by accident.
* The window is wall-clock based, so a debugger breakpoint held across the first request for longer
  than 500 ms would let the remount succeed. Acceptable for a development-only demonstration switch.
* Nothing else from the `browser-verify` record was touched. The `datetime-local` accessible-name
  observation and the reload-resets-the-store note remain open as recorded, deliberately: neither is
  a defect and neither was in this task's scope.
* `specs/` still does not exist and was not created.

**Stop.** The scoped fix and its essential tests are complete, every gate passes, and the behavior
is proven in the environment where it actually failed. Per the Stop Contract this role does not
invoke the next command; `browser-verify` re-running its own F-01 case would be the independent
confirmation, since the evidence above was gathered by the role that wrote the fix.

### Browser Verification Record — `browser-verify` role, F-01 re-check

Verified `2026-09-02T20:45+02:00`. Independent re-run: the previous browser evidence for this fix
was gathered by the role that wrote it, so F-01 is re-tested here from scratch, adversarially, plus
a full regression sweep of everything the earlier record had passed. No production file, test,
configuration, or fixture was edited by this role — `git status` after the run shows only the two
files the `coder` pass changed and this log.

**Readiness gate.** `node toolchain/bin/doctor.mjs --json` -> `"status": "READY"`, all eight checks
`PASS`. The session's first adapter command was `open`.

**Server ownership.** The developer's Vite process was still listening on `[::1]:5173` (PID
`36721`); it was reused, never restarted and never stopped, and it is still listening after the run.
The only owned process was the adapter session `t001-f01-recheck`, closed at the end. **The fix is
uncommitted**, so it reached the browser through Vite HMR — confirmed directly rather than assumed:
`curl http://localhost:5173/src/mocks/scenario.ts` returns a module containing
`LIST_ERROR_ONCE_ATTEMPT_MS`, so the page under test really was running the new code.

Session: `t001-f01-recheck`. Viewports: **1280x900** and **375x812**.

**Verdict: `PASS`.** F-01 is fixed. The documented behavior now holds, the sibling scenarios are
unaffected, and the timing boundary the fix introduces was measured rather than taken on trust —
see the two findings below, neither of which blocks.

#### F-01 is closed

`http://localhost:5173/sessions?mock=list-error-once` on a 1280x900 desktop viewport:

```
GET /api/sessions        (StrictMode double mount, both inside the window)
GET /api/sessions  500   -> role=alert paints: "Training sessions could not be loaded." + "Try again"
GET /api/sessions  200   -> after clicking "Try again": five rows render
```

That is AC-04 followed by AC-05 in one page load — precisely what `api-integration.md` section 12
documents and what was unreachable before. **Repeatability:** three consecutive fresh loads each
painted the error state (`3/3`), so the fix is not a race that happened to fall the right way once.
On 375x812 the same error state renders with `scrollWidth === clientWidth === 375`, no horizontal
overflow, and the alert plus `Try again` fully visible.

#### N-01 (non-blocking) — the measured dead zone is ~500 ms wide, and it is self-correcting

The fix trades a boolean latch for a 500 ms window, so the obvious question is what happens to a
retry that lands inside it. Measured, by clicking `Try again` at graded delays after the error
first painted:

| Click delay after the error appears | Result |
| --- | --- |
| `0 ms` (clicked the instant the button existed, 211 ms after navigation) | still errored |
| `100 ms` | still errored |
| `300 ms` | still errored |
| `500 ms` | **recovered**, 5 rows |
| `800 ms` | **recovered**, 5 rows |

So a retry recovers from roughly 500 ms after the error paints onward. This matches the limitation
the `coder` record disclosed rather than contradicting it, and the disclosed mitigation was
verified directly: after a deliberately too-fast retry, **the very next click recovers** —
`{rows: 0, stillErrored: true}` then `{rows: 5, stillErrored: false}`. The retry control never
becomes dead and the user is never stuck.

Whether this matters in practice: the fastest click measured here, 211 ms after navigation, is not
a human action — it required polling the DOM and clicking the frame the button appeared. A person
must perceive an unexpected error, read it, and travel to the button; that does not happen inside
half a second. Recorded as a measured property of the chosen mechanism, not as a defect, so that
whoever later retunes `LIST_ERROR_ONCE_ATTEMPT_MS` knows exactly what the current value buys.

#### Regression sweep — everything the earlier record passed, re-run independently

| Path | Evidence |
| --- | --- |
| `?mock=normal` | 5 rows |
| `?mock=empty` | 0 rows, `No training sessions yet.` |
| `?mock=slow` | resolves to 5 rows |
| `?mock=list-error` | error paints and **still never recovers**: two consecutive `Try again` clicks both left `{rows: 0, stillErrored: true}`, proving the new window belongs to `list-error-once` alone |
| List | 5 rows, `U12 Team Fundamentals` first — store order unchanged |
| Filter | `select` -> URL `?status=scheduled`, `GET ...?status=scheduled 200`, 2 rows |
| Create | `POST 201` -> refetch -> `{rows: 3, titles: ["Recheck Session", ...], formOpen: false, filter: "scheduled"}` — title trimmed from `"  Recheck Session  "`, form closed, filter preserved |
| `?mock=create-error` (same module the fix touched, so re-checked deliberately) | `POST 500` -> `{formOpen: true, titleKept: "Guardrail Probe", submitEnabled: true}` — D-06 guardrail intact |
| Console and page errors | `errors` empty on every page; filtering out Vite HMR, the React DevTools hint and MSW's own request log leaves **no application console output at all** |

#### Still open from the previous record, deliberately untouched

Neither was in the `coder` pass's scope and neither is a defect:

* `datetime-local` exposes no single accessible name in Chrome — the AX tree decomposes it into
  per-unit spinbuttons, so the browser does not give the guarantee
  `getByLabelText("Start date and time")` implies in jsdom.
* The mock store resets on page reload, so a session created in the browser vanishes on refresh.

**Stop.** Evidence and verdict are reported, the owned browser session is closed, and the
developer's dev server was left running and untouched. Per the Stop Contract this role repairs
nothing and does not invoke the next command.

### Code Review Record — `code-reviewer` role, full workspace implementation & F-01 fix

Reviewed `2026-09-02T20:54+02:00`, read-only evidence-based review.

**Review surface:** Bounded diff `b521743..working tree` restricted to `src/` (27 files, 1477 insertions, 6 deletions, plus F-01 scenario window update).
Rulesets loaded: `rulesets/common/code-reviewer` (Evidence-First Review) and `rulesets/framework/code-reviewer`.
Application Root is Repository Root.

**Verdict: `PASS`.**

#### Findings

- **Blocking findings:** `0`.
- **Should-fix findings:** `0`.
- **Nits / observations (non-blocking):** `4` (detailed below).

#### Detailed Code Analysis

1. **Routing & Application Shell (`src/app/router.tsx`, `src/app/App.smoke.test.tsx`):**
   - Route `/` cleanly redirects to `/sessions` via `loader: () => redirect("/sessions")` (D-04).
   - `/sessions` renders `SessionsWorkspacePage` imported directly from the `@/features/sessions` barrel.
   - `App.smoke.test.tsx` validates both the root redirect and the rendered layout headings inside `AppProviders`.

2. **API Endpoint Wrappers (`src/services/api/endpoints/sessions.ts`, `sessions.test.ts`):**
   - `listSessions` properly formats query strings, omitting empty parameters per Q-02 (`?status=scheduled` when set, `""` when empty).
   - `createSession` posts the contract-compliant `CreateSessionRequest` payload to `/sessions`.
   - Forwarding `AbortSignal` through `options.signal` prevents orphaned in-flight fetches.
   - Colocated tests comprehensively assert parameter serialization, default handler responses, and error propagation.

3. **MSW Mock Infrastructure (`src/mocks/`):**
   - `sessions.seed.ts` provides the deterministic 5-record dataset covering all statuses (`scheduled` x2, `full`, `cancelled`, `completed`) with future/past timestamp separation per D-03.
   - `sessions-db.ts` provides clean, isolated in-memory CRUD operations, sorting by `startsAt` ascending then `id`, with sequential ID generation (`ses_900+`) and a `resetSessionsDb()` test hook.
   - `handlers.ts` enforces contract validation (`validateCreateBody`), returns exact status codes (`201` for create, `400` with `fieldErrors` on invalid payloads, `400 INVALID_FILTER` on unsupported statuses), and accurately computes `meta.total` after filtering.
   - `scenario.ts` & F-01 fix: `LIST_ERROR_ONCE_ATTEMPT_MS = 500` attempt window cleanly absorbs React 19 development double-mounts while allowing user-initiated retries (`Try again`) to recover successfully, satisfying AC-04 and AC-05 in one page load. Clock injection (`now: number = Date.now()`) enables deterministic unit testing in `scenario.test.ts`.

4. **Feature Model & State Management (`src/features/sessions/model/`):**
   - `sessions-query.ts`: Uses structured query key factory `sessionKeys.list({ status })`, sets `retry: false` for the list query to ensure immediate error visibility per AC-04.
   - `use-create-session-mutation.ts`: Wraps `createSession` with `buildCreateSessionRequest(values)`, invalidates `sessionKeys.lists()` on success without awaiting, closing the form immediately and refetching data seamlessly (Q-03, D-05).
   - `create-session.ts`: Enforces 3–80 character trimmed title boundaries, future date checks using `isFutureLocalDateTime`, bundles fixed D-02 default fields (`CREATE_SESSION_DEFAULTS`), and produces localized error key suffixes (`titleLength`, `startsAtRequired`, `startsAtFuture`).

5. **UI Components & Accessibility (`src/features/sessions/ui/`):**
   - `SessionsWorkspacePage.tsx`: Manages `isFormOpen` modal state and synchronizes `status` with URL search params (`useSearchParams`), preserving unrelated search params like `?mock=...`.
   - `StatusFilter.tsx`: Provides semantic `<label>` and `<select>` offering `All` and `Scheduled` (`FILTER_STATUS = "scheduled"`), driven purely by i18n keys.
   - `SessionsListSection.tsx`: Explicitly handles all 4 query states (pending loading indicator with `role="status"`, error banner with `role="alert"` and retry button, empty state with `list.empty` message, and populated list).
   - `SessionsList.tsx`: Emits semantic `<ul aria-label="...">` and `<li>` items. Uses `formatSessionStart` for local timezone formatting, gracefully falling back to `list.startUnknown` if unparseable rather than throwing or rendering empty.
   - `CreateSessionForm.tsx`: Derives field errors live during render for instantaneous AC-18 clearance, re-validates against a fresh clock on submit (Q-01), wires accessible `aria-invalid` and `aria-describedby` with corresponding error element IDs, and disables the submit button during mutation pending state with `form.pending` copy.

6. **Architecture & ED Layer Boundaries:**
   - Strict adherence to ED small layers: `app -> features -> services -> shared`.
   - No illegal imports of `app`, `mocks`, or `test` into `features` or `services`.
   - Colocated tests interact with the MSW boundary exclusively via `@/test/msw`.
   - Zero hardcoded UI strings; 100% of user-facing strings are resolved through the `sessions` and `common` i18n namespaces in both `en` and `ru`.
   - Zero unnecessary `useMemo` / `useCallback` usage.

7. **Quality Gates & Evidence:**
   - `npm run lint` — Biome clean across 66 files (0 errors, 0 warnings).
   - `npm run typecheck` — TypeScript strict clean (`tsc -b --noEmit`).
   - `npm run test` — 15 test files, 92 tests passing (unit + integration).
   - `npm run build` — Production build succeeds with 132 transformed modules (382.68 kB JS, 12.92 kB CSS).

#### Residual Gaps and Observations (Non-Blocking)

1. **`datetime-local` Accessible Name in WebKit/Blink:** The native browser control decomposes into unit spinbuttons in the accessibility tree; the visible label remains fully functional and accessible via `htmlFor`.
2. **Seed Date Expiration (D-03 Time Horizon):** Fixtures `ses_101`..`ses_103` are seeded in mid-2027; unit assertions in `sessions.seed.test.ts` will require date bumps after August 2027.
3. **`LIST_ERROR_ONCE_ATTEMPT_MS` Window:** Tuned to 500ms for development React StrictMode remounts. Retries triggered in under 500ms will fail once more and recover on the subsequent click.
4. **Mock DB State Scope:** Mock database state is memory-resident; a full page browser reload resets to seed data (expected for client mock boundaries).

Recommended next role: `docs-generator` / `finishing-branch`.

## Manual Browser Observation

Filled by the `browser-verify` role at `2026-09-02T20:15+02:00`; full evidence in the Browser
Verification Record above.

- Command and URL: no server was started by that role — the developer's own
  `node node_modules/.bin/vite` (`npm run dev`, PID `36721`) was already listening, and was reused
  and left running. Discovered URL: `http://localhost:5173`, entered at
  `http://localhost:5173/sessions`.
- Flow exercised: `/` redirect -> list (5 rows, real service worker) -> filter `Scheduled`
  (URL becomes `?status=scheduled`, 2 rows) -> invalid create (both messages, **no POST**) ->
  valid create (`POST 201`, refetch, trimmed row appears, filter kept) -> scenarios `?mock=slow`,
  `?mock=empty`, `?mock=list-error`, `?mock=list-error-once`, `?mock=create-error` -> mobile
  375x812 and keyboard tab order.
- Observed result: every acceptance criterion that is browser-observable passed, with zero page
  errors and no application console warnings. One documented behavior failed — see the next line.
- Unverified or incomplete behavior:
  - ~~**AC-05 has no browser-observable path** (F-01)~~ — **closed `2026-09-02T20:45+02:00`.** The
    `coder` pass replaced the one-shot latch with a 500 ms attempt window, and the re-check at
    20:45 observed `500` -> error state -> `Try again` -> `200` -> five rows in one page load, on
    three of three consecutive loads. AC-05 is now demonstrable in a browser. The window's measured
    dead zone (a retry inside ~500 ms fails once more, the next click recovers) is recorded as N-01
    in that record.
  - `datetime-local` exposes no single accessible name in Chrome (decomposed into per-unit
    spinbuttons), so the browser does not give the guarantee `getByLabelText("Start date and time")`
    implies in jsdom. Still open; not a defect.
  - The mock store resets on page reload, so a browser-created session vanishes on refresh. Still
    open; correct for module-scoped state.

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

## Project Audit — 2026-09-02

Read-only technical audit performed at `2026-09-02T19:29+00:00`, requested as a coordinator-level
status check against `ai/context/`, `tasks/`, `training/frontend-accelerator-assessment/`, and the
live codebase. No files were modified to produce this section; the four quality-gate commands
below were re-run live to confirm the claims already recorded in
[`current-work.md`](../../ai/context/current-work.md) rather than to change anything.

### 1. Overall Status And Metrics

- Phase: onboarding task `task-001-onboarding-sessions` is delivered and reviewed; the repository
  is idle between that closed task and the assessment-scope work described as `Next`.
- Active branch: `dev/dev-05-phase-coder-03`, latest commit `5cfa295` (`docs: initialize AI
  context documentation and update project architecture documentation...`). `current-work.md`
  itself still points at `d53b662` as "Latest commit" — one commit behind HEAD; see §5.
- Quality gates, re-verified live rather than taken on trust:
  - `npm run lint` — Biome, `66 files`, `0` errors / `0` warnings.
  - `npm run typecheck` — `tsc -b --noEmit`, clean, no output.
  - `npm run test` — `15` test files, `92` tests, all passing.
  - `npm run build` was not re-run in this audit (previously recorded as passing in
    [`workflow-log.md:1398`](#) with `132` modules, `382.68 kB` JS / `12.92 kB` CSS); the other
    three gates match `current-work.md`'s claim exactly.

### 2. Completed Scope

- `task-001-onboarding-sessions` — "Sessions workspace: list, filter, create." Closed with
  `code-reviewer` verdict `PASS` (zero blocking / should-fix findings) and `browser-verify`
  confirming every browser-observable acceptance criterion, including the `F-01` retry-latch fix
  landed in commit `d53b662`.
- Implemented functionality, confirmed directly in `src/`:
  - Route `/sessions` (child of the root layout in [`router.tsx`](../../src/app/router.tsx)); `/`
    redirects to it via a loader (`redirect("/sessions")`), matching decision D-04.
  - List view ([`SessionsList.tsx`](../../src/features/sessions/ui/SessionsList.tsx),
    [`SessionsListSection.tsx`](../../src/features/sessions/ui/SessionsListSection.tsx)) with
    loading (`role="status"`), error+retry (`role="alert"`), empty, and populated states.
  - Status filter ([`StatusFilter.tsx`](../../src/features/sessions/ui/StatusFilter.tsx)) — **only
    two options exist**: `All` and `Scheduled` (`FILTER_STATUS = "scheduled"`, D-01). No `full`,
    `cancelled`, or `completed` option is rendered anywhere in the UI. The active filter is
    mirrored into `?status=` via `useSearchParams` in
    [`SessionsWorkspacePage.tsx`](../../src/features/sessions/ui/SessionsWorkspacePage.tsx).
  - Create form ([`CreateSessionForm.tsx`](../../src/features/sessions/ui/CreateSessionForm.tsx))
    — title (trimmed 3–80 chars) and `datetime-local` start time (must be strictly future),
    inline `aria-invalid`/`aria-describedby` validation, submit disabled while pending. The seven
    remaining `CreateSessionRequest` fields are supplied by
    [`create-session.ts`](../../src/features/sessions/model/create-session.ts)'s
    `CREATE_SESSION_DEFAULTS` (D-02); no `search` input exists in the codebase (confirmed by
    `grep` — the only `search` hit in that file is the `useSearchParams` hook, not a text filter).
  - i18n: namespace `sessions` (`list`, `filter`, `status`, `form` keys) plus `common`, complete in
    both `src/shared/i18n/locales/en/` and `.../ru/`, with
    [`sessions-namespace.test.ts`](../../src/shared/i18n/sessions-namespace.test.ts) guarding key
    parity.
- Architecture layers touched: `src/features/sessions/` (`ui/` + `model/` + `index.ts` barrel),
  `src/services/api/endpoints/sessions.ts` + `sessions.types.ts` (typed wrappers, `AbortSignal`
  forwarded), `src/mocks/` (`handlers.ts`, `db/sessions-db.ts`, `data/sessions.seed.ts`,
  `scenario.ts` for the `?mock=` switch), `src/shared/i18n/`. No `src/shared/ui/` primitives exist
  yet (plain Tailwind elements only) — matches the "Open Items" note in `current-work.md`.

### 3. Active Streams And Blockers

- No task folder or role artifact currently shows in-progress work — `tasks/` contains exactly one
  directory, `task-001-onboarding-sessions`, and its `workflow-log.md` ends in a `## Completion`
  section with known limitations, not an open next-step. There is no `task-002` (or similarly
  named) folder for the assessment-scope work described as `Next`.
- Recorded blockers/debt, all non-blocking by design:
  - `list-error-once` mock scenario fails every request inside a `500ms` attempt window (not just
    the first) so a React StrictMode double-mount cannot consume the single scripted failure — a
    retry inside that window fails once more before succeeding (documented dead zone `N-01`).
  - Create failure is silent by design (D-06, AC-22 dropped): a failed `POST /api/sessions` shows
    no user-facing message; only the pending-state guardrail (submit always re-enables) is
    guaranteed.
  - `datetime-local` decomposes into per-unit spinbuttons in Chrome's accessibility tree, so
    `getByLabelText` behavior proven in jsdom tests does not carry the same guarantee in a real
    browser (the visible `<label for>` association still works).
  - Mock store is module-scoped in memory; a browser reload discards any session created at
    runtime and restores the seed.
  - Seed sessions `ses_101`–`ses_103` are dated mid-2027 and the assertions in
    `sessions.seed.test.ts` will need new dates after August 2027.

### 4. Upcoming Scope And Roadmap

- `Next` (per both `current-work.md` and `product.md`), sourced from
  `training/frontend-accelerator-assessment/FRONTEND_ASSESSMENT_SPEC.md`: search by title/coach/
  location, all four status filters (`scheduled`, `full`, `cancelled`, `completed`), and a session
  details side drawer. None of the three exist in `src/` today — confirmed by direct `grep`
  (`StatusFilter.tsx` renders exactly two `<option>`s; no details route or drawer component exists
  anywhere under `src/features/sessions/`).
  - The API contract for the details view is partially pre-typed: `SessionDetails` is already
    defined in
    [`sessions.types.ts`](../../src/services/api/endpoints/sessions.types.ts) and is the type
    returned by `createSession`'s response, but no `GET` details endpoint wrapper, no MSW handler
    for a single-session fetch, and no route/drawer UI is wired — this is scaffolding for future
    work, not a partially built feature.
- `Later` (`product.md`, "Optional Extensions"): pagination and optimistic updates. URL parameter
  sync is explicitly *not* deferred anymore — the status filter already round-trips through
  `?status=`.
- Non-Goals (`product.md`, unchanged, none contradicted by current code): real backend/database,
  authentication/roles/registration, drag-and-drop calendars or attendee enrollment, financial
  transactions or real email sending.

### 5. Memory Sync Check

- `ai/context/current-work.md`'s "Latest commit: `d53b662`" line is stale by one commit — HEAD is
  now `5cfa295` (a docs-only commit per its message, so no code drift is implied, but the pointer
  itself is out of date).
- `ai/context/features/sessions.md` (the sessions feature passport) matches the code closely:
  module layout, API dependency table, state-ownership table, and the "Not Implemented Here"
  section (search, three remaining filters, details drawer, pagination, optimistic updates) all
  check out against `src/features/sessions/` as read. No divergence found.
- Confirmed absent, as `current-work.md` itself already documents: `ai/context/roadmap.md` and
  `ai/context/decisions/` do not exist — the Now/Next/Later list lives only in `product.md` and
  per-task decisions only in each task's `workflow-log.md`. `ai/recipes/` and `ai/prompts/` exist
  as empty directories.
- `tasks/` holds a single task folder; there is no `ai/context/tasks/task-001-sessions-workspace.md`
  file despite `task.md:9` referencing it as "a separate, larger brief" to explicitly not merge
  into this one scope — that referenced path does not exist in the repository, so either it was
  never created or the reference itself is stale.
- No `decisions.md`/ADR log exists outside the six `D-01`..`D-06` entries recorded inline in
  `tasks/task-001-onboarding-sessions/workflow-log.md` — acceptable per the project's own
  documented convention, not a gap.
