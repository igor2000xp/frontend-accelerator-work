# Task Brief: task-001-onboarding-sessions

## Source Of Truth

This brief restates `training/frontend-accelerator-onboarding/TASK.md` for the accelerator role
workflow. When this file and `TASK.md` disagree, `TASK.md` wins.

Not in scope for this task id: `ai/context/tasks/task-001-sessions-workspace.md`. That is a
separate, larger brief (search, four status filters, no create form). Do not merge its
acceptance criteria into this one.

## Objective

Build a small frontend workspace that lets a trainer view, filter, and create training sessions.

The exercise exists to practise the accelerator workflow. Product and technical scope stay
deliberately small.

## Required User Flow

1. Open the workspace and see sessions loaded from a mock API.
2. Filter sessions by one status.
3. Open a create form.
4. Create a session with a title and a future date/time.
5. See the created session in the list.

## Required Behavior

### Sessions list

- Show session title, status, and start date/time.
- Provide an `All` option and one status filter.
- Show a loading state while the request is pending.
- Show one understandable, recoverable request-error state.

### Create session

- Require a trimmed title between 3 and 80 characters.
- Require a date and time in the future.
- Prevent duplicate submission while the request is pending.
- Show a useful validation message.
- Add the successfully created session to the visible list.

### Mock boundary

- Keep mock data behind an HTTP client or equivalent replaceable request boundary.
- Use the repository's existing mock mechanism. If none exists, MSW or another conventional HTTP
  mock is acceptable.
- Do not implement a backend service.

### Essential test

At least one behavior-level automated test for the main flow. Filtering or successful creation is
enough.

### Manual check

Start the application and exercise list, filter, and create once in a browser. Record what was
actually observed. `browser-verify` and screenshots are optional.

## Constraints

- Use the repository's existing framework, package manager, scripts, and test stack.
- NPM only.
- ED small layers: `src/app`, `src/features`, `src/services`, `src/shared`, with the import rules
  from `AGENTS.md`.
- No hardcoded UI strings — i18n keys in both `en` and `ru`.
- Do not rewrite unrelated code or configuration.
- Do not add features outside the required flow until onboarding is complete.
- Report incomplete behavior honestly instead of claiming an unperformed check.

## Explicitly Optional

Session details, drawers, deep links, search, multiple filters, pagination, a complete API
contract or scenario matrix, screenshot sets, exhaustive responsive and accessibility validation,
full test coverage, CI, deployment, a public URL, and unrelated refactoring.

## Repository Preconditions

At the time this brief was written the repository contained the accelerator only — no
`package.json`, no `src/`, no `ARCHITECTURE.md`, no `ai/recipes/`, and no `npm run scaffold:*`
scripts, despite `AGENTS.md` referencing them. The React + TypeScript application must be
initialized before the `coder` role runs. Record that bootstrap and any residual gaps in
`workflow-log.md` under known limitations.

Runtime Doctor at the same point: `DEGRADED` — claude hooks `ACTIVE`, codex hooks
`PENDING_ACTIVATION`, lint gate degraded because no lint script existed. Not blocking for a
Claude-driven workflow.

## Role Sequence

Run one role at a time. Each role reports and STOPs; the developer selects the next one.

1. `requirements-analyst`
2. `writing-plans`
3. `coder`
4. `code-reviewer`
5. `verify`

Optional roles (`architect`, `api-integration`, `ui-designer`, `test-generator`, `debugger`,
`browser-verify`) only when the task actually needs them.

## Expected Artifacts

```text
tasks/task-001-onboarding-sessions/task.md            (this file, developer-authored)
tasks/task-001-onboarding-sessions/requirements.md    (requirements-analyst)
tasks/task-001-onboarding-sessions/implementation-plan.md (writing-plans)
tasks/task-001-onboarding-sessions/review.md          (code-reviewer response, verbatim)
tasks/task-001-onboarding-sessions/verification.md    (verify)
tasks/task-001-onboarding-sessions/workflow-log.md    (developer)
```

The developer does not author or improve the role artifacts. Acceptance criteria for this task
are owned by `requirements-analyst` and belong in `requirements.md`, not here.

## Done When

The submission satisfies `training/frontend-accelerator-onboarding/PASS_CRITERIA.md`.
