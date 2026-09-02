# task-001-onboarding-sessions: API Integration

Author role: `api-integration`. Scope: how this frontend consumes `GET /api/sessions` and
`POST /api/sessions` for the onboarding flow only. This document does not design backend
endpoints and does not change `requirements.md` or any living spec.

Inputs: `tasks/task-001-onboarding-sessions/requirements.md` (G-02, Q-01 to Q-05, Q-07, F-03,
F-05, F-06), `tasks/task-001-onboarding-sessions/task.md`, developer decisions D-01 to D-06 in
`tasks/task-001-onboarding-sessions/workflow-log.md`, `ARCHITECTURE.md` sections 3-8, and the
current code in `src/services/api/http.ts`, `src/mocks/`, `src/app/`, `src/shared/i18n/`.

`training/frontend-accelerator-assessment/` is **reference-only** for naming and payload shape
(workflow-log correction 1). Nothing in `src/` imports from it.

## 1. Contract Classification

There is no backend and no backend owner for this task. Every element below is client-owned and
served by MSW; nothing here may be promoted to `specs/api-integration.md` as confirmed truth.

| Element | Class | Source of truth |
| --- | --- | --- |
| Base path `/api`, `HttpError` behavior | Confirmed (in-repo) | `src/services/api/http.ts` |
| Paths `GET /api/sessions`, `POST /api/sessions` | Reference-shaped | API_CONTRACT.md (reference) |
| `SessionSummary` / `SessionDetails` / `ApiError` field names | Reference-shaped | API_CONTRACT.md (reference) |
| Error codes `SESSIONS_UNAVAILABLE`, `CREATE_SESSION_FAILED`, `VALIDATION_FAILED`, `INVALID_FILTER` | Reference-shaped | API_CONTRACT.md (reference) |
| Query-parameter policy (Q-02) | Proposed here | this document |
| POST default field values (D-02) | Proposed here | this document |
| Cache strategy after create (Q-03) | Proposed here | this document |
| `http.ts` error-body handling (Q-04) | Decided: no change | this document |
| Seed data content and mock scenario switch (D-03, Q-07) | Proposed here | this document |
| Blocked contract elements | None | - |

## 2. Resolved Decisions

| Id | Decision | Rationale (one line) |
| --- | --- | --- |
| Q-01 | Parse `datetime-local` by components into a local `Date`, send `toISOString()` truncated to seconds, compare **minute buckets** with `now` and require strictly greater, re-run the check inside submit. | Minute granularity matches the input's own precision, so "the current minute" is rejected deterministically regardless of the seconds on the wall clock. |
| Q-02 | Omit empty parameters: `All` sends `GET /api/sessions`, the filter sends `GET /api/sessions?status=scheduled`; `query` is never sent. The handler treats missing or empty `status` as "no filter" and answers `400 INVALID_FILTER` for an unsupported non-empty value. | A minimal URL keeps the TanStack Query key readable while the tolerant handler still accepts the contract's "required with empty default" reading. |
| Q-03 | (b) invalidate and refetch only; the `201` body is **not** written into the list cache. | The mock filters server-side, so only a refetch produces a correct list for the active filter, and a single write path avoids duplicating normalization in the client. |
| Q-04 | `src/services/api/http.ts` stays exactly as it is; the feature maps any list failure to one generic translated message. | With AC-22 dropped (D-06) nothing in scope reads `code`, `message`, or `fieldErrors`, and the server `message` is English-only so AC-04 forbids rendering it anyway. |
| D-02 | Seven fixed defaults live in the **feature model** (`buildCreateSessionRequest`), not in the endpoint wrapper; the wrapper accepts the full contract body. | The reduced form is an onboarding scope choice, so it belongs to the feature, while `src/services/` keeps expressing the whole contract. |
| Q-07 | Two triggers, both inside the mock boundary: `server.use(..., { once: true })` in tests, and a `?mock=<scenario>` page-URL switch read by the handler in the browser. | Presentation code never learns a scenario name; the switch is read from `window.location` inside `src/mocks/`, which no layer imports. |
| Q-05 / D-03 | Already settled: local future-dated seed under `src/mocks/`, no fixture-clock rebasing. | Restated here only as the seed shape in section 7. |

### 2.1 Q-01 in full

**Conversion.** `<input type="datetime-local">` yields a local wall-clock string with no zone and
no seconds, for example `2027-03-14T18:30`. Parse it by components rather than with
`new Date(string)` so engine-specific string parsing cannot change the meaning:

```ts
/** Parses a `datetime-local` value as local wall-clock time. Returns null when malformed. */
export function parseLocalDateTime(value: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
	if (!match) return null;
	const [, year, month, day, hour, minute] = match;
	if (!year || !month || !day || !hour || !minute) return null;
	const date = new Date(
		Number(year),
		Number(month) - 1,
		Number(day),
		Number(hour),
		Number(minute),
		0,
		0,
	);
	return Number.isNaN(date.getTime()) ? null : date;
}

/** ISO 8601 UTC, second precision, e.g. `2027-03-14T17:30:00Z`. */
export function toIsoUtcSeconds(date: Date): string {
	return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}
```

Truncating the milliseconds is a local normalization (permitted by "Contract Authority": local
normalization functions are allowed) and keeps created records visually identical to the seed.

**Comparison.** Floor both sides to the start of their minute and require strictly greater:

```ts
function startOfMinute(date: Date): number {
	return Math.floor(date.getTime() / 60_000) * 60_000;
}

/** True only when `value` is at least the next full minute after `now`. */
export function isFutureLocalDateTime(value: string, now: Date = new Date()): boolean {
	const parsed = parseLocalDateTime(value);
	if (!parsed) return false;
	return startOfMinute(parsed) > startOfMinute(now);
}
```

Consequences, matching AC-17: an empty or malformed value is invalid; a past value is invalid;
**the current minute is rejected** (at `18:30:42` the value `18:30` floors to the same bucket, so
it is not strictly greater); `18:31` is accepted. A DST spring-forward gap time rolls forward to
the next existing instant, which is standard `Date` behavior and acceptable here.

**Re-run on submit.** The rule runs twice: on change/blur for the inline message (AC-18) and again
as the first statement of the submit handler with a fresh `new Date()`, before the request body is
built. If the second check fails, no `POST` is issued (AC-19) and the message is shown. This is
what protects a form that sat open across a minute boundary.

**Test determinism.**

1. *Clock.* Do **not** freeze time for the flow tests. Derive the input value from the real clock
   (`now + 24h`, formatted back into a `datetime-local` string). The value is then future on any
   machine, and no fake timers interact with MSW, TanStack Query, or `user-event`. Freeze time only
   in a synchronous unit test of `isFutureLocalDateTime` with
   `vi.setSystemTime(new Date("2027-03-14T12:00:30Z"))` plus `vi.useRealTimers()` in cleanup, where
   no async work is in flight. That unit test is the place to assert the current-minute rejection.
2. *Timezone (AC-02).* Do not depend on the machine zone. Give the display formatter an optional
   explicit zone and assert through it:

```ts
export function formatSessionStart(
	isoUtc: string,
	options?: { locale?: string; timeZone?: string },
): string {
	return new Intl.DateTimeFormat(options?.locale ?? "en", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: options?.timeZone,
	}).format(new Date(isoUtc));
}
```

The UI calls it with the active i18n language and no `timeZone`, so it renders in the user's zone.
The AC-02 unit test calls
`formatSessionStart("2027-08-03T16:00:00Z", { locale: "en-GB", timeZone: "Europe/Berlin" })` and
asserts the rendered time is `18:00`, which proves the UTC-to-local conversion instead of a
verbatim `16:00`. The rendering test then asserts the row text equals
`formatSessionStart(seed.startsAt, { locale: "en" })`, which is machine-independent.

Alternative, not recommended: pinning `TZ` for the whole Vitest run. It requires editing
`package.json` or `vite.config.ts`, which is shared configuration outside this task's blast radius.

Placement note: these helpers serve exactly one feature, so `src/features/sessions/model/`
(proposed file `date-time.ts`) is the right home per ARCHITECTURE.md section 10. Final placement is
`architect`'s call; nothing in this document depends on it.

### 2.2 Q-02 in full

* `All` -> `GET /api/sessions`
* `Scheduled` -> `GET /api/sessions?status=scheduled`
* `query` is never sent (A-08: it has no UI in this scope).

The filter is applied **server-side in the handler**, not client-side, which satisfies F-05
(`meta.total` is computed after filtering) and keeps the boundary honest. Consequence: switching
the filter issues a second `GET` under a different query key. AC-01 ("exactly one `GET` on opening
the route") still holds because only one query is mounted and TanStack Query deduplicates.

Handler contract for `status`: absent or `""` means no filter; one of
`scheduled | full | cancelled | completed` filters exactly; anything else returns
`400 INVALID_FILTER`. The client can only produce the first two cases, so the `400` branch is
defensive, not a user-reachable state.

### 2.3 Q-03 in full

On `201`:

1. The mutation's `onSuccess` calls
   `queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })` without awaiting it, then
   closes and resets the form (D-05). The active filter is untouched (AC-12).
2. The `201` body is not written into any list cache entry with `setQueryData`. Reason: the list
   cache is keyed per filter and the server owns filtering and ordering; a manual write would have
   to reimplement both and could seed a filter bucket the server would not have returned.
3. The created session survives the refetch because the mock inserts it into a module-level store
   (section 7). Its `status` is `scheduled` (A-03), so it is visible under both `All` and the
   `Scheduled` filter (D-01).

`invalidateQueries` refetches active queries by default, and the workspace stays mounted, so the
visible list refreshes without any extra call. Rejected alternative: `placeholderData:
keepPreviousData` on the list query — it keeps stale rows on screen while a filter switch is in
flight, which works against AC-03 and AC-10 being observable.

### 2.4 Q-04 in full

**Decision: no change to `src/services/api/http.ts`.** F-03 is accurate — `HttpError` carries only
`status`, `url`, and a generic message — and that is sufficient for this scope:

* AC-04 needs exactly one translated, human-readable list-error message plus a retry control, with
  no raw status code. The client maps *any* list failure (HTTP error or network failure) to
  `sessions:list.error.message`.
* AC-22 is dropped (D-06), so no create-error message and no `fieldErrors` rendering exists.
* The server-side `message` strings are English-only, so rendering them would violate AC-24.

For a later task that does need the body, the minimal extension is recorded here and is explicitly
**not part of this task**:

```ts
export class HttpError extends Error {
	readonly status: number;
	readonly url: string;
	readonly code?: string;
	readonly body?: unknown;

	constructor(status: number, url: string, init?: { code?: string; body?: unknown }) {
		super(`Request failed with status ${status}`);
		this.name = "HttpError";
		this.status = status;
		this.url = url;
		this.code = init?.code;
		this.body = init?.body;
	}
}
```

with `request()` doing `const body = await response.json().catch(() => undefined);` on the
non-2xx branch and passing `{ body, code: extractErrorCode(body) }`. Do not implement it now.

## 3. TypeScript Types

Proposed file: `src/services/api/endpoints/sessions.types.ts`. Types only, so `src/mocks/` can
import them with `import type` (allowed by ARCHITECTURE.md section 5) without pulling in the
wrapper at runtime.

```ts
export type SessionType = "training" | "camp" | "private";
export type SessionStatus = "scheduled" | "full" | "cancelled" | "completed";
export type SessionVisibility = "public" | "invite-only";

export const SESSION_STATUSES = ["scheduled", "full", "cancelled", "completed"] as const;

export type CoachSummary = {
	id: string;
	name: string;
	email: string;
};

export type LocationSummary = {
	name: string;
	address: string;
};

export type SessionSummary = {
	id: string;
	title: string;
	type: SessionType;
	status: SessionStatus;
	/** ISO 8601 UTC, e.g. `2027-08-03T16:00:00Z`. Rendered in the user's local timezone. */
	startsAt: string;
	durationMinutes: number;
	capacity: number;
	bookedCount: number;
	visibility: SessionVisibility;
	coach: CoachSummary;
	location: LocationSummary;
	/** ISO 8601 UTC. */
	updatedAt: string;
};

export type SessionDetails = SessionSummary & {
	description: string | null;
	trainerNotes: string | null;
	/** ISO 8601 UTC. */
	createdAt: string;
	cancellation: null | { reason: string | null; cancelledAt: string };
};

export type SessionsListMeta = {
	page: number;
	pageSize: number;
	total: number;
};

/** `GET /api/sessions` success body. */
export type SessionsListResponse = {
	data: SessionSummary[];
	meta: SessionsListMeta;
};

/** `GET /api/sessions` request inputs. Omitted keys are omitted from the query string. */
export type ListSessionsParams = {
	status?: SessionStatus;
};

/** `POST /api/sessions` request body. Full contract shape; no field is optional-by-default. */
export type CreateSessionRequest = {
	title: string;
	/** ISO 8601 UTC. */
	startsAt: string;
	type: SessionType;
	durationMinutes: number;
	coachId: string;
	locationName: string;
	locationAddress: string;
	capacity: number;
	visibility: SessionVisibility;
	description?: string | null;
	trainerNotes?: string | null;
};

/** `POST /api/sessions` `201` body. */
export type CreateSessionResponse = SessionDetails;

/** Error body shape used by every failing response in this scope. Not read by the UI (Q-04). */
export type ApiErrorBody = {
	error: {
		code: string;
		message: string;
		fieldErrors?: Record<string, string>;
	};
};
```

`SESSION_STATUSES` is a value, so it lives here only if the file is allowed to export one; if the
project prefers types-only files, move the constant to `sessions.ts`. The mock uses it to validate
the `status` parameter.

## 4. Endpoint Wrappers

Proposed file: `src/services/api/endpoints/sessions.ts`. These are the only two functions allowed
to build a session URL. No `fetch` anywhere else; no `fetch` at all in `src/features/**`.

```ts
import { http } from "@/services/api/http";
import type {
	CreateSessionRequest,
	CreateSessionResponse,
	ListSessionsParams,
	SessionsListResponse,
} from "./sessions.types";

const SESSIONS_PATH = "/sessions";

/** Builds `?status=scheduled` or `""`. Empty values are omitted (Q-02). */
function buildSessionsQuery(params: ListSessionsParams): string {
	const search = new URLSearchParams();
	if (params.status) search.set("status", params.status);
	const queryString = search.toString();
	return queryString ? `?${queryString}` : "";
}

export function listSessions(
	params: ListSessionsParams = {},
	options: { signal?: AbortSignal } = {},
): Promise<SessionsListResponse> {
	return http.get<SessionsListResponse>(`${SESSIONS_PATH}${buildSessionsQuery(params)}`, {
		signal: options.signal,
	});
}

export function createSession(
	body: CreateSessionRequest,
	options: { signal?: AbortSignal } = {},
): Promise<CreateSessionResponse> {
	return http.post<CreateSessionResponse>(SESSIONS_PATH, body, { signal: options.signal });
}
```

Notes.

* `http.get` / `http.post` already accept `RequestInit` extras, so `signal` passes through
  unchanged. Passing the TanStack Query `signal` gives free cancellation when the user switches the
  filter mid-flight.
* The wrappers do not catch, retry, or translate. `HttpError` propagates to the query/mutation.
* The wrappers do not fill defaults. `createSession` demands the complete contract body (D-02).

## 5. Feature Model Contracts

Proposed files under `src/features/sessions/model/`. Listed here because they define the
request/response boundary; `architect` owns final file naming and `ui-designer` owns presentation.

### 5.1 Query keys and list query

```ts
export const sessionKeys = {
	all: ["sessions"] as const,
	lists: () => [...sessionKeys.all, "list"] as const,
	list: (params: ListSessionsParams) => [...sessionKeys.lists(), params] as const,
};
```

`useSessionsQuery(status: SessionStatus | undefined)`:

| Option | Value | Reason |
| --- | --- | --- |
| `queryKey` | `sessionKeys.list({ status })` | Mirrors the request exactly; filter change is a new key. |
| `queryFn` | `({ signal }) => listSessions({ status }, { signal })` | Server-side filtering (Q-02) plus cancellation. |
| `retry` | `false` | AC-04/AC-05 must be reachable on the first failure; the global default is `retry: 1`, which would swallow a one-shot error handler and double the request count. |
| `staleTime` | default `0` | Nothing in scope benefits from caching; `refetchOnWindowFocus:false` is already global. |
| `placeholderData` | not set | See section 2.3. |

The UI derives the empty state from `data.data.length === 0` (AC-06), not from `meta.total`.
`meta` is passed through and otherwise unused (pagination is a non-goal).

### 5.2 Create mutation and D-02 defaults

```ts
export const CREATE_SESSION_DEFAULTS = {
	type: "training",
	durationMinutes: 90,
	coachId: "coach_01",
	locationName: "North Court",
	locationAddress: "18 Harbor Street",
	capacity: 18,
	visibility: "public",
} as const satisfies Omit<CreateSessionRequest, "title" | "startsAt">;

export type CreateSessionFormValues = {
	title: string;
	/** Raw `datetime-local` value, local wall clock. */
	startsAtLocal: string;
};

/** Trims the title (AC-16) and converts local wall clock to ISO 8601 UTC (A-04). */
export function buildCreateSessionRequest(values: CreateSessionFormValues): CreateSessionRequest {
	const startsAt = parseLocalDateTime(values.startsAtLocal);
	if (!startsAt) throw new Error("startsAtLocal must be validated before building the request");
	return {
		...CREATE_SESSION_DEFAULTS,
		title: values.title.trim(),
		startsAt: toIsoUtcSeconds(startsAt),
	};
}
```

Owning module: `src/features/sessions/model/` (proposed `create-session.ts`). The values are the
onboarding scope reduction, so they are feature knowledge, not transport knowledge. `description`
and `trainerNotes` are omitted from the body entirely rather than sent as `null`.

`useCreateSessionMutation()`:

| Option | Value | Reason |
| --- | --- | --- |
| `mutationFn` | `(values) => createSession(buildCreateSessionRequest(values))` | Single place where the body is assembled. |
| `retry` | default `false` | Never auto-retry a non-idempotent create; the contract offers no idempotency key and the client must not fabricate one. |
| `onSuccess` | `queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })`, then close+reset the form | Q-03 and D-05. |
| `onError` | no handler | D-06: no create-error UI. |
| duplicate submission | submit disabled while `isPending`, and the submit handler returns early when `isPending` | AC-20; exactly one `POST` per double activation. |
| pending release | `isPending` is owned by TanStack Query and flips to `false` on settle, success or failure | D-06 guardrail: the control can never stay permanently disabled. |

Because `onSuccess` does not await the invalidation, the form closes immediately and the new row
appears when the refetch resolves. Tests must `await` the row via `findBy*`.

## 6. Request And Response Examples

```http
GET /api/sessions
200 { "data": [ /* 5 SessionSummary */ ], "meta": { "page": 1, "pageSize": 10, "total": 5 } }

GET /api/sessions?status=scheduled
200 { "data": [ /* ses_101, ses_103 */ ], "meta": { "page": 1, "pageSize": 10, "total": 2 } }

GET /api/sessions        (list-error scenario)
500 { "error": { "code": "SESSIONS_UNAVAILABLE", "message": "Sessions cannot be loaded right now." } }
```

```http
POST /api/sessions
Content-Type: application/json

{
  "title": "Morning Shooting Block",
  "startsAt": "2027-03-14T17:30:00Z",
  "type": "training",
  "durationMinutes": 90,
  "coachId": "coach_01",
  "locationName": "North Court",
  "locationAddress": "18 Harbor Street",
  "capacity": 18,
  "visibility": "public"
}

201
{
  "id": "ses_900",
  "title": "Morning Shooting Block",
  "type": "training",
  "status": "scheduled",
  "startsAt": "2027-03-14T17:30:00Z",
  "durationMinutes": 90,
  "capacity": 18,
  "bookedCount": 0,
  "visibility": "public",
  "coach": { "id": "coach_01", "name": "Maya Brooks", "email": "maya@example.test" },
  "location": { "name": "North Court", "address": "18 Harbor Street" },
  "createdAt": "2026-09-02T12:00:00Z",
  "updatedAt": "2026-09-02T12:00:00Z",
  "description": null,
  "trainerNotes": null,
  "cancellation": null
}
```

## 7. Mock Boundary

All of this lives under `src/mocks/` (D-03). No layer imports it; it may import types and
constants from `services/` and `shared/`.

### 7.1 Seed data — `src/mocks/data/sessions.seed.ts`

Shape: `SessionSummary[]` (the store only serves the list endpoint; `GET /api/sessions/:id` is an
explicit non-goal). Five records mirroring the reference naming and status mix so AC-09 and AC-10
stay checkable, all `startsAt` values in the future per D-03.

| id | title | type | status | startsAt (UTC) | duration | capacity | booked | visibility | coach | location |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ses_101` | U14 Shooting Lab | training | `scheduled` | `2027-08-03T16:00:00Z` | 90 | 18 | 14 | public | `coach_01` Maya Brooks | North Court, 18 Harbor Street |
| `ses_102` | Varsity Defense Intensive | camp | `full` | `2027-08-04T13:30:00Z` | 180 | 24 | 24 | public | `coach_02` Ethan Cole | Central Sports Hall, 240 Market Avenue |
| `ses_103` | Private Footwork Review | private | `scheduled` | `2027-08-05T17:00:00Z` | 60 | 1 | 0 | invite-only | `coach_01` Maya Brooks | Studio B, 18 Harbor Street |
| `ses_104` | Weekend Ball Handling | training | `cancelled` | `2027-08-08T09:00:00Z` | 75 | 16 | 9 | public | `coach_03` Lena Ortiz | West Community Gym, 51 Pine Road |
| `ses_105` | U12 Team Fundamentals | training | `completed` | `2027-07-24T15:00:00Z` | 90 | 20 | 17 | public | `coach_02` Ethan Cole | Central Sports Hall, 240 Market Avenue |

`updatedAt`: `2027-07-26T09:15:00Z`, `2027-07-27T07:40:00Z`, `2027-07-25T15:20:00Z`,
`2027-07-27T11:05:00Z`, `2027-07-24T17:10:00Z` respectively. Coach emails follow the reference
pattern `<first-name>@example.test`.

Also export `MOCK_COACHES: CoachSummary[]` (the three coaches above) so the `POST` handler can
resolve `coachId` into a full `coach` object. The seed array is a factory
(`createSeedSessions(): SessionSummary[]`) or is deep-cloned on reset, so no test can mutate the
literal.

Two properties are load-bearing: the two `scheduled` titles are exactly `U14 Shooting Lab` and
`Private Footwork Review` (AC-10 names them), and `2027-08-03T16:00:00Z` is the AC-02 probe value.

### 7.2 In-memory store — `src/mocks/db/sessions-db.ts`

```ts
type ListArgs = { status?: SessionStatus };

/** Sorted by `startsAt` ascending, then `id`, so ordering is deterministic. */
export function listSessions(args: ListArgs): SessionSummary[];
/** Appends and returns the stored record. */
export function insertSession(session: SessionSummary): SessionSummary;
/** Restores the seed and resets the id counter. Call in `beforeEach` in tests. */
export function resetSessionsDb(): void;
/** `ses_900`, `ses_901`, ... */
export function nextSessionId(): string;
```

Vitest isolates modules per test file, so the store cannot leak across files; `resetSessionsDb()`
in a `beforeEach` covers within-file isolation. `src/test/setup.ts` needs no change.

### 7.3 Scenario switch — `src/mocks/scenario.ts` (Q-07)

```ts
export type MockScenario = "normal" | "empty" | "slow" | "list-error" | "list-error-once"
	| "create-error";

/** Reads the *page* URL, never the request URL. Defaults to `normal` outside the browser. */
export function currentScenario(): MockScenario {
	if (typeof window === "undefined") return "normal";
	const raw = new URLSearchParams(window.location.search).get("mock");
	return isMockScenario(raw) ? raw : "normal";
}
```

* **Browser (manual check).** MSW browser handlers execute in the page context, so
  `window.location.search` is the app URL. Open `http://localhost:5173/sessions?mock=list-error-once`
  to see the error state and then a successful retry (AC-04 + AC-05 in one page load),
  `?mock=slow` for the loading state (AC-03), `?mock=empty` for AC-06. No production module reads
  the parameter; the router never registers it; the components receive ordinary success or error
  results (F-10).
* **Tests.** Use `server.use()` overrides instead of the switch — in jsdom the search string is
  empty, so `currentScenario()` is always `normal` and the default handlers apply:

```ts
server.use(
	http.get("/api/sessions", () => HttpResponse.json(LIST_ERROR_BODY, { status: 500 }), {
		once: true,
	}),
);
```

  With `retry: false` on the query, the first request fails (AC-04) and the user-triggered retry
  falls through to the default handler and succeeds (AC-05). Export `LIST_ERROR_BODY` and
  `CREATE_ERROR_BODY` from `src/mocks/` so tests do not hand-roll bodies.

  Layering note for `code-reviewer`: a colocated test under `src/features/**` importing
  `@/mocks/server` is the idiomatic MSW pattern but reads oddly against "nothing in the four layers
  imports from `src/mocks`". Recommended resolution: add `src/test/msw.ts` re-exporting `server`,
  `LIST_ERROR_BODY`, and `CREATE_ERROR_BODY`, and have tests import from `@/test/msw`, so no file
  under `src/features/**` names `@/mocks/**`. Direct import is acceptable if the developer reads
  the rule as production-only; either way, no non-test module imports `src/mocks`.

### 7.4 Handlers — `src/mocks/handlers.ts`

`handlers.ts` stays the single registration point (ARCHITECTURE.md section 5) and holds the two
resolvers.

**`http.get("/api/sessions")`**

1. `scenario = currentScenario()`. `list-error` -> `500 SESSIONS_UNAVAILABLE` always;
   `list-error-once` -> `500` for the first call after load, then normal; `empty` -> `200` with
   `{ data: [], meta: { page: 1, pageSize: 10, total: 0 } }`; `slow` -> `await delay(1500)` then
   normal. `normal` adds no artificial latency, so the test suite stays fast.
2. Read `status` from `new URL(request.url).searchParams`. Absent or `""` -> no filter. A value
   outside `SESSION_STATUSES` -> `400 { error: { code: "INVALID_FILTER", message: ... } }`.
3. `data = listSessions({ status })` from the store, sorted by `startsAt` then `id`.
4. `meta = { page: 1, pageSize: 10, total: data.length }` — computed **after** filtering (F-05).
5. `200 { data, meta }`.

**`http.post("/api/sessions")`**

1. `create-error` scenario -> `500 { error: { code: "CREATE_SESSION_FAILED", ... } }`. Kept so the
   D-06 guardrail (submit re-enables when the request settles) can be exercised in the browser,
   even though no message is shown by design.
2. Read the body as `CreateSessionRequest`. Validate: `title` present and trimmed length 3..80;
   `startsAt` a parseable ISO string; `type` and `visibility` in their enums; `durationMinutes` and
   `capacity` finite and greater than zero; `coachId` present in `MOCK_COACHES`. On failure ->
   `400 { error: { code: "VALIDATION_FAILED", message, fieldErrors } }`. The client prevents this
   (AC-15, AC-17, AC-19), so it is a boundary guard, not a user-reachable state.
3. Build the record: `id = nextSessionId()`, `title` echoed as submitted (already trimmed by the
   client), `startsAt` echoed, `status: "scheduled"` (A-03), `bookedCount: 0`, `coach` resolved from
   `coachId`, `location = { name: locationName, address: locationAddress }`, `createdAt` and
   `updatedAt` = `toIsoUtcSeconds(new Date())`.
4. `insertSession(summary)` — this is what makes the session survive the refetch from Q-03.
5. `201` with the full `SessionDetails` body (`description: null`, `trainerNotes: null`,
   `cancellation: null` added to the stored summary).

No handler ever reads application state, and no application module ever reads a scenario name.

## 8. State And Error Matrix

| State | Trigger | Client behavior | Copy source | AC |
| --- | --- | --- | --- | --- |
| List loading | `useQuery` `isPending` | Loading indicator, zero rows | `sessions:list.loading` | AC-03 |
| List success | `200`, `data.length > 0` | One row per session: title, translated status label, `formatSessionStart(startsAt)` | `sessions:status.*` | AC-01, AC-02, AC-07 |
| List empty | `200`, `data.length === 0` | Translated empty message, no error | `sessions:list.empty` | AC-06 |
| List error | any rejection from `listSessions` (`HttpError` or network) | One generic translated message plus a retry control; no status code, no `error.message` from the body | `sessions:list.error.message`, `sessions:list.error.retry` | AC-04 |
| List retry | retry control -> `refetch()` | Re-issues the same `GET`; success replaces the error state in place | - | AC-05 |
| Filter change | `All` <-> `Scheduled` | New query key, new `GET`, previous request aborted via `signal` | `sessions:filter.*` | AC-08..AC-11 |
| Validation blocked | title or start invalid at submit time | No `POST` issued; message rendered next to the field | `sessions:form.validation.*` | AC-15, AC-17..AC-19 |
| Create pending | mutation `isPending` | Submit disabled and handler early-returns; translated pending text | `sessions:form.pending` | AC-20 |
| Create success | `201` | Invalidate lists, close and reset the form, keep the filter | - | AC-12, AC-21 |
| Create failure | `500` / network | **No message** (D-06). `isPending` returns to `false`, form values kept, submit usable again | - | D-06 guardrail |

Nothing in this matrix leaks a status code, a URL, a stack, or an English-only server string.

## 9. i18n Keys Required By The Integration

Namespace `sessions`, registered in the `resources` map in `src/shared/i18n/index.ts` next to
`common`. Files: `src/shared/i18n/locales/{en,ru}/sessions.json`. Wording is a proposal;
`ui-designer` may restyle the copy, but every key below must exist in both locales.

```json
{
  "list": {
    "loading": "Loading sessions…",
    "empty": "No training sessions yet.",
    "error": {
      "message": "Training sessions could not be loaded.",
      "retry": "Try again"
    }
  },
  "filter": { "label": "Status", "all": "All", "scheduled": "Scheduled" },
  "status": {
    "scheduled": "Scheduled",
    "full": "Full",
    "cancelled": "Cancelled",
    "completed": "Completed"
  },
  "form": {
    "pending": "Creating…",
    "validation": {
      "titleLength": "Enter a title between 3 and 80 characters.",
      "startsAtRequired": "Enter a start date and time.",
      "startsAtFuture": "The start date and time must be in the future."
    }
  }
}
```

```json
{
  "list": {
    "loading": "Загрузка тренировок…",
    "empty": "Тренировок пока нет.",
    "error": {
      "message": "Не удалось загрузить тренировки.",
      "retry": "Повторить"
    }
  },
  "filter": { "label": "Статус", "all": "Все", "scheduled": "Запланированные" },
  "status": {
    "scheduled": "Запланирована",
    "full": "Мест нет",
    "cancelled": "Отменена",
    "completed": "Завершена"
  },
  "form": {
    "pending": "Создание…",
    "validation": {
      "titleLength": "Введите название длиной от 3 до 80 символов.",
      "startsAtRequired": "Укажите дату и время начала.",
      "startsAtFuture": "Дата и время начала должны быть в будущем."
    }
  }
}
```

Form labels, the open-form control, and the submit label are `ui-designer` copy and are not
mandated here. `common:action.retry` already exists and may be reused instead of
`sessions:list.error.retry`; pick one and keep it consistent.

## 10. Test Strategy For The Integration Boundary

Owned by `test-generator` / `coder`; listed here as the integration-side expectations.

1. **AC-25 behavior test** (at least one, both are cheap): render the workspace with a test
   `QueryClient` configured `retry: false`, let the default MSW handlers serve the seed, then
   (a) select `Scheduled` and assert `U14 Shooting Lab` and `Private Footwork Review` remain while
   `Varsity Defense Intensive`, `Weekend Ball Handling`, and `U12 Team Fundamentals` disappear; and
   (b) open the form, type a valid title and `now + 24h`, submit, and `findBy` the new title in the
   list.
2. **Request counting** (AC-01, AC-19, AC-20): use `server.events.on("request:start", ...)` with a
   counter registered in the test, or a counting `server.use` override. Do not count by spying on
   `fetch`.
3. **AC-03 / AC-20 timing**: `server.use` with `await delay(...)` from `msw`, not fake timers.
4. **AC-04 / AC-05**: the `{ once: true }` override from section 7.3.
5. **AC-06**: `server.use` returning `{ data: [], meta: { page: 1, pageSize: 10, total: 0 } }`.
6. **AC-02 / Q-01**: the two unit tests described in section 2.1 (explicit `timeZone` formatting,
   `vi.setSystemTime` for the current-minute rejection).
7. **AC-24**: `await i18n.changeLanguage("ru")` and assert one integration-owned string, for
   example the list error message, then restore `en`.
8. `beforeEach(resetSessionsDb)` in any file that creates sessions.

## 11. Traceability

| Requirement | Where it is answered |
| --- | --- |
| G-02 request/response types | Section 3 |
| G-02 query-parameter policy (Q-02) | Sections 2.2, 4, 7.4 |
| G-02 POST defaults (D-02) | Section 5.2 |
| G-02 meaning of `201` for the list (Q-03) | Sections 2.3, 5.2, 7.4 |
| G-02 `http.ts` error body (Q-04) | Section 2.4 |
| G-02 fixture clock (Q-05 / D-03) | Section 7.1 |
| G-02 future rule and UTC conversion (Q-01) | Section 2.1 |
| Q-07 error-state trigger | Section 7.3 |
| F-03 | Section 2.4 |
| F-05 (`meta.total` after filtering) | Section 7.4 |
| F-06 (full POST body, no fabricated idempotency) | Sections 3, 4, 5.2 |
| Manual API mode, no `fetch` in features | Sections 4, 5 |

## 12. Risks And Residual Gaps

1. **Static future seed dates.** `2027-*` values become past dates after mid-2027, which will look
   odd next to the "must be in the future" rule. Accepted consequence of D-03 (no clock rebasing);
   record it as a known limitation in `workflow-log.md`.
2. **`completed` and `cancelled` seeds are future-dated.** D-03 says every seeded `startsAt` is in
   the future, so a "completed" session sits in 2027. Semantically odd but harmless for AC-09 and
   AC-10. The one-line alternative, if the developer ever wants it, is to give `ses_105` a past
   `startsAt`; that would re-open D-03, so it is not applied here.
3. **Silent create failure.** D-06 means a `500` on `POST` leaves the user with no feedback beyond
   the form re-enabling. Deliberate; already recorded by the developer.
4. **Server-side filtering costs an extra request per filter change.** Correct per F-05 and the
   mocking guidance, but tests must await the refetch rather than assert synchronously.
5. **`retry: false` on the list query** deviates from the global `retry: 1` in
   `src/app/providers.tsx`. It is a per-query option, so no shared configuration changes; if the
   reviewer prefers the global default, AC-04 and AC-05 need a persistent error handler instead of
   the `{ once: true }` override.
6. **Test import of `@/mocks/server`** from a colocated feature test — see the layering note in
   section 7.3. Needs one explicit call from the developer or `code-reviewer`.
7. **No backend owner exists.** Every element in section 1 marked "reference-shaped" or "proposed"
   is client-owned. If this repository later gains a real backend, all of it needs re-confirmation,
   and none of it belongs in `specs/api-integration.md` today.
