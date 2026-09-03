# Current Work

Last updated: 2026-09-02.

## State Of The Repository

* Branch: `dev/dev-05-phase-coder-03`. Latest commit: `d53b662`.
* The application is wired end to end: `/` redirects to `/sessions`, which is served by the
  `sessions` feature over the MSW mock boundary. There is no real backend and none is planned.
* Quality gates on the current tree: `npm run lint`, `npm run typecheck`, `npm run test`
  (15 files, 92 tests), and `npm run build` all pass.

## Delivered

`task-001-onboarding-sessions` — the sessions workspace: list, `All` + `Scheduled` filter mirrored
into `?status=`, and a create form with trimmed 3–80 character title and strictly-future start
time validation, covering loading, empty, error, and pending states in `en` and `ru`.
Role artifacts, decisions D-01–D-06, and the full evidence trail live in
`tasks/task-001-onboarding-sessions/` (`task.md`, `requirements.md`, `api-integration.md`,
`implementation-plan.md`, `workflow-log.md`).

Reviewed by the `code-reviewer` role with verdict `PASS` and no blocking or should-fix findings;
browser behavior was checked by the `browser-verify` role against a real service worker.

## Open Items And Handoff Notes

* No `src/shared/ui/` exists yet: no shadcn/ui component has been generated. The current feature
  uses plain Tailwind-styled elements. Generate primitives there when a second feature needs them.
* `ai/recipes/` and `ai/prompts/` exist but are empty.
* `ai/context/roadmap.md` and `ai/context/decisions/` do not exist yet; the Now/Next/Later list is
  in `product.md` and per-task decisions are in the task workflow log.
* No scaffolding scripts exist. Create features and routes by hand following `ARCHITECTURE.md`
  section 7 and `src/features/sessions/` as the worked example.
* Seed dates in `src/mocks/data/sessions.seed.ts` expire after August 2027; the seed test asserts
  on them.

## Next

The assessment scope in `training/frontend-accelerator-assessment/`: search by title, coach, and
location; all four status filters; and the session details drawer. The API contract for those is
already typed in `src/services/api/endpoints/sessions.types.ts` (`SessionDetails` is defined and
returned by create, but no details endpoint or route is wired yet).

See also: [`product.md`](product.md), [`business-rules.md`](business-rules.md),
[`glossary.md`](glossary.md), [`features/sessions.md`](features/sessions.md).
