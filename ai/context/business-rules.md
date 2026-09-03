# Business Rules

Rules that must hold across every screen and every layer. Where a rule is enforced twice, both
places are listed: the client rule is what the user sees, the mock rule is what the API boundary
would reject if the client were bypassed.

## Domain Value Sets

Declared once in `src/services/api/endpoints/sessions.types.ts`. The runtime tuple
`SESSION_STATUSES` and the `SessionStatus` union are derived from the same constant, so the mock's
filter guard and the compile-time type cannot drift apart.

* **Status:** `scheduled`, `full`, `cancelled`, `completed`.
* **Type:** `training`, `camp`, `private`.
* **Visibility:** `public`, `invite-only`.

## Time

* Every timestamp on the wire is ISO 8601 UTC with second precision
  (`2027-08-03T16:00:00Z`). `toIsoUtcSeconds` produces that shape; the milliseconds JavaScript
  adds are stripped.
* Every timestamp on screen is rendered in the user's own timezone and active locale
  (`formatSessionStart`, `Intl.DateTimeFormat`, `dateStyle: "medium"` + `timeStyle: "short"`).
* A start time is "in the future" only when it is at least the next full minute after now
  (`isFutureLocalDateTime` compares minute floors). A time in the current minute is rejected.

## Creating A Session

* **Title:** trimmed before anything else; the trimmed value must be 3–80 characters, and the
  trimmed value is what is sent. Enforced in `validateCreateSessionForm` and again in the mock's
  `validateCreateBody`.
* **Start time:** required, and strictly future relative to the moment of submission. The form
  re-validates against a fresh clock on submit, so a form left open across a minute boundary
  cannot post a past time.
* **No request while invalid:** `POST /api/sessions` is never issued while any validation error
  exists.
* **One request per submission:** the submit control is disabled while the mutation is pending
  and the submit handler returns early when pending.
* **Fields the onboarding form does not collect** are sent as fixed defaults from
  `CREATE_SESSION_DEFAULTS` (`type: training`, `durationMinutes: 90`, `coachId: coach_01`,
  `locationName: North Court`, `locationAddress: 18 Harbor Street`, `capacity: 18`,
  `visibility: public`). The endpoint wrapper in `src/services/` still expresses the full
  contract body; the reduced form is a feature-level scope choice.
* **A created session** always comes back `status: "scheduled"` with `bookedCount: 0` and an id
  from the `ses_900+` sequence.

## Filtering

* The UI offers exactly two choices today: `All` and `Scheduled`. `All` is the initial selection.
* `All` sends `GET /api/sessions` with no query string; the status filter sends
  `?status=scheduled`. Empty parameters are never serialized.
* The active filter lives in the page URL (`?status=scheduled`) and survives creating a session.
* The API accepts any of the four statuses. A non-empty unsupported value answers `400`
  `INVALID_FILTER`.

## Failure Handling

* Any list failure — HTTP error or network error — maps to one generic translated message plus a
  retry control. Server `code`, `message`, and `fieldErrors` are never rendered: they are
  English-only, and no UI copy may bypass i18n.
* The list query does not auto-retry (`retry: false`), so the first failure is visible
  immediately. The global default for other queries is `retry: 1`.
* A failed create shows the user no message (decision D-06 for the onboarding scope). The form
  stays open with its values intact and the submit control returns to enabled, so the attempt is
  always repeatable.

## Presentation Invariants

* Status is conveyed as translated text, never by color alone.
* No user-facing string is hardcoded; every string resolves through the `common` or `sessions`
  i18n namespace and exists in both `en` and `ru`.
* A malformed `startsAt` degrades to translated placeholder copy instead of throwing into the
  route error boundary.

See also: [`product.md`](product.md), [`glossary.md`](glossary.md),
[`features/sessions.md`](features/sessions.md).
