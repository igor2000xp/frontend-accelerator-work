# Feature Passport: `sessions`

The training sessions workspace. Implemented and verified under task
`task-001-onboarding-sessions`.

## Route And Public API

* Route: `/sessions`, registered in `src/app/router.tsx` as a child of the root layout.
  `/` redirects to it with a route loader.
* Public API: `src/features/sessions/index.ts` exports `SessionsWorkspacePage` and nothing else.
  Deep imports into the feature are forbidden.

## Module Layout

```text
src/features/sessions/
├── index.ts
├── ui/
│   ├── SessionsWorkspacePage.tsx   # filter + create control + list section, URL filter state
│   ├── StatusFilter.tsx            # All / Scheduled select
│   ├── SessionsListSection.tsx     # loading, error+retry, empty, populated
│   ├── SessionsList.tsx            # <ul> of session rows
│   └── CreateSessionForm.tsx       # title + datetime-local, inline validation
└── model/
    ├── sessions-query.ts           # sessionKeys factory, useSessionsQuery
    ├── use-create-session-mutation.ts
    ├── create-session.ts           # validation, defaults, request builder
    └── date-time.ts                # local-wall-clock parsing, ISO UTC, display formatting
```

## API Dependencies

| Call | Wrapper | Used by |
| --- | --- | --- |
| `GET /api/sessions[?status=…]` | `listSessions` | `useSessionsQuery` |
| `POST /api/sessions` | `createSession` | `useCreateSessionMutation` |

Both wrappers live in `src/services/api/endpoints/sessions.ts` and forward an `AbortSignal`. The
feature never calls `fetch`. Both endpoints are served by MSW handlers in `src/mocks/handlers.ts`.

## State Ownership

| State | Owner | Notes |
| --- | --- | --- |
| Session list | TanStack Query, key `sessionKeys.list({ status })` | `retry: false` so the first failure is visible. |
| Active status filter | The page URL, via `useSearchParams` | Written with `replace: true`; unrelated parameters such as `?mock=` are copied through, not dropped. |
| Create form open/closed | `useState` in `SessionsWorkspacePage` | Closes on a successful create. |
| Form values | `useState` in `CreateSessionForm` | Errors are derived during render once a submit has been attempted, so a message clears as soon as its field becomes valid. |
| Cache after create | `invalidateQueries(sessionKeys.lists())` in `onSuccess`, not awaited | The form closes at once; the new row appears when the refetch lands. The `201` body is never written into the list cache. |

## User-Visible States

* **Loading:** translated text in a `role="status"` region.
* **Error:** `role="alert"` region with one generic translated message and a `Try again` button
  that refetches.
* **Empty:** translated empty-list copy.
* **Populated:** `<ul aria-label>` of rows, each showing title, translated status text, and the
  start time in a `<time datetime>` element.
* **Form:** labelled title and `datetime-local` inputs, `aria-invalid` and `aria-describedby`
  wired to the message elements, submit disabled and relabelled while the request is pending.

## i18n

Namespace `sessions` (`list`, `filter`, `status`, `form`) plus `common` for the app shell.
Both `en` and `ru` are complete; `src/shared/i18n/sessions-namespace.test.ts` guards key parity.
Validation messages are addressed by key suffix (`titleLength`, `startsAtRequired`,
`startsAtFuture`), so the model holds no sentences.

## Edge Cases And Known Limits

* An unparseable `startsAt` renders translated placeholder copy instead of throwing;
  `formatSessionStart` returns `""` rather than raising.
* `parseLocalDateTime` rejects out-of-range hours/minutes and non-existent calendar dates
  (month 13, Feb 30) before the `Date` constructor can normalize them into a different day. A DST
  spring-forward gap time is deliberately allowed to roll to the next existing instant on the same
  calendar day.
* A failed create is silent by design (decision D-06). The pending state is owned by TanStack
  Query and always releases, so submit cannot stay disabled.
* `list-error-once` fails every request within a 500 ms attempt window rather than only the first
  request, so a React development remount cannot consume the single failure. A retry clicked
  inside that window fails once more and succeeds on the next click.
* The mock store is module-scoped: a browser reload discards sessions created in the browser and
  restores the seed.
* Seed sessions `ses_101`–`ses_103` are dated mid-2027. The assertions in
  `src/mocks/data/sessions.seed.test.ts` will need new dates after August 2027.
* `datetime-local` has no single accessible name in Chrome (the control decomposes into per-unit
  spinbuttons), so the jsdom `getByLabelText` guarantee does not carry over to a real browser.
  The visible `<label for>` association is correct.

## Tests

Colocated: `create-session.test.ts`, `date-time.test.ts`, `sessions-query.test.tsx`,
`use-create-session-mutation.test.tsx`, and three behavior-level page tests
(`SessionsWorkspacePage.list|filter|create.test.tsx`). They reach MSW only through
`src/test/msw.ts` and render through `src/test/render-app.tsx`.

## Not Implemented Here

Search by title/coach/location, the `full` / `cancelled` / `completed` filter options, the
session details drawer, pagination, and optimistic updates. See
[`product.md`](../product.md) for where those sit in the plan.
