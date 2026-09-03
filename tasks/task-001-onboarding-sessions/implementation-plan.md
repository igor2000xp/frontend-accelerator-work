# task-001-onboarding-sessions: Implementation Plan

Author role: `writing-plans`. Date: `2026-09-02`.

Built from, in priority order:

1. `training/frontend-accelerator-onboarding/TASK.md` (wins on any conflict)
2. `tasks/task-001-onboarding-sessions/task.md`
3. `tasks/task-001-onboarding-sessions/requirements.md` (AC-01..AC-27, AC-22 dropped per D-06)
4. `tasks/task-001-onboarding-sessions/api-integration.md` (binding: types, wrapper signatures,
   query keys, POST defaults, seed data, scenario switch, handler algorithms, `sessions` i18n keys)
5. `tasks/task-001-onboarding-sessions/workflow-log.md` — "Developer Decisions D-01..D-06" and the
   two clarifications recorded after the `api-integration` role
6. `ARCHITECTURE.md` (sections 3-8, 10), `AGENTS.md`,
   `.claude/skills/react-spa-best-practices/SKILL.md`
7. Current code, read directly: `src/app/router.tsx`, `src/app/providers.tsx`,
   `src/app/AppLayout.tsx`, `src/app/App.smoke.test.tsx`, `src/services/api/http.ts`,
   `src/mocks/{handlers,server,browser}.ts`, `src/shared/i18n/index.ts`,
   `src/shared/i18n/locales/{en,ru}/common.json`, `src/test/setup.ts`, `package.json`,
   `vite.config.ts`, `tsconfig.app.json`, `biome.jsonc`

`training/frontend-accelerator-assessment/` is reference-only. No file under `src/` imports from it.

## Open Decisions

**None.** Every decision needed to execute this plan is already fixed by D-01..D-06, the two
developer clarifications, or `api-integration.md`. No task is blocked.

Four presentation details were left explicitly open by `requirements.md` G-03 (`ui-designer`
optional, "visual polish is explicitly non-blocking") and by `api-integration.md` section 9 ("form
labels, the open-form control, and the submit label are `ui-designer` copy"). They are resolved
here at the minimum needed to satisfy the acceptance criteria, not redesigned:

| Detail | Resolution | Source of authority |
| --- | --- | --- |
| Filter control type | A single `<select>` labelled by `sessions:filter.label` with two `<option>`s | AC-08 needs exactly two labelled choices; one semantic control is the minimum |
| Form placement | Inline `<form>` conditionally rendered inside the workspace page, mounted by a trigger button and unmounted on success | AC-13 requires the inputs to be absent before the trigger; D-05 requires close + reset, which unmounting gives for free |
| Retry copy key | `sessions:list.error.retry` (not `common:action.retry`) | `api-integration.md` section 9 says "pick one and keep it consistent" |
| Filter state owner | `useSearchParams` on `/sessions`, key `status` | `react-spa-best-practices/SKILL.md` "State Ownership" names "active status filter" as the `useSearchParams` example |

## Global Constraints

* **ED small layers and import direction** (`ARCHITECTURE.md` section 4): `features` never import
  `app`; `services` never import `app` or `features`; `shared` imports none of them. `src/mocks/`
  and `src/test/` are infrastructure, not layers.
* **No production module under `src/app`, `src/features`, `src/services`, `src/shared` imports from
  `src/mocks` or `src/test`.** Per the developer's accepted clarification 2, colocated *test* files
  import `server`, the canned error bodies, and `resetSessionsDb` from `@/test/msw` and the render
  helper from `@/test/render-app`; they never name `@/mocks/**`.
* **npm only.** Existing scripts only: `dev`, `build`, `lint`, `lint:fix`, `format`, `typecheck`,
  `test`, `test:watch`. No scaffolding scripts exist; folders are created by hand.
* **Biome is the single formatter/linter.** TS/TSX: tabs, indent width 4, double quotes, line width
  100. JSON/JSONC/CSS/MD: 2 spaces. Config: `biome.jsonc`.
* **i18n only.** Every user-visible string is a key present in both
  `src/shared/i18n/locales/en/sessions.json` and `.../ru/sessions.json`, with the `sessions`
  namespace registered in the `resources` map and the `ns` array in `src/shared/i18n/index.ts`.
* **Manual API mode.** `feature UI -> feature model/ hook -> src/services/api/endpoints/sessions.ts
  -> src/services/api/http.ts`. No `fetch` anywhere under `src/features/**`. `src/services/api/http.ts`
  is **not modified** (Q-04).
* **No `useMemo` / `useCallback` / `React.memo`** in this task. Filtering, validation, and formatting
  are render-time computations.
* **Every flow handles loading, empty, success, and error** (`ARCHITECTURE.md` 8.4).
* **TypeScript strict** with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`,
  `verbatimModuleSyntax`, `erasableSyntaxOnly`. `any` is forbidden. No non-null assertions (Biome
  `style/noNonNullAssertion` is in the recommended preset) — use `.at()` plus a guard.
* **Scope is closed.** Nothing from the `requirements.md` Non-Goals list: no details view, no
  search, no pagination behaviour, no extra statuses, no `GET /api/sessions/:id`, no auth, no CI.

## Dependency Map

Groups from `requirements.md`: **List** (AC-01..AC-07), **Filter** (AC-08..AC-12), **Create form**
(AC-13..AC-21), **Mock boundary and quality gates** (AC-23..AC-27). Document order is *not*
implementation order: the whole Mock boundary group is a prerequisite of the other three, because
every list, filter, and create behaviour is observed through MSW.

```text
T1  sessions.types.ts ────────────┬──────────────┬──────────────────────────────┐
                                  │              │                              │
T2  mocks/scenario.ts ────────────┤              │                              │
                                  │              │                              │
T3  mocks/data/sessions.seed.ts ──┤              │                              │
        │                         │              │                              │
T4  mocks/db/sessions-db.ts ──────┤              │                              │
        │                         │              │                              │
T5  mocks/handlers.ts ────────────┘              │                              │
        │                                        │                              │
T6  services/api/endpoints/sessions.ts + test/msw.ts                            │
        │                                        │                              │
T7  shared/i18n sessions namespace (independent) │                              │
T8  features/sessions/model/date-time.ts (independent) ─────────┐               │
        │                                        │              │               │
T9  features/sessions/model/create-session.ts ───┘              │               │
        │                                                       │               │
T10 features/sessions/model/sessions-query.ts ──────────────────┤               │
        │                                                       │               │
T11 features/sessions/model/use-create-session-mutation.ts      │               │
        │                                                       │               │
T12 features/sessions/ui list + page + barrel + app/router.tsx ◄┴───────────────┘
        │
T13 features/sessions/ui/StatusFilter.tsx
        │
T14 features/sessions/ui/CreateSessionForm.tsx
        │
T15 verification and manual browser check
```

### Forward references found and how each is resolved

| # | Forward reference | Resolution |
| --- | --- | --- |
| FR-01 | The mock store, the handlers, the endpoint wrappers, the model, and every UI component all need `SessionStatus`, `SessionSummary`, `SessionsListResponse`, `CreateSessionRequest` | `sessions.types.ts` is pulled out of the "services" group to **T1**, before the mock boundary. `src/mocks/` may import from `services/` (ARCHITECTURE.md section 5), so this direction is legal. |
| FR-02 | The GET handler's `INVALID_FILTER` guard needs a runtime list of statuses, not just a type | `SESSION_STATUSES` ships as a value in `sessions.types.ts` in **T1**, exactly as `api-integration.md` section 3 allows. |
| FR-03 | The `list-error-once` browser scenario needs a per-page-load latch that `handlers.ts` would otherwise own as hidden state | `shouldFailListRequest()` is defined and unit-tested in `src/mocks/scenario.ts` in **T2** and merely called from **T5**. Pulled forward out of the handler task so it is testable in isolation. |
| FR-04 | `handlers.ts` needs seed records, coach lookup, the store, and the id counter | **T3** (seed) and **T4** (store) precede **T5** (handlers). |
| FR-05 | `handlers.test.ts` would naturally use the typed wrappers, which are built later | The handlers test drives the mock through the **already existing** `http` client from `src/services/api/http.ts`. No raw `fetch`, no circular dependency, and the wrappers land in **T6** where their own test can assert the exact URL. |
| FR-06 | Every network-touching test needs `server`, the canned error bodies, and `resetSessionsDb`; `src/test/msw.ts` re-exports all three | `src/test/msw.ts` is created in **T6**, the first task with a consumer, after **T2** (bodies) and **T4** (`resetSessionsDb`) exist. Creating it earlier would have forced a placeholder export. |
| FR-07 | `api-integration.md` section 9 lists only the integration-owned keys; the filter label, list heading, form labels, submit label, and open-form label are needed by T12-T14 | The **complete** `sessions` namespace, integration keys plus the four presentation keys resolved above, is authored once in **T7**, ahead of all UI work, instead of being appended three times. Keys added beyond section 9: `list.heading`, `list.ariaLabel`, `form.open`, `form.heading`, `form.title.label`, `form.startsAt.label`, `form.submit`. |
| FR-08 | `SessionsList` needs `formatSessionStart`; `CreateSessionForm` needs `validateCreateSessionForm` and `buildCreateSessionRequest` | **T8** (date/time helpers) and **T9** (create-session model) precede all UI tasks. |
| FR-09 | `useCreateSessionMutation` invalidates `sessionKeys.lists()`, which the list-query module owns | **T10** defines `sessionKeys` before **T11** consumes it. |
| FR-10 | Registering `/sessions` in `src/app/router.tsx` makes the existing `src/app/App.smoke.test.tsx` (which enters `/`) mount the workspace and issue a real request; `src/test/setup.ts` runs MSW with `onUnhandledRequest: "error"` | The route is registered in **T12**, after the default handlers exist (**T5**). The smoke test is updated in the same task so the redirect is covered rather than incidentally exercised. |
| FR-11 | The POST handler must stamp `createdAt` / `updatedAt` with second-precision ISO, and `toIsoUtcSeconds` lives in the feature model, which `src/mocks/` must not import | `handlers.ts` keeps a private two-line `isoUtcSeconds()`. Deliberate duplication; moving the helper to `src/shared/` to share it would violate ARCHITECTURE.md section 10 ("serves exactly one feature? keep it in that feature"). |
| FR-12 | T13 and T14 both render the whole routed workspace and need identical wiring | `renderApp()` lands in `src/test/render-app.tsx` in **T12**, the first task that renders the route. |
| FR-13 | The `?mock=<scenario>` switch and the `status` filter share the page URL, so a naive `setSearchParams(new URLSearchParams({status}))` would drop `mock` and break the manual browser check | `handleStatusChange` in **T13** uses the functional updater form and copies the previous params. |

### Independent work

**T7** (i18n namespace) and **T8** (date/time helpers) have no dependency on T1-T6 and no dependency
on each other. They may be done at any point before T9/T12. They are listed after the mock boundary
only so the plan reads in a single direction. Everything else is strictly ordered by the arrows
above.

## Working Rhythm

Every code task is one TDD cycle:

1. write the failing test;
2. `npx vitest run <test file>` — confirm **red**, and confirm the failure message is the one
   expected (missing module, wrong value), not a typo;
3. write the minimal implementation;
4. `npx vitest run <test file>` — confirm **green**;
5. `npm run lint:fix` then `git add <files> && git commit -m "<message>"`.

`npx vitest run <path>` is the existing Vitest binary with a file filter; it is not a new script.

---

## T1 — Session transport types

**Goal.** Add the single typed description of the two endpoints that every later layer imports.

**Satisfies.** Groundwork for AC-01, AC-27; direct prerequisite of FR-01, FR-02.

**Interfaces.**

* Consumes: nothing.
* Produces — `src/services/api/endpoints/sessions.types.ts`, the full contents shown in step 1.3.

**Step 1.1 — failing test.** Create `src/services/api/endpoints/sessions.types.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { SESSION_STATUSES, type SessionStatus } from "./sessions.types";

describe("session transport types", () => {
	it("exposes the four statuses the mock filter guard validates against", () => {
		expect(SESSION_STATUSES).toEqual(["scheduled", "full", "cancelled", "completed"]);
	});

	it("includes the single filter status chosen in D-01", () => {
		const filterStatus: SessionStatus = "scheduled";
		expect(SESSION_STATUSES).toContain(filterStatus);
	});
});
```

**Step 1.2 — run red.** `npx vitest run src/services/api/endpoints/sessions.types.test.ts`
Expected: `Error: Failed to resolve import "./sessions.types"` and `Test Files 1 failed (1)`.

**Step 1.3 — implement.** Create `src/services/api/endpoints/sessions.types.ts` with exactly the
declarations from `api-integration.md` section 3:

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

**Step 1.4 — run green.** `npx vitest run src/services/api/endpoints/sessions.types.test.ts`
Expected: `Test Files 1 passed (1)` / `Tests 2 passed (2)`.

**Step 1.5 — commit.** `npm run lint:fix`, then
`git commit -m "feat(services): add session transport types for the sessions endpoints"`.

**Done check.** `SESSION_STATUSES` is importable as a value; `npm run typecheck` passes; no other
file changed. Delete `src/services/api/endpoints/.gitkeep` only in T6, when the directory has two
real files.

---

## T2 — Mock scenario switch and canned error bodies

**Goal.** Give the mock boundary a way to select deterministic scenarios from the *page* URL, and
the two error bodies tests will assert against, without any production module learning a scenario
name (F-10, Q-07).

**Satisfies.** Groundwork for AC-03, AC-04, AC-05, AC-06, AC-23; resolves FR-03.

**Interfaces.**

* Consumes: `ApiErrorBody` from `@/services/api/endpoints/sessions.types` (T1).
* Produces — `src/mocks/scenario.ts`:

```ts
export type MockScenario = "normal" | "empty" | "slow" | "list-error" | "list-error-once" | "create-error";
export function currentScenario(): MockScenario;
export function shouldFailListRequest(scenario: MockScenario): boolean;
export const LIST_ERROR_BODY: ApiErrorBody;
export const CREATE_ERROR_BODY: ApiErrorBody;
```

**Step 2.1 — failing test.** Create `src/mocks/scenario.test.ts`:

```ts
import { afterEach, describe, expect, it } from "vitest";
import { CREATE_ERROR_BODY, currentScenario, LIST_ERROR_BODY, shouldFailListRequest } from "./scenario";

afterEach(() => {
	window.history.replaceState({}, "", "/");
});

describe("currentScenario", () => {
	it("defaults to normal when the page URL carries no mock parameter", () => {
		expect(currentScenario()).toBe("normal");
	});

	it("reads a known scenario from the page URL", () => {
		window.history.replaceState({}, "", "/sessions?mock=empty");
		expect(currentScenario()).toBe("empty");
	});

	it("falls back to normal for an unknown value", () => {
		window.history.replaceState({}, "", "/sessions?mock=nope");
		expect(currentScenario()).toBe("normal");
	});
});

describe("shouldFailListRequest", () => {
	it("never fails a normal list request", () => {
		expect(shouldFailListRequest("normal")).toBe(false);
	});

	it("fails every list request for list-error", () => {
		expect(shouldFailListRequest("list-error")).toBe(true);
		expect(shouldFailListRequest("list-error")).toBe(true);
	});

	it("fails only the first list request for list-error-once", () => {
		expect(shouldFailListRequest("list-error-once")).toBe(true);
		expect(shouldFailListRequest("list-error-once")).toBe(false);
	});
});

describe("canned error bodies", () => {
	it("carries the contract error codes", () => {
		expect(LIST_ERROR_BODY.error.code).toBe("SESSIONS_UNAVAILABLE");
		expect(CREATE_ERROR_BODY.error.code).toBe("CREATE_SESSION_FAILED");
	});
});
```

**Step 2.2 — run red.** `npx vitest run src/mocks/scenario.test.ts`
Expected: `Error: Failed to resolve import "./scenario"`.

**Step 2.3 — implement.** Create `src/mocks/scenario.ts`:

```ts
import type { ApiErrorBody } from "@/services/api/endpoints/sessions.types";

export type MockScenario =
	| "normal"
	| "empty"
	| "slow"
	| "list-error"
	| "list-error-once"
	| "create-error";

const MOCK_SCENARIOS: readonly string[] = [
	"normal",
	"empty",
	"slow",
	"list-error",
	"list-error-once",
	"create-error",
];

function isMockScenario(value: string | null): value is MockScenario {
	return value !== null && MOCK_SCENARIOS.includes(value);
}

/** Reads the *page* URL, never the request URL. Defaults to `normal` outside a browser context. */
export function currentScenario(): MockScenario {
	if (typeof window === "undefined") {
		return "normal";
	}
	const raw = new URLSearchParams(window.location.search).get("mock");
	return isMockScenario(raw) ? raw : "normal";
}

let listErrorOnceUsed = false;

/** `list-error-once` fails only the first list request after a page load, so a retry can succeed. */
export function shouldFailListRequest(scenario: MockScenario): boolean {
	if (scenario === "list-error") {
		return true;
	}
	if (scenario !== "list-error-once" || listErrorOnceUsed) {
		return false;
	}
	listErrorOnceUsed = true;
	return true;
}

export const LIST_ERROR_BODY: ApiErrorBody = {
	error: { code: "SESSIONS_UNAVAILABLE", message: "Sessions cannot be loaded right now." },
};

export const CREATE_ERROR_BODY: ApiErrorBody = {
	error: { code: "CREATE_SESSION_FAILED", message: "The session could not be created." },
};
```

**Step 2.4 — run green.** `npx vitest run src/mocks/scenario.test.ts`
Expected: `Tests 7 passed (7)`.

**Step 2.5 — commit.** `npm run lint:fix`, then
`git commit -m "feat(mocks): add page-URL mock scenario switch and canned error bodies"`.

**Done check.** In jsdom `window.location.search` is empty by default, so `currentScenario()` is
`"normal"` for every other test file and the default handlers always apply — tests control
behaviour with `server.use`, never with the switch.

---

## T3 — Local seed data

**Goal.** Author the five session records and three coaches locally under `src/mocks/`, per D-03 and
the developer's clarification 1 (future dates for `scheduled` and `full` only).

**Satisfies.** Groundwork for AC-09, AC-10, AC-02, AC-23.

**Interfaces.**

* Consumes: `CoachSummary`, `SessionSummary` from `@/services/api/endpoints/sessions.types` (T1).
* Produces — `src/mocks/data/sessions.seed.ts`:

```ts
export const MOCK_COACHES: CoachSummary[];
export function createSeedSessions(): SessionSummary[];
```

**Deviation note (one line).** `api-integration.md` section 7.1 dates all five records in 2027;
developer clarification 1 requires `cancelled` and `completed` to sit in the past, so `ses_104` and
`ses_105` have their year shifted `2027 -> 2026` on both `startsAt` and `updatedAt`. Nothing else
changes: the two `scheduled` titles and the AC-02 probe value `2027-08-03T16:00:00Z` are untouched.

**Step 3.1 — failing test.** Create `src/mocks/data/sessions.seed.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createSeedSessions, MOCK_COACHES } from "./sessions.seed";

describe("session seed data", () => {
	it("seeds five sessions covering every status", () => {
		expect(createSeedSessions().map((session) => session.status)).toEqual([
			"scheduled",
			"full",
			"scheduled",
			"cancelled",
			"completed",
		]);
	});

	it("names the two scheduled sessions AC-10 asserts on", () => {
		const titles = createSeedSessions()
			.filter((session) => session.status === "scheduled")
			.map((session) => session.title);
		expect(titles).toEqual(["U14 Shooting Lab", "Private Footwork Review"]);
	});

	it("keeps the AC-02 probe value on the first scheduled session", () => {
		expect(createSeedSessions().at(0)?.startsAt).toBe("2027-08-03T16:00:00Z");
	});

	it("dates scheduled and full sessions in the future and closed sessions in the past", () => {
		for (const session of createSeedSessions()) {
			const isFuture = Date.parse(session.startsAt) > Date.now();
			const shouldBeFuture = session.status === "scheduled" || session.status === "full";
			expect(isFuture).toBe(shouldBeFuture);
		}
	});

	it("returns a fresh array so a caller cannot mutate the seed", () => {
		const mutable = createSeedSessions().at(0);
		expect(mutable).toBeDefined();
		if (mutable) {
			mutable.title = "mutated";
		}
		expect(createSeedSessions().at(0)?.title).toBe("U14 Shooting Lab");
	});

	it("exposes the three coaches the create handler resolves against", () => {
		expect(MOCK_COACHES.map((coach) => coach.id)).toEqual(["coach_01", "coach_02", "coach_03"]);
	});
});
```

**Step 3.2 — run red.** `npx vitest run src/mocks/data/sessions.seed.test.ts`
Expected: `Error: Failed to resolve import "./sessions.seed"`.

**Step 3.3 — implement.** Create `src/mocks/data/sessions.seed.ts`. Coaches first (named constants
avoid `noUncheckedIndexedAccess` friction), then a factory returning fresh literals:

```ts
import type { CoachSummary, SessionSummary } from "@/services/api/endpoints/sessions.types";

const MAYA: CoachSummary = { id: "coach_01", name: "Maya Brooks", email: "maya@example.test" };
const ETHAN: CoachSummary = { id: "coach_02", name: "Ethan Cole", email: "ethan@example.test" };
const LENA: CoachSummary = { id: "coach_03", name: "Lena Ortiz", email: "lena@example.test" };

export const MOCK_COACHES: CoachSummary[] = [MAYA, ETHAN, LENA];

/** A fresh copy on every call, so no test can mutate the seed for another test. */
export function createSeedSessions(): SessionSummary[] {
	return [
		{
			id: "ses_101",
			title: "U14 Shooting Lab",
			type: "training",
			status: "scheduled",
			startsAt: "2027-08-03T16:00:00Z",
			durationMinutes: 90,
			capacity: 18,
			bookedCount: 14,
			visibility: "public",
			coach: { ...MAYA },
			location: { name: "North Court", address: "18 Harbor Street" },
			updatedAt: "2027-07-26T09:15:00Z",
		},
		{
			id: "ses_102",
			title: "Varsity Defense Intensive",
			type: "camp",
			status: "full",
			startsAt: "2027-08-04T13:30:00Z",
			durationMinutes: 180,
			capacity: 24,
			bookedCount: 24,
			visibility: "public",
			coach: { ...ETHAN },
			location: { name: "Central Sports Hall", address: "240 Market Avenue" },
			updatedAt: "2027-07-27T07:40:00Z",
		},
		{
			id: "ses_103",
			title: "Private Footwork Review",
			type: "private",
			status: "scheduled",
			startsAt: "2027-08-05T17:00:00Z",
			durationMinutes: 60,
			capacity: 1,
			bookedCount: 0,
			visibility: "invite-only",
			coach: { ...MAYA },
			location: { name: "Studio B", address: "18 Harbor Street" },
			updatedAt: "2027-07-25T15:20:00Z",
		},
		{
			id: "ses_104",
			title: "Weekend Ball Handling",
			type: "training",
			status: "cancelled",
			startsAt: "2026-08-08T09:00:00Z",
			durationMinutes: 75,
			capacity: 16,
			bookedCount: 9,
			visibility: "public",
			coach: { ...LENA },
			location: { name: "West Community Gym", address: "51 Pine Road" },
			updatedAt: "2026-07-27T11:05:00Z",
		},
		{
			id: "ses_105",
			title: "U12 Team Fundamentals",
			type: "training",
			status: "completed",
			startsAt: "2026-07-24T15:00:00Z",
			durationMinutes: 90,
			capacity: 20,
			bookedCount: 17,
			visibility: "public",
			coach: { ...ETHAN },
			location: { name: "Central Sports Hall", address: "240 Market Avenue" },
			updatedAt: "2026-07-24T17:10:00Z",
		},
	];
}
```

**Step 3.4 — run green.** `npx vitest run src/mocks/data/sessions.seed.test.ts`
Expected: `Tests 6 passed (6)`.

**Step 3.5 — commit.** `npm run lint:fix`, then
`git commit -m "feat(mocks): seed five local training sessions and three coaches"`.

**Done check.** Nothing under `src/` imports `training/frontend-accelerator-assessment/`. The
future/past assertion is a deliberate time bomb after 2027-08 — record it as a known limitation in
T15, it is the accepted consequence of D-03.

---

## T4 — In-memory mock store

**Goal.** Hold the sessions the mock serves, so a created session survives the refetch that Q-03
relies on, with deterministic ordering and a reset hook for tests.

**Satisfies.** Groundwork for AC-10, AC-21, AC-23.

**Interfaces.**

* Consumes: `createSeedSessions` (T3); `SessionStatus`, `SessionSummary` (T1).
* Produces — `src/mocks/db/sessions-db.ts`:

```ts
export type ListSessionsDbArgs = { status?: SessionStatus };
export function listSessions(args?: ListSessionsDbArgs): SessionSummary[];
export function insertSession(session: SessionSummary): SessionSummary;
export function resetSessionsDb(): void;
export function nextSessionId(): string;
```

**Step 4.1 — failing test.** Create `src/mocks/db/sessions-db.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";
import type { SessionSummary } from "@/services/api/endpoints/sessions.types";
import { createSeedSessions } from "../data/sessions.seed";
import { insertSession, listSessions, nextSessionId, resetSessionsDb } from "./sessions-db";

function makeSession(overrides: Partial<SessionSummary>): SessionSummary {
	const template = createSeedSessions().at(0);
	if (!template) {
		throw new Error("seed must not be empty");
	}
	return { ...template, ...overrides };
}

beforeEach(() => {
	resetSessionsDb();
});

describe("sessions mock store", () => {
	it("returns every seeded session sorted by start time then id", () => {
		expect(listSessions().map((session) => session.id)).toEqual([
			"ses_105",
			"ses_104",
			"ses_101",
			"ses_102",
			"ses_103",
		]);
	});

	it("filters by status", () => {
		expect(listSessions({ status: "scheduled" }).map((session) => session.id)).toEqual([
			"ses_101",
			"ses_103",
		]);
	});

	it("issues sequential ids starting at ses_900", () => {
		expect(nextSessionId()).toBe("ses_900");
		expect(nextSessionId()).toBe("ses_901");
	});

	it("keeps an inserted session visible on the next read", () => {
		insertSession(
			makeSession({
				id: nextSessionId(),
				title: "Morning Shooting Block",
				startsAt: "2027-09-01T07:00:00Z",
			}),
		);
		expect(listSessions({ status: "scheduled" }).map((session) => session.title)).toEqual([
			"U14 Shooting Lab",
			"Private Footwork Review",
			"Morning Shooting Block",
		]);
	});

	it("restores the seed and the id counter on reset", () => {
		insertSession(makeSession({ id: nextSessionId(), title: "Temporary" }));
		resetSessionsDb();
		expect(listSessions()).toHaveLength(5);
		expect(nextSessionId()).toBe("ses_900");
	});
});
```

**Step 4.2 — run red.** `npx vitest run src/mocks/db/sessions-db.test.ts`
Expected: `Error: Failed to resolve import "./sessions-db"`.

**Step 4.3 — implement.** Create `src/mocks/db/sessions-db.ts`:

```ts
import type { SessionStatus, SessionSummary } from "@/services/api/endpoints/sessions.types";
import { createSeedSessions } from "../data/sessions.seed";

const FIRST_CREATED_ID = 900;

let sessions: SessionSummary[] = createSeedSessions();
let idCounter = FIRST_CREATED_ID;

function byStartThenId(a: SessionSummary, b: SessionSummary): number {
	if (a.startsAt !== b.startsAt) {
		return a.startsAt < b.startsAt ? -1 : 1;
	}
	if (a.id === b.id) {
		return 0;
	}
	return a.id < b.id ? -1 : 1;
}

export type ListSessionsDbArgs = { status?: SessionStatus };

/** Sorted by `startsAt` ascending, then `id`, so ordering is deterministic. */
export function listSessions(args: ListSessionsDbArgs = {}): SessionSummary[] {
	const status = args.status;
	const filtered = status ? sessions.filter((session) => session.status === status) : sessions;
	return [...filtered].sort(byStartThenId);
}

export function insertSession(session: SessionSummary): SessionSummary {
	sessions.push(session);
	return session;
}

/** Restores the seed and the id counter. Call it in `beforeEach`. */
export function resetSessionsDb(): void {
	sessions = createSeedSessions();
	idCounter = FIRST_CREATED_ID;
}

export function nextSessionId(): string {
	const id = `ses_${idCounter}`;
	idCounter += 1;
	return id;
}
```

**Step 4.4 — run green.** `npx vitest run src/mocks/db/sessions-db.test.ts`
Expected: `Tests 5 passed (5)`.

**Step 4.5 — commit.** `npm run lint:fix`, then
`git commit -m "feat(mocks): add in-memory sessions store with deterministic ordering"`.

**Done check.** The insert test proves a created session lands in the `scheduled` bucket after the
two seeded ones (2027-09-01 sorts last), which is exactly what AC-21 needs from the boundary.

---

## T5 — MSW handlers for both endpoints

**Goal.** Serve `GET /api/sessions` and `POST /api/sessions` from `src/mocks/handlers.ts` following
the algorithms in `api-integration.md` section 7.4, so the app runs with no backend process.

**Satisfies.** AC-23 (handler registration, no backend, no layer imports `src/mocks`); groundwork
for AC-01..AC-06, AC-10, AC-21.

**Interfaces.**

* Consumes: `MOCK_COACHES` (T3); `listSessions`, `insertSession`, `nextSessionId` (T4);
  `currentScenario`, `shouldFailListRequest`, `LIST_ERROR_BODY`, `CREATE_ERROR_BODY` (T2);
  `SESSION_STATUSES`, `CreateSessionRequest`, `SessionDetails`, `SessionStatus`, `SessionSummary`
  (T1); `http` from `@/services/api/http` (existing, used only by the test).
* Produces — `src/mocks/handlers.ts`:

```ts
export const handlers: RequestHandler[]; // GET /api/sessions, POST /api/sessions
```

**Step 5.1 — failing test.** Create `src/mocks/handlers.test.ts`. It drives the boundary through the
existing HTTP client, which is exactly what the feature will do (FR-05):

```ts
import { beforeEach, describe, expect, it } from "vitest";
import { http as apiClient } from "@/services/api/http";
import type {
	CreateSessionRequest,
	CreateSessionResponse,
	SessionsListResponse,
} from "@/services/api/endpoints/sessions.types";
import { resetSessionsDb } from "./db/sessions-db";

const VALID_BODY: CreateSessionRequest = {
	title: "Morning Shooting Block",
	startsAt: "2027-03-14T17:30:00Z",
	type: "training",
	durationMinutes: 90,
	coachId: "coach_01",
	locationName: "North Court",
	locationAddress: "18 Harbor Street",
	capacity: 18,
	visibility: "public",
};

beforeEach(() => {
	resetSessionsDb();
});

describe("GET /api/sessions", () => {
	it("serves every seeded session with the total computed from the returned rows", async () => {
		const body = await apiClient.get<SessionsListResponse>("/sessions");
		expect(body.data).toHaveLength(5);
		expect(body.meta).toEqual({ page: 1, pageSize: 10, total: 5 });
	});

	it("filters by status and computes meta.total after filtering", async () => {
		const body = await apiClient.get<SessionsListResponse>("/sessions?status=scheduled");
		expect(body.data.map((session) => session.title)).toEqual([
			"U14 Shooting Lab",
			"Private Footwork Review",
		]);
		expect(body.meta.total).toBe(2);
	});

	it("treats an empty status as no filter", async () => {
		const body = await apiClient.get<SessionsListResponse>("/sessions?status=");
		expect(body.data).toHaveLength(5);
	});

	it("rejects an unsupported status with 400", async () => {
		await expect(apiClient.get<SessionsListResponse>("/sessions?status=archived")).rejects.toMatchObject({
			status: 400,
		});
	});
});

describe("POST /api/sessions", () => {
	it("creates a scheduled session that survives the next list read", async () => {
		const created = await apiClient.post<CreateSessionResponse>("/sessions", VALID_BODY);

		expect(created.id).toBe("ses_900");
		expect(created.status).toBe("scheduled");
		expect(created.title).toBe("Morning Shooting Block");
		expect(created.startsAt).toBe("2027-03-14T17:30:00Z");
		expect(created.bookedCount).toBe(0);
		expect(created.coach).toEqual({
			id: "coach_01",
			name: "Maya Brooks",
			email: "maya@example.test",
		});
		expect(created.location).toEqual({ name: "North Court", address: "18 Harbor Street" });
		expect(created.description).toBeNull();
		expect(created.cancellation).toBeNull();

		const list = await apiClient.get<SessionsListResponse>("/sessions?status=scheduled");
		expect(list.data.map((session) => session.title)).toContain("Morning Shooting Block");
	});

	it("rejects a body whose trimmed title is too short", async () => {
		await expect(
			apiClient.post<CreateSessionResponse>("/sessions", { ...VALID_BODY, title: "  ab  " }),
		).rejects.toMatchObject({ status: 400 });
	});

	it("rejects an unknown coach", async () => {
		await expect(
			apiClient.post<CreateSessionResponse>("/sessions", { ...VALID_BODY, coachId: "coach_99" }),
		).rejects.toMatchObject({ status: 400 });
	});
});
```

**Step 5.2 — run red.** `npx vitest run src/mocks/handlers.test.ts`
Expected: every test fails with
`Error: [MSW] Cannot bypass a request when using the "error" strategy for the "onUnhandledRequest" option`
because `handlers` is still an empty array.

**Step 5.3 — implement.** Replace the body of `src/mocks/handlers.ts`:

```ts
import { delay, http, HttpResponse, type RequestHandler } from "msw";
import {
	SESSION_STATUSES,
	type CreateSessionRequest,
	type SessionDetails,
	type SessionStatus,
	type SessionSummary,
} from "@/services/api/endpoints/sessions.types";
import { MOCK_COACHES } from "./data/sessions.seed";
import * as sessionsDb from "./db/sessions-db";
import {
	CREATE_ERROR_BODY,
	currentScenario,
	LIST_ERROR_BODY,
	shouldFailListRequest,
} from "./scenario";

const SLOW_SCENARIO_DELAY_MS = 1500;
const EMPTY_META = { page: 1, pageSize: 10, total: 0 };

function isSessionStatus(value: string): value is SessionStatus {
	return (SESSION_STATUSES as readonly string[]).includes(value);
}

/** ISO 8601 UTC with second precision. Duplicated here because mocks must not import features. */
function isoUtcSeconds(date: Date): string {
	return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function validateCreateBody(
	body: CreateSessionRequest,
	coachExists: boolean,
): Record<string, string> {
	const fieldErrors: Record<string, string> = {};
	const title = typeof body.title === "string" ? body.title.trim() : "";
	if (title.length < 3 || title.length > 80) {
		fieldErrors.title = "Title must be between 3 and 80 characters.";
	}
	if (typeof body.startsAt !== "string" || Number.isNaN(Date.parse(body.startsAt))) {
		fieldErrors.startsAt = "startsAt must be an ISO 8601 timestamp.";
	}
	if (body.type !== "training" && body.type !== "camp" && body.type !== "private") {
		fieldErrors.type = "Unsupported session type.";
	}
	if (body.visibility !== "public" && body.visibility !== "invite-only") {
		fieldErrors.visibility = "Unsupported visibility.";
	}
	if (!Number.isFinite(body.durationMinutes) || body.durationMinutes <= 0) {
		fieldErrors.durationMinutes = "durationMinutes must be greater than zero.";
	}
	if (!Number.isFinite(body.capacity) || body.capacity <= 0) {
		fieldErrors.capacity = "capacity must be greater than zero.";
	}
	if (!coachExists) {
		fieldErrors.coachId = "Unknown coach.";
	}
	return fieldErrors;
}

const listSessionsHandler = http.get("/api/sessions", async ({ request }) => {
	const scenario = currentScenario();

	if (shouldFailListRequest(scenario)) {
		return HttpResponse.json(LIST_ERROR_BODY, { status: 500 });
	}
	if (scenario === "slow") {
		await delay(SLOW_SCENARIO_DELAY_MS);
	}
	if (scenario === "empty") {
		return HttpResponse.json({ data: [], meta: EMPTY_META });
	}

	const rawStatus = new URL(request.url).searchParams.get("status") ?? "";
	if (rawStatus !== "" && !isSessionStatus(rawStatus)) {
		return HttpResponse.json(
			{ error: { code: "INVALID_FILTER", message: "Unsupported status filter." } },
			{ status: 400 },
		);
	}

	const data = sessionsDb.listSessions({ status: rawStatus === "" ? undefined : rawStatus });
	return HttpResponse.json({ data, meta: { page: 1, pageSize: 10, total: data.length } });
});

const createSessionHandler = http.post("/api/sessions", async ({ request }) => {
	if (currentScenario() === "create-error") {
		return HttpResponse.json(CREATE_ERROR_BODY, { status: 500 });
	}

	const body = (await request.json()) as CreateSessionRequest;
	const coach = MOCK_COACHES.find((candidate) => candidate.id === body.coachId);
	const fieldErrors = validateCreateBody(body, coach !== undefined);

	if (!coach || Object.keys(fieldErrors).length > 0) {
		return HttpResponse.json(
			{
				error: {
					code: "VALIDATION_FAILED",
					message: "The session could not be validated.",
					fieldErrors,
				},
			},
			{ status: 400 },
		);
	}

	const stampedAt = isoUtcSeconds(new Date());
	const summary: SessionSummary = {
		id: sessionsDb.nextSessionId(),
		title: body.title,
		type: body.type,
		status: "scheduled",
		startsAt: body.startsAt,
		durationMinutes: body.durationMinutes,
		capacity: body.capacity,
		bookedCount: 0,
		visibility: body.visibility,
		coach: { ...coach },
		location: { name: body.locationName, address: body.locationAddress },
		updatedAt: stampedAt,
	};
	sessionsDb.insertSession(summary);

	const details: SessionDetails = {
		...summary,
		description: body.description ?? null,
		trainerNotes: body.trainerNotes ?? null,
		createdAt: stampedAt,
		cancellation: null,
	};
	return HttpResponse.json(details, { status: 201 });
});

/**
 * Feature request handlers are registered here.
 * Keep every mock behind this boundary so the HTTP client stays replaceable.
 */
export const handlers: RequestHandler[] = [listSessionsHandler, createSessionHandler];
```

**Step 5.4 — run green.** `npx vitest run src/mocks/handlers.test.ts`
Expected: `Tests 7 passed (7)`.

**Step 5.5 — full suite.** `npm run test`
Expected: `Test Files 6 passed (6)` — the five files added by T1-T5 plus the untouched
`src/app/App.smoke.test.tsx`, which still enters `/` and renders `null` at the index route.

**Step 5.6 — commit.** `npm run lint:fix`, then
`git commit -m "feat(mocks): serve GET and POST /api/sessions from the MSW boundary"`.

**Done check.** `rg -n "src/mocks|@/mocks" src/app src/features src/services src/shared` returns no
matches. The app has no backend process and both endpoints answer.

---

## T6 — Typed endpoint wrappers and the test MSW re-export

**Goal.** Give the feature the only two functions allowed to build a sessions URL, and the single
test-side module through which colocated tests reach the mock boundary.

**Satisfies.** AC-01 (request goes through `http.ts`), AC-27 (wrappers live in
`src/services/api/endpoints/*`); resolves FR-06.

**Flow trace.** `useSessionsQuery(undefined)` calls `listSessions({ status: undefined }, { signal })`
-> `http.get("/sessions")` -> `fetch("/api/sessions")` -> MSW `listSessionsHandler` -> a
`SessionsListResponse`. With the filter active the wrapper builds `/sessions?status=scheduled`
instead; `query` is never sent (Q-02).

**Interfaces.**

* Consumes: `http` from `@/services/api/http` (existing); the T1 types.
* Produces — `src/services/api/endpoints/sessions.ts`:

```ts
export function listSessions(
	params?: ListSessionsParams,
	options?: { signal?: AbortSignal },
): Promise<SessionsListResponse>;

export function createSession(
	body: CreateSessionRequest,
	options?: { signal?: AbortSignal },
): Promise<CreateSessionResponse>;
```

* Produces — `src/test/msw.ts`:

```ts
export { server } from "@/mocks/server";
export { CREATE_ERROR_BODY, LIST_ERROR_BODY } from "@/mocks/scenario";
export { resetSessionsDb } from "@/mocks/db/sessions-db";
```

**Step 6.1 — failing test.** Create `src/services/api/endpoints/sessions.test.ts`:

```ts
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { resetSessionsDb, server } from "@/test/msw";
import { createSession, listSessions } from "./sessions";
import type { CreateSessionRequest } from "./sessions.types";

const VALID_BODY: CreateSessionRequest = {
	title: "Morning Shooting Block",
	startsAt: "2027-03-14T17:30:00Z",
	type: "training",
	durationMinutes: 90,
	coachId: "coach_01",
	locationName: "North Court",
	locationAddress: "18 Harbor Street",
	capacity: 18,
	visibility: "public",
};

beforeEach(() => {
	resetSessionsDb();
});

describe("listSessions", () => {
	it("omits the query string entirely when no status is given", async () => {
		let requestedUrl = "";
		server.use(
			http.get("/api/sessions", ({ request }) => {
				requestedUrl = request.url;
				return HttpResponse.json({ data: [], meta: { page: 1, pageSize: 10, total: 0 } });
			}),
		);

		await listSessions();

		expect(new URL(requestedUrl).search).toBe("");
	});

	it("sends only status=scheduled when the filter is active", async () => {
		let requestedUrl = "";
		server.use(
			http.get("/api/sessions", ({ request }) => {
				requestedUrl = request.url;
				return HttpResponse.json({ data: [], meta: { page: 1, pageSize: 10, total: 0 } });
			}),
		);

		await listSessions({ status: "scheduled" });

		expect(new URL(requestedUrl).search).toBe("?status=scheduled");
	});

	it("returns the parsed list body from the default handler", async () => {
		const response = await listSessions({ status: "scheduled" });
		expect(response.data.map((session) => session.title)).toEqual([
			"U14 Shooting Lab",
			"Private Footwork Review",
		]);
	});
});

describe("createSession", () => {
	it("posts the full contract body and returns the created session", async () => {
		let sentBody: CreateSessionRequest | undefined;
		server.use(
			http.post("/api/sessions", async ({ request }) => {
				sentBody = (await request.json()) as CreateSessionRequest;
				return HttpResponse.json({ error: { code: "X", message: "x" } }, { status: 500 });
			}),
		);

		await expect(createSession(VALID_BODY)).rejects.toMatchObject({ status: 500 });
		expect(sentBody).toEqual(VALID_BODY);
	});

	it("resolves with the 201 body from the default handler", async () => {
		const created = await createSession(VALID_BODY);
		expect(created.title).toBe("Morning Shooting Block");
		expect(created.status).toBe("scheduled");
	});
});
```

**Step 6.2 — run red.** `npx vitest run src/services/api/endpoints/sessions.test.ts`
Expected: `Error: Failed to resolve import "@/test/msw"`.

**Step 6.3 — implement the test re-export.** Create `src/test/msw.ts` with the three re-export lines
above and a header comment: `/** Single entry point through which colocated tests reach the mock
boundary, so no file under the four layers names @/mocks. */`

**Step 6.4 — implement the wrappers.** Create `src/services/api/endpoints/sessions.ts` exactly as
`api-integration.md` section 4 specifies, then delete `src/services/api/endpoints/.gitkeep`:

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
	if (params.status) {
		search.set("status", params.status);
	}
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

**Step 6.5 — run green.** `npx vitest run src/services/api/endpoints/sessions.test.ts`
Expected: `Tests 5 passed (5)`.

**Step 6.6 — commit.** `npm run lint:fix`, then
`git commit -m "feat(services): add typed sessions endpoint wrappers"`.

**Done check.** `rg -n "fetch\(" src/services/api/endpoints` returns nothing; only `http.ts` calls
`fetch`. The wrappers do not catch, retry, translate, or fill defaults.

---

## T7 — The `sessions` i18n namespace (independent of T1-T6)

**Goal.** Author the complete `sessions` namespace in both locales and register it, so no later task
has to touch i18n again (FR-07).

**Satisfies.** AC-24; prerequisite of AC-03, AC-04, AC-06, AC-07, AC-08, AC-13, AC-15, AC-17, AC-20.

**Interfaces.**

* Consumes: nothing.
* Produces — `src/shared/i18n/locales/en/sessions.json`,
  `src/shared/i18n/locales/ru/sessions.json`, and an updated `resources` map plus `ns` array in
  `src/shared/i18n/index.ts`. Key surface consumed by later tasks:

```text
list.heading            list.ariaLabel        list.loading        list.empty
list.error.message      list.error.retry
filter.label            filter.all            filter.scheduled
status.scheduled        status.full           status.cancelled    status.completed
form.open               form.heading          form.title.label    form.startsAt.label
form.submit             form.pending
form.validation.titleLength   form.validation.startsAtRequired   form.validation.startsAtFuture
```

**Step 7.1 — failing test.** Create `src/shared/i18n/sessions-namespace.test.ts`:

```ts
import { afterAll, describe, expect, it } from "vitest";
import i18n from "./index";
import enSessions from "./locales/en/sessions.json";
import ruSessions from "./locales/ru/sessions.json";

function collectKeys(value: unknown, prefix = ""): string[] {
	if (typeof value !== "object" || value === null) {
		return [prefix];
	}
	return Object.entries(value).flatMap(([key, child]) =>
		collectKeys(child, prefix ? `${prefix}.${key}` : key),
	);
}

afterAll(async () => {
	await i18n.changeLanguage("en");
});

describe("sessions i18n namespace", () => {
	it("defines exactly the same keys in en and ru", () => {
		expect(collectKeys(ruSessions).sort()).toEqual(collectKeys(enSessions).sort());
	});

	it("defines every key the feature renders", () => {
		expect(collectKeys(enSessions).sort()).toEqual(
			[
				"filter.all",
				"filter.label",
				"filter.scheduled",
				"form.heading",
				"form.open",
				"form.pending",
				"form.startsAt.label",
				"form.submit",
				"form.title.label",
				"form.validation.startsAtFuture",
				"form.validation.startsAtRequired",
				"form.validation.titleLength",
				"list.ariaLabel",
				"list.empty",
				"list.error.message",
				"list.error.retry",
				"list.heading",
				"list.loading",
				"status.cancelled",
				"status.completed",
				"status.full",
				"status.scheduled",
			].sort(),
		);
	});

	it("resolves the namespace in english", () => {
		expect(i18n.t("sessions:list.error.message")).toBe("Training sessions could not be loaded.");
		expect(i18n.t("sessions:filter.all")).toBe("All");
	});

	it("resolves the namespace in russian without missing-key fallbacks", async () => {
		await i18n.changeLanguage("ru");

		expect(i18n.t("sessions:list.heading")).toBe("Тренировки");
		expect(i18n.t("sessions:filter.all")).toBe("Все");
		expect(i18n.t("sessions:form.title.label")).toBe("Название");
		expect(i18n.t("sessions:form.validation.titleLength")).toBe(
			"Введите название длиной от 3 до 80 символов.",
		);
		expect(i18n.t("sessions:list.error.message")).toBe("Не удалось загрузить тренировки.");
	});
});
```

**Step 7.2 — run red.** `npx vitest run src/shared/i18n/sessions-namespace.test.ts`
Expected: `Error: Failed to resolve import "./locales/en/sessions.json"`.

**Step 7.3 — implement english copy.** Create `src/shared/i18n/locales/en/sessions.json` (2-space
indent per Biome):

```json
{
  "list": {
    "heading": "Training sessions",
    "ariaLabel": "Training sessions",
    "loading": "Loading sessions…",
    "empty": "No training sessions yet.",
    "error": {
      "message": "Training sessions could not be loaded.",
      "retry": "Try again"
    }
  },
  "filter": {
    "label": "Status",
    "all": "All",
    "scheduled": "Scheduled"
  },
  "status": {
    "scheduled": "Scheduled",
    "full": "Full",
    "cancelled": "Cancelled",
    "completed": "Completed"
  },
  "form": {
    "open": "New session",
    "heading": "Create a session",
    "title": { "label": "Title" },
    "startsAt": { "label": "Start date and time" },
    "submit": "Create session",
    "pending": "Creating…",
    "validation": {
      "titleLength": "Enter a title between 3 and 80 characters.",
      "startsAtRequired": "Enter a start date and time.",
      "startsAtFuture": "The start date and time must be in the future."
    }
  }
}
```

**Step 7.4 — implement russian copy.** Create `src/shared/i18n/locales/ru/sessions.json`:

```json
{
  "list": {
    "heading": "Тренировки",
    "ariaLabel": "Список тренировок",
    "loading": "Загрузка тренировок…",
    "empty": "Тренировок пока нет.",
    "error": {
      "message": "Не удалось загрузить тренировки.",
      "retry": "Повторить"
    }
  },
  "filter": {
    "label": "Статус",
    "all": "Все",
    "scheduled": "Запланированные"
  },
  "status": {
    "scheduled": "Запланирована",
    "full": "Мест нет",
    "cancelled": "Отменена",
    "completed": "Завершена"
  },
  "form": {
    "open": "Новая тренировка",
    "heading": "Создание тренировки",
    "title": { "label": "Название" },
    "startsAt": { "label": "Дата и время начала" },
    "submit": "Создать тренировку",
    "pending": "Создание…",
    "validation": {
      "titleLength": "Введите название длиной от 3 до 80 символов.",
      "startsAtRequired": "Укажите дату и время начала.",
      "startsAtFuture": "Дата и время начала должны быть в будущем."
    }
  }
}
```

**Step 7.5 — register the namespace.** Edit `src/shared/i18n/index.ts`: add the two JSON imports,
extend `resources` to `en: { common: enCommon, sessions: enSessions }` and
`ru: { common: ruCommon, sessions: ruSessions }`, and change `ns: [defaultNS]` to
`ns: [defaultNS, "sessions"]`. `defaultNS` stays `"common"`; nothing else in the file changes.

**Step 7.6 — run green.** `npx vitest run src/shared/i18n/sessions-namespace.test.ts`
Expected: `Tests 4 passed (4)`.

**Step 7.7 — commit.** `npm run lint:fix`, then
`git commit -m "feat(i18n): add the sessions namespace in en and ru"`.

**Done check.** `npm run test` still green; `i18n.changeLanguage` is restored to `en` by `afterAll`,
so no other test file inherits the russian language.

---

## T8 — Date and time helpers (independent of T1-T7)

**Goal.** Implement the Q-01 conversion, the minute-bucket future rule, and the display formatter
with an injectable timezone, so AC-02 and AC-17 are provable without pinning `TZ`.

**Satisfies.** AC-02 (unit half), AC-17 (rule half).

**Interfaces.**

* Consumes: nothing.
* Produces — `src/features/sessions/model/date-time.ts`:

```ts
export function parseLocalDateTime(value: string): Date | null;
export function toIsoUtcSeconds(date: Date): string;
export function isFutureLocalDateTime(value: string, now?: Date): boolean;
export function formatSessionStart(
	isoUtc: string,
	options?: { locale?: string; timeZone?: string },
): string;
```

**Step 8.1 — failing test.** Create `src/features/sessions/model/date-time.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	formatSessionStart,
	isFutureLocalDateTime,
	parseLocalDateTime,
	toIsoUtcSeconds,
} from "./date-time";

afterEach(() => {
	vi.useRealTimers();
});

describe("parseLocalDateTime", () => {
	it("reads a datetime-local value as local wall-clock time", () => {
		const parsed = parseLocalDateTime("2027-03-14T18:30");
		expect(parsed?.getFullYear()).toBe(2027);
		expect(parsed?.getMonth()).toBe(2);
		expect(parsed?.getDate()).toBe(14);
		expect(parsed?.getHours()).toBe(18);
		expect(parsed?.getMinutes()).toBe(30);
		expect(parsed?.getSeconds()).toBe(0);
	});

	it("returns null for an empty or malformed value", () => {
		expect(parseLocalDateTime("")).toBeNull();
		expect(parseLocalDateTime("14/03/2027 18:30")).toBeNull();
	});
});

describe("toIsoUtcSeconds", () => {
	it("emits ISO 8601 UTC with second precision", () => {
		expect(toIsoUtcSeconds(new Date("2027-03-14T17:30:00.123Z"))).toBe("2027-03-14T17:30:00Z");
	});
});

describe("isFutureLocalDateTime", () => {
	it("rejects an empty value", () => {
		expect(isFutureLocalDateTime("", new Date("2027-03-14T12:00:00"))).toBe(false);
	});

	it("rejects a past value", () => {
		expect(isFutureLocalDateTime("2020-01-01T09:00", new Date())).toBe(false);
	});

	it("rejects the current minute and accepts the next one", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2027, 2, 14, 18, 30, 42));

		expect(isFutureLocalDateTime("2027-03-14T18:30")).toBe(false);
		expect(isFutureLocalDateTime("2027-03-14T18:31")).toBe(true);
	});
});

describe("formatSessionStart", () => {
	it("converts an ISO UTC value into the requested timezone rather than printing it verbatim", () => {
		const formatted = formatSessionStart("2027-08-03T16:00:00Z", {
			locale: "en-GB",
			timeZone: "Europe/Berlin",
		});

		expect(formatted).toContain("18:00");
		expect(formatted).not.toContain("16:00");
	});
});
```

**Step 8.2 — run red.** `npx vitest run src/features/sessions/model/date-time.test.ts`
Expected: `Error: Failed to resolve import "./date-time"`.

**Step 8.3 — implement.** Create `src/features/sessions/model/date-time.ts` exactly as written in
`api-integration.md` section 2.1:

```ts
const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const MS_PER_MINUTE = 60_000;

/** Parses a `datetime-local` value as local wall-clock time. Returns null when malformed. */
export function parseLocalDateTime(value: string): Date | null {
	const match = LOCAL_DATE_TIME.exec(value.trim());
	if (!match) {
		return null;
	}
	const [, year, month, day, hour, minute] = match;
	if (!year || !month || !day || !hour || !minute) {
		return null;
	}
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

function startOfMinute(date: Date): number {
	return Math.floor(date.getTime() / MS_PER_MINUTE) * MS_PER_MINUTE;
}

/** True only when `value` is at least the next full minute after `now`. */
export function isFutureLocalDateTime(value: string, now: Date = new Date()): boolean {
	const parsed = parseLocalDateTime(value);
	if (!parsed) {
		return false;
	}
	return startOfMinute(parsed) > startOfMinute(now);
}

/** Renders an ISO UTC instant in the given timezone; omit `timeZone` for the user's own zone. */
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

**Step 8.4 — run green.** `npx vitest run src/features/sessions/model/date-time.test.ts`
Expected: `Tests 8 passed (8)`.

**Step 8.5 — commit.** `npm run lint:fix`, then
`git commit -m "feat(sessions): add local date-time parsing, future rule, and display formatter"`.

**Done check.** The only test using fake timers is synchronous and restores real timers in
`afterEach`, so no async work ever runs under a frozen clock (`api-integration.md` section 2.1).

---

## T9 — Create-session form model

**Goal.** Own the D-02 defaults, the trimmed-title and future-start validation, and the assembly of
the contract-shaped POST body.

**Satisfies.** AC-14 (field set), AC-15, AC-16, AC-17; prerequisite of AC-18, AC-19.

**Flow trace.** `CreateSessionForm` holds `{ title, startsAtLocal }`, calls
`validateCreateSessionForm(values)` during render for the inline messages and again with a fresh
`new Date()` as the first statement of submit; when it returns `{}` the mutation calls
`buildCreateSessionRequest(values)`, which trims the title and converts the local wall clock to
`startsAt` in ISO 8601 UTC before `createSession` sends it.

**Interfaces.**

* Consumes: `CreateSessionRequest` (T1); `isFutureLocalDateTime`, `parseLocalDateTime`,
  `toIsoUtcSeconds` (T8).
* Produces — `src/features/sessions/model/create-session.ts`:

```ts
export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 80;
export const CREATE_SESSION_DEFAULTS: Omit<CreateSessionRequest, "title" | "startsAt">;
export type CreateSessionFormValues = { title: string; startsAtLocal: string };
export type CreateSessionFieldError = "titleLength" | "startsAtRequired" | "startsAtFuture";
export type CreateSessionFormErrors = {
	title?: CreateSessionFieldError;
	startsAt?: CreateSessionFieldError;
};
export function validateCreateSessionForm(
	values: CreateSessionFormValues,
	now?: Date,
): CreateSessionFormErrors;
export function hasFormErrors(errors: CreateSessionFormErrors): boolean;
export function buildCreateSessionRequest(values: CreateSessionFormValues): CreateSessionRequest;
```

The error values are i18n key *suffixes*, not sentences: the UI renders
`t(\`form.validation.${error}\`)`. That keeps the model free of copy and keeps AC-24 checkable in one
place.

**Step 9.1 — failing test.** Create `src/features/sessions/model/create-session.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
	buildCreateSessionRequest,
	CREATE_SESSION_DEFAULTS,
	hasFormErrors,
	validateCreateSessionForm,
} from "./create-session";

const FUTURE = "2027-03-14T18:30";
const NOW = new Date(2027, 0, 1, 12, 0, 0);

describe("validateCreateSessionForm", () => {
	it("accepts a trimmed title of exactly 3 and exactly 80 characters", () => {
		expect(validateCreateSessionForm({ title: "abc", startsAtLocal: FUTURE }, NOW)).toEqual({});
		expect(
			validateCreateSessionForm({ title: "  abc  ", startsAtLocal: FUTURE }, NOW),
		).toEqual({});
		expect(
			validateCreateSessionForm({ title: "a".repeat(80), startsAtLocal: FUTURE }, NOW),
		).toEqual({});
	});

	it("rejects a title whose trimmed length is outside 3..80", () => {
		for (const title of ["", "ab", "  ab  ", "a".repeat(81)]) {
			expect(validateCreateSessionForm({ title, startsAtLocal: FUTURE }, NOW).title).toBe(
				"titleLength",
			);
		}
	});

	it("distinguishes a missing start from a non-future start", () => {
		expect(validateCreateSessionForm({ title: "abc", startsAtLocal: "" }, NOW).startsAt).toBe(
			"startsAtRequired",
		);
		expect(
			validateCreateSessionForm({ title: "abc", startsAtLocal: "2020-01-01T09:00" }, NOW)
				.startsAt,
		).toBe("startsAtFuture");
	});

	it("reports both fields at once", () => {
		const errors = validateCreateSessionForm({ title: "ab", startsAtLocal: "" }, NOW);
		expect(errors).toEqual({ title: "titleLength", startsAt: "startsAtRequired" });
		expect(hasFormErrors(errors)).toBe(true);
		expect(hasFormErrors({})).toBe(false);
	});
});

describe("buildCreateSessionRequest", () => {
	it("trims the title, converts the local start to ISO UTC, and adds the fixed defaults", () => {
		const body = buildCreateSessionRequest({
			title: "  Morning Shooting Block  ",
			startsAtLocal: FUTURE,
		});

		expect(body.title).toBe("Morning Shooting Block");
		expect(body.startsAt).toBe(
			new Date(2027, 2, 14, 18, 30, 0, 0).toISOString().replace(/\.\d{3}Z$/, "Z"),
		);
		expect(body).toMatchObject(CREATE_SESSION_DEFAULTS);
		expect(body.description).toBeUndefined();
		expect(body.trainerNotes).toBeUndefined();
	});

	it("refuses to build a request from an unvalidated start value", () => {
		expect(() => buildCreateSessionRequest({ title: "abc", startsAtLocal: "" })).toThrow();
	});
});

describe("CREATE_SESSION_DEFAULTS", () => {
	it("carries the seven values D-02 fixes outside the form", () => {
		expect(CREATE_SESSION_DEFAULTS).toEqual({
			type: "training",
			durationMinutes: 90,
			coachId: "coach_01",
			locationName: "North Court",
			locationAddress: "18 Harbor Street",
			capacity: 18,
			visibility: "public",
		});
	});
});
```

**Step 9.2 — run red.** `npx vitest run src/features/sessions/model/create-session.test.ts`
Expected: `Error: Failed to resolve import "./create-session"`.

**Step 9.3 — implement.** Create `src/features/sessions/model/create-session.ts`:

```ts
import type { CreateSessionRequest } from "@/services/api/endpoints/sessions.types";
import { isFutureLocalDateTime, parseLocalDateTime, toIsoUtcSeconds } from "./date-time";

export const TITLE_MIN_LENGTH = 3;
export const TITLE_MAX_LENGTH = 80;

/** D-02: the seven contract fields the onboarding form does not collect. */
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

export type CreateSessionFieldError = "titleLength" | "startsAtRequired" | "startsAtFuture";

export type CreateSessionFormErrors = {
	title?: CreateSessionFieldError;
	startsAt?: CreateSessionFieldError;
};

export function validateCreateSessionForm(
	values: CreateSessionFormValues,
	now: Date = new Date(),
): CreateSessionFormErrors {
	const errors: CreateSessionFormErrors = {};
	const title = values.title.trim();

	if (title.length < TITLE_MIN_LENGTH || title.length > TITLE_MAX_LENGTH) {
		errors.title = "titleLength";
	}

	if (values.startsAtLocal.trim() === "") {
		errors.startsAt = "startsAtRequired";
	} else if (!isFutureLocalDateTime(values.startsAtLocal, now)) {
		errors.startsAt = "startsAtFuture";
	}

	return errors;
}

export function hasFormErrors(errors: CreateSessionFormErrors): boolean {
	return errors.title !== undefined || errors.startsAt !== undefined;
}

/** Trims the title (AC-16) and converts the local wall clock to ISO 8601 UTC (A-04). */
export function buildCreateSessionRequest(values: CreateSessionFormValues): CreateSessionRequest {
	const startsAt = parseLocalDateTime(values.startsAtLocal);
	if (!startsAt) {
		throw new Error("startsAtLocal must be validated before building the request");
	}
	return {
		...CREATE_SESSION_DEFAULTS,
		title: values.title.trim(),
		startsAt: toIsoUtcSeconds(startsAt),
	};
}
```

**Step 9.4 — run green.** `npx vitest run src/features/sessions/model/create-session.test.ts`
Expected: `Tests 7 passed (7)`.

**Step 9.5 — commit.** `npm run lint:fix`, then
`git commit -m "feat(sessions): add create-session validation, defaults, and request builder"`.

**Done check.** `description` and `trainerNotes` are absent from the body rather than sent as
`null`, per `api-integration.md` section 5.2.

---

## T10 — Sessions list query hook

**Goal.** Expose the list through TanStack Query with the key factory and the `retry: false` option
AC-04/AC-05 depend on.

**Satisfies.** AC-01 (one mounted query), AC-06 (empty derived from `data.data.length`); enables
AC-03, AC-04, AC-05, AC-10.

**Flow trace.** `SessionsListSection` calls `useSessionsQuery(status)`; the key
`["sessions", "list", { status }]` changes when the filter changes, which mounts a new fetch and
aborts the in-flight one through the query `signal`.

**Interfaces.**

* Consumes: `listSessions` (T6); `ListSessionsParams`, `SessionStatus`, `SessionsListResponse` (T1).
* Produces — `src/features/sessions/model/sessions-query.ts`:

```ts
export const sessionKeys: {
	all: readonly ["sessions"];
	lists: () => readonly ["sessions", "list"];
	list: (params: ListSessionsParams) => readonly ["sessions", "list", ListSessionsParams];
};
export function useSessionsQuery(
	status: SessionStatus | undefined,
): UseQueryResult<SessionsListResponse, Error>;
```

**Step 10.1 — failing test.** Create `src/features/sessions/model/sessions-query.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { LIST_ERROR_BODY, resetSessionsDb, server } from "@/test/msw";
import { sessionKeys, useSessionsQuery } from "./sessions-query";

function createWrapper(retry: number | false = false) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry } } });
	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

beforeEach(() => {
	resetSessionsDb();
});

describe("sessionKeys", () => {
	it("nests every list key under one invalidatable prefix", () => {
		expect(sessionKeys.lists()).toEqual(["sessions", "list"]);
		expect(sessionKeys.list({ status: "scheduled" })).toEqual([
			"sessions",
			"list",
			{ status: "scheduled" },
		]);
	});
});

describe("useSessionsQuery", () => {
	it("loads every session when no status is selected", async () => {
		const { result } = renderHook(() => useSessionsQuery(undefined), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.data).toHaveLength(5);
	});

	it("loads only scheduled sessions when the filter is active", async () => {
		const { result } = renderHook(() => useSessionsQuery("scheduled"), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.data.map((session) => session.title)).toEqual([
			"U14 Shooting Lab",
			"Private Footwork Review",
		]);
	});

	it("surfaces the first failure without retrying, even under a retrying client", async () => {
		server.use(
			http.get("/api/sessions", () => HttpResponse.json(LIST_ERROR_BODY, { status: 500 }), {
				once: true,
			}),
		);

		const { result } = renderHook(() => useSessionsQuery(undefined), {
			wrapper: createWrapper(3),
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});
```

The third test is the real assertion of `retry: false`: the override is `{ once: true }`, so a retry
would fall through to the default handler and succeed, and `isError` would never become `true`.

**Step 10.2 — run red.** `npx vitest run src/features/sessions/model/sessions-query.test.tsx`
Expected: `Error: Failed to resolve import "./sessions-query"`.

**Step 10.3 — implement.** Create `src/features/sessions/model/sessions-query.ts`:

```ts
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { listSessions } from "@/services/api/endpoints/sessions";
import type {
	ListSessionsParams,
	SessionsListResponse,
	SessionStatus,
} from "@/services/api/endpoints/sessions.types";

export const sessionKeys = {
	all: ["sessions"] as const,
	lists: () => [...sessionKeys.all, "list"] as const,
	list: (params: ListSessionsParams) => [...sessionKeys.lists(), params] as const,
};

export function useSessionsQuery(
	status: SessionStatus | undefined,
): UseQueryResult<SessionsListResponse, Error> {
	return useQuery({
		queryKey: sessionKeys.list({ status }),
		queryFn: ({ signal }) => listSessions({ status }, { signal }),
		// AC-04/AC-05 must be reachable on the first failure; the global default is retry: 1.
		retry: false,
	});
}
```

**Step 10.4 — run green.** `npx vitest run src/features/sessions/model/sessions-query.test.tsx`
Expected: `Tests 4 passed (4)`.

**Step 10.5 — commit.** `npm run lint:fix`, then
`git commit -m "feat(sessions): add the sessions list query hook and key factory"`.

**Done check.** No `staleTime`, no `placeholderData`, no `select`. `meta` is passed through and left
unused — pagination is a non-goal.

---

## T11 — Create-session mutation hook

**Goal.** Assemble the body once, invalidate the list on success, and own the pending flag that
prevents duplicate submission.

**Satisfies.** AC-16 (trimmed title reaches the server), AC-21 (created session survives the
refetch), the D-06 guardrail (pending ends on settle).

**Flow trace.** `CreateSessionForm` calls `mutation.mutate(values, { onSuccess })`; the hook's
`mutationFn` runs `createSession(buildCreateSessionRequest(values))`; on `201` the hook fires
`queryClient.invalidateQueries({ queryKey: sessionKeys.lists() })` without awaiting it, and the
component's own `onSuccess` closes the form (D-05). The active list query refetches and the new row
appears.

**Interfaces.**

* Consumes: `createSession` (T6); `buildCreateSessionRequest`, `CreateSessionFormValues` (T9);
  `sessionKeys` (T10); `CreateSessionResponse` (T1).
* Produces — `src/features/sessions/model/use-create-session-mutation.ts`:

```ts
export function useCreateSessionMutation(): UseMutationResult<
	CreateSessionResponse,
	Error,
	CreateSessionFormValues
>;
```

**Step 11.1 — failing test.** Create
`src/features/sessions/model/use-create-session-mutation.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listSessions } from "@/services/api/endpoints/sessions";
import type { CreateSessionResponse } from "@/services/api/endpoints/sessions.types";
import { resetSessionsDb } from "@/test/msw";
import { sessionKeys } from "./sessions-query";
import { useCreateSessionMutation } from "./use-create-session-mutation";

beforeEach(() => {
	resetSessionsDb();
});

describe("useCreateSessionMutation", () => {
	it("sends the trimmed title, creates a scheduled session, and invalidates the list", async () => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
		});
		const invalidate = vi.spyOn(queryClient, "invalidateQueries");
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useCreateSessionMutation(), { wrapper });

		let created: CreateSessionResponse | undefined;
		await act(async () => {
			created = await result.current.mutateAsync({
				title: "  Morning Shooting Block  ",
				startsAtLocal: "2027-03-14T18:30",
			});
		});

		expect(created?.title).toBe("Morning Shooting Block");
		expect(created?.status).toBe("scheduled");
		expect(invalidate).toHaveBeenCalledWith({ queryKey: sessionKeys.lists() });

		const list = await listSessions({ status: "scheduled" });
		expect(list.data.map((session) => session.title)).toContain("Morning Shooting Block");
	});

	it("leaves the pending state when a failed create settles", async () => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
		});
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useCreateSessionMutation(), { wrapper });

		await act(async () => {
			await result.current
				.mutateAsync({ title: "ab", startsAtLocal: "2027-03-14T18:30" })
				.catch(() => undefined);
		});

		expect(result.current.isPending).toBe(false);
		expect(result.current.isError).toBe(true);
	});
});
```

The second test drives a `400 VALIDATION_FAILED` from the mock boundary guard (title `"ab"`) purely
to prove the D-06 guardrail: `isPending` returns to `false` on settle, so the submit control can
never stay permanently disabled. No error message is rendered anywhere (AC-22 is dropped).

**Step 11.2 — run red.**
`npx vitest run src/features/sessions/model/use-create-session-mutation.test.tsx`
Expected: `Error: Failed to resolve import "./use-create-session-mutation"`.

**Step 11.3 — implement.** Create `src/features/sessions/model/use-create-session-mutation.ts`:

```ts
import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { createSession } from "@/services/api/endpoints/sessions";
import type { CreateSessionResponse } from "@/services/api/endpoints/sessions.types";
import { buildCreateSessionRequest, type CreateSessionFormValues } from "./create-session";
import { sessionKeys } from "./sessions-query";

export function useCreateSessionMutation(): UseMutationResult<
	CreateSessionResponse,
	Error,
	CreateSessionFormValues
> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (values: CreateSessionFormValues) =>
			createSession(buildCreateSessionRequest(values)),
		onSuccess: () => {
			// Not awaited (Q-03): the form closes at once and the row appears when the refetch lands.
			void queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
		},
	});
}
```

**Step 11.4 — run green.**
`npx vitest run src/features/sessions/model/use-create-session-mutation.test.tsx`
Expected: `Tests 2 passed (2)`.

**Step 11.5 — commit.** `npm run lint:fix`, then
`git commit -m "feat(sessions): add the create-session mutation hook"`.

**Done check.** No `onError` handler, no `setQueryData`, no retry. The `201` body is never written
into a list cache entry.

---

## T12 — Sessions list UI, workspace page, feature barrel, and the `/sessions` route

**Goal.** Render the four list states at `/sessions`, register the route through the feature barrel,
and redirect `/` to it (D-04).

**Satisfies.** AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-27; part of AC-23 and AC-25.

**Flow trace.** The user opens `/sessions`; `router.tsx` renders `<AppLayout>` with
`<SessionsWorkspacePage>` in the outlet; the page reads `status` from `useSearchParams` (absent ->
`undefined`) and passes it to `<SessionsListSection status={undefined}>`; that calls
`useSessionsQuery(undefined)` with key `["sessions", "list", { status: undefined }]`, which calls
`listSessions({ status: undefined }, { signal })` -> `http.get("/sessions")` ->
`GET /api/sessions` -> `listSessionsHandler` -> `SessionsListResponse` with five rows; the section
renders `<SessionsList sessions={data.data}>`, one `<li>` per session with an `<h3>` title, the
`sessions:status.<status>` label, and `formatSessionStart(startsAt, { locale: i18n.language })`.
Opening `/` instead runs the index loader `redirect("/sessions")` first.

**Interfaces.**

* Consumes: `useSessionsQuery` (T10); `formatSessionStart` (T8); `SessionStatus`, `SessionSummary`
  (T1); `sessions` namespace keys (T7); existing `AppLayout`, `routes`, `AppProviders`.
* Produces:

```ts
// src/features/sessions/ui/SessionsList.tsx
export function SessionsList(props: { sessions: SessionSummary[] }): JSX.Element;

// src/features/sessions/ui/SessionsListSection.tsx
export function SessionsListSection(props: { status: SessionStatus | undefined }): JSX.Element;

// src/features/sessions/ui/SessionsWorkspacePage.tsx
export function SessionsWorkspacePage(): JSX.Element;

// src/features/sessions/index.ts
export { SessionsWorkspacePage } from "./ui/SessionsWorkspacePage";

// src/test/render-app.tsx
export function renderApp(initialEntry?: string): RenderResult & { queryClient: QueryClient };
```

**Note on placement (FR-12).** `renderApp` is created here, one task earlier than the filter and
create tests that also need it, because this is the first task that renders the routed workspace.

**Step 12.1 — failing test.** Create `src/features/sessions/ui/SessionsWorkspacePage.list.test.tsx`:

```tsx
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LIST_ERROR_BODY, resetSessionsDb, server } from "@/test/msw";
import { renderApp } from "@/test/render-app";
import { formatSessionStart } from "../model/date-time";

const EMPTY_LIST = { data: [], meta: { page: 1, pageSize: 10, total: 0 } };

beforeEach(() => {
	resetSessionsDb();
});

afterEach(() => {
	server.events.removeAllListeners();
});

describe("sessions workspace list", () => {
	it("issues exactly one list request and renders one row per session", async () => {
		const requests: string[] = [];
		server.events.on("request:start", ({ request }) => {
			requests.push(`${request.method} ${new URL(request.url).pathname}`);
		});

		renderApp("/sessions");

		expect(await screen.findByRole("heading", { name: "U14 Shooting Lab" })).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(5);
		expect(requests.filter((entry) => entry === "GET /api/sessions")).toHaveLength(1);
	});

	it("shows the status as a text label and the start time in local time", async () => {
		renderApp("/sessions");

		const heading = await screen.findByRole("heading", { name: "U14 Shooting Lab" });
		const row = heading.closest("li");
		expect(row).not.toBeNull();
		if (!row) {
			return;
		}

		expect(within(row).getByText("Scheduled")).toBeInTheDocument();
		expect(
			within(row).getByText(formatSessionStart("2027-08-03T16:00:00Z", { locale: "en" })),
		).toBeInTheDocument();
	});

	it("shows the loading state and no rows while the request is pending", async () => {
		server.use(
			http.get("/api/sessions", async () => {
				await delay(80);
				return HttpResponse.json(EMPTY_LIST);
			}),
		);

		renderApp("/sessions");

		expect(screen.getByText("Loading sessions…")).toBeInTheDocument();
		expect(screen.queryAllByRole("listitem")).toHaveLength(0);
		expect(await screen.findByText("No training sessions yet.")).toBeInTheDocument();
	});

	it("shows the translated empty message and no error for an empty response", async () => {
		server.use(http.get("/api/sessions", () => HttpResponse.json(EMPTY_LIST)));

		renderApp("/sessions");

		expect(await screen.findByText("No training sessions yet.")).toBeInTheDocument();
		expect(screen.queryByRole("alert")).toBeNull();
	});

	it("shows a translated, recoverable error state and recovers on retry", async () => {
		const user = userEvent.setup();
		server.use(
			http.get("/api/sessions", () => HttpResponse.json(LIST_ERROR_BODY, { status: 500 }), {
				once: true,
			}),
		);

		renderApp("/sessions");

		expect(
			await screen.findByText("Training sessions could not be loaded."),
		).toBeInTheDocument();
		expect(screen.queryByText(/500/)).toBeNull();
		expect(screen.queryByText(/SESSIONS_UNAVAILABLE/)).toBeNull();

		await user.click(screen.getByRole("button", { name: "Try again" }));

		expect(await screen.findByRole("heading", { name: "U14 Shooting Lab" })).toBeInTheDocument();
		await waitFor(() =>
			expect(screen.queryByText("Training sessions could not be loaded.")).toBeNull(),
		);
	});

	it("honours a status already present in the page URL", async () => {
		renderApp("/sessions?status=scheduled");

		expect(await screen.findByRole("heading", { name: "U14 Shooting Lab" })).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
	});

	it("redirects the index route to the workspace", async () => {
		renderApp("/");

		expect(await screen.findByRole("heading", { name: "Training sessions" })).toBeInTheDocument();
	});
});
```

**Step 12.2 — run red.** `npx vitest run src/features/sessions/ui/SessionsWorkspacePage.list.test.tsx`
Expected: `Error: Failed to resolve import "@/test/render-app"`.

**Step 12.3 — implement the render helper.** Create `src/test/render-app.tsx`:

```tsx
import { QueryClient } from "@tanstack/react-query";
import { render, type RenderResult } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { AppProviders } from "@/app/providers";
import { routes } from "@/app/router";

/** Renders the real routed application with a non-retrying query client. Test-only. */
export function renderApp(initialEntry = "/sessions"): RenderResult & { queryClient: QueryClient } {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });

	return {
		queryClient,
		...render(
			<AppProviders queryClient={queryClient}>
				<RouterProvider router={router} />
			</AppProviders>,
		),
	};
}
```

**Step 12.4 — implement the row list.** Create `src/features/sessions/ui/SessionsList.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import type { SessionSummary } from "@/services/api/endpoints/sessions.types";
import { formatSessionStart } from "../model/date-time";

type SessionsListProps = {
	sessions: SessionSummary[];
};

export function SessionsList({ sessions }: SessionsListProps) {
	const { t, i18n } = useTranslation("sessions");

	return (
		<ul aria-label={t("list.ariaLabel")} className="flex flex-col gap-2">
			{sessions.map((session) => (
				<li
					key={session.id}
					className="rounded border border-slate-200 bg-white px-4 py-3 shadow-sm"
				>
					<h3 className="font-medium">{session.title}</h3>
					<p className="text-sm text-slate-600">{t(`status.${session.status}`)}</p>
					<p className="text-sm text-slate-600">
						<time dateTime={session.startsAt}>
							{formatSessionStart(session.startsAt, { locale: i18n.language })}
						</time>
					</p>
				</li>
			))}
		</ul>
	);
}
```

The status is a translated word, never colour alone (AC-07).

**Step 12.5 — implement the state-owning section.** Create
`src/features/sessions/ui/SessionsListSection.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import type { SessionStatus } from "@/services/api/endpoints/sessions.types";
import { useSessionsQuery } from "../model/sessions-query";
import { SessionsList } from "./SessionsList";

type SessionsListSectionProps = {
	status: SessionStatus | undefined;
};

export function SessionsListSection({ status }: SessionsListSectionProps) {
	const { t } = useTranslation("sessions");
	const query = useSessionsQuery(status);

	if (query.isPending) {
		return (
			<p role="status" className="text-sm text-slate-600">
				{t("list.loading")}
			</p>
		);
	}

	if (query.isError) {
		return (
			<div role="alert" className="flex flex-col items-start gap-2">
				<p className="text-sm text-slate-800">{t("list.error.message")}</p>
				<button
					type="button"
					onClick={() => {
						void query.refetch();
					}}
					className="rounded border border-slate-300 bg-white px-3 py-1 text-sm"
				>
					{t("list.error.retry")}
				</button>
			</div>
		);
	}

	if (query.data.data.length === 0) {
		return <p className="text-sm text-slate-600">{t("list.empty")}</p>;
	}

	return <SessionsList sessions={query.data.data} />;
}
```

**Step 12.6 — implement the page.** Create `src/features/sessions/ui/SessionsWorkspacePage.tsx`. In
this task it owns the heading and derives `status` from the URL; the filter control arrives in T13
and the form in T14:

```tsx
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import type { SessionStatus } from "@/services/api/endpoints/sessions.types";
import { SessionsListSection } from "./SessionsListSection";

export function SessionsWorkspacePage() {
	const { t } = useTranslation("sessions");
	const [searchParams] = useSearchParams();

	const status: SessionStatus | undefined =
		searchParams.get("status") === "scheduled" ? "scheduled" : undefined;

	return (
		<section className="flex flex-col gap-6">
			<header className="flex flex-wrap items-center justify-between gap-4">
				<h2 className="text-lg font-semibold">{t("list.heading")}</h2>
			</header>
			<SessionsListSection status={status} />
		</section>
	);
}
```

**Step 12.7 — implement the barrel.** Create `src/features/sessions/index.ts`:

```ts
export { SessionsWorkspacePage } from "./ui/SessionsWorkspacePage";
```

**Step 12.8 — register the route.** Edit `src/app/router.tsx`:

```tsx
import { createBrowserRouter, redirect, type RouteObject } from "react-router";
import { SessionsWorkspacePage } from "@/features/sessions";
import { AppLayout } from "./AppLayout";

export const routes: RouteObject[] = [
	{
		path: "/",
		element: <AppLayout />,
		children: [
			// Feature routes are registered here.
			{ index: true, loader: () => redirect("/sessions") },
			{ path: "sessions", element: <SessionsWorkspacePage /> },
		],
	},
];

export const router = createBrowserRouter(routes);
```

**Step 12.9 — run green.** `npx vitest run src/features/sessions/ui/SessionsWorkspacePage.list.test.tsx`
Expected: `Tests 7 passed (7)`.

**Step 12.10 — update the application smoke test.** `/` now redirects, so
`src/app/App.smoke.test.tsx` exercises the redirect. Extend its single assertion block so the
redirect is covered rather than incidentally passing, and give it a non-retrying client so a slow
mock cannot make it flaky:

```tsx
import { QueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { AppProviders } from "./providers";
import { routes } from "./router";

describe("application shell", () => {
	it("redirects the root route to the sessions workspace inside the layout", async () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const router = createMemoryRouter(routes, { initialEntries: ["/"] });

		render(
			<AppProviders queryClient={queryClient}>
				<RouterProvider router={router} />
			</AppProviders>,
		);

		expect(
			await screen.findByRole("heading", { name: "Training Sessions Workspace" }),
		).toBeInTheDocument();
		expect(await screen.findByRole("heading", { name: "Training sessions" })).toBeInTheDocument();
	});
});
```

**Step 12.11 — run the full suite.** `npm run test`
Expected: `Test Files 13 passed (13)`.

**Step 12.12 — commit.** `npm run lint:fix`, then
`git commit -m "feat(sessions): render the sessions list at /sessions and redirect the index route"`.

**Done check.** `src/features/sessions/` has `index.ts`, `ui/`, `model/`; the router imports only
the barrel; `rg -n "@/mocks" src/app src/features src/services src/shared` is empty;
`rg -n "fetch\(" src/features` is empty.

---

## T13 — Status filter

**Goal.** Add the `All` + `scheduled` control and wire it to the URL-owned status.

**Satisfies.** AC-08, AC-09, AC-10, AC-11; contributes to AC-25.

**Flow trace.** The user selects `Scheduled` in the `<select>` labelled `Status` on `/sessions`;
`StatusFilter`'s `onChange` calls `onStatusChange("scheduled")`; `SessionsWorkspacePage` calls
`setSearchParams` with the functional updater, producing `/sessions?status=scheduled`; the page
re-renders with `status = "scheduled"`; `useSessionsQuery("scheduled")` mounts key
`["sessions", "list", { status: "scheduled" }]`, aborts the in-flight request via its `signal`, and
issues `GET /api/sessions?status=scheduled`; the handler filters the store and returns
`{ data: [ses_101, ses_103], meta: { page: 1, pageSize: 10, total: 2 } }`; `SessionsList` re-renders
with two rows. Selecting `All` deletes the parameter and restores the five-row key.

**Interfaces.**

* Consumes: `SessionStatus` (T1); `sessions:filter.*` keys (T7); `SessionsWorkspacePage` (T12).
* Produces — `src/features/sessions/ui/StatusFilter.tsx`:

```ts
export const FILTER_STATUS: SessionStatus; // "scheduled" (D-01)
export function StatusFilter(props: {
	value: SessionStatus | undefined;
	onChange: (value: SessionStatus | undefined) => void;
}): JSX.Element;
```

* Modifies — `SessionsWorkspacePage` gains
  `function handleStatusChange(next: SessionStatus | undefined): void` and renders `<StatusFilter>`.

**Step 13.1 — failing test.** Create
`src/features/sessions/ui/SessionsWorkspacePage.filter.test.tsx`:

```tsx
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { resetSessionsDb } from "@/test/msw";
import { renderApp } from "@/test/render-app";

beforeEach(() => {
	resetSessionsDb();
});

describe("sessions status filter", () => {
	it("offers exactly All and Scheduled, with All selected initially", async () => {
		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });

		const select = screen.getByLabelText("Status");
		expect(select).toHaveValue("all");
		expect(
			within(select).getAllByRole("option").map((option) => option.textContent),
		).toEqual(["All", "Scheduled"]);
		expect(screen.getAllByRole("listitem")).toHaveLength(5);
	});

	it("shows only scheduled sessions for the status filter and restores the full list for All", async () => {
		const user = userEvent.setup();
		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });

		await user.selectOptions(screen.getByLabelText("Status"), "scheduled");

		expect(
			await screen.findByRole("heading", { name: "Private Footwork Review" }),
		).toBeInTheDocument();
		await waitFor(() =>
			expect(screen.queryByRole("heading", { name: "Varsity Defense Intensive" })).toBeNull(),
		);
		expect(screen.queryByRole("heading", { name: "Weekend Ball Handling" })).toBeNull();
		expect(screen.queryByRole("heading", { name: "U12 Team Fundamentals" })).toBeNull();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);

		await user.selectOptions(screen.getByLabelText("Status"), "all");

		expect(
			await screen.findByRole("heading", { name: "Varsity Defense Intensive" }),
		).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(5);
	});

	it("keeps unrelated page-URL parameters when the filter changes", async () => {
		const user = userEvent.setup();
		renderApp("/sessions?mock=normal");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });

		await user.selectOptions(screen.getByLabelText("Status"), "scheduled");

		expect(
			await screen.findByRole("heading", { name: "Private Footwork Review" }),
		).toBeInTheDocument();
		expect(window.location.search).toBe("");
		expect(screen.getByLabelText("Status")).toHaveValue("scheduled");
	});
});
```

The third test guards FR-13. A memory router does not touch `window.location`, so the assertion that
the browser URL is untouched documents why `renderApp` cannot see the `?mock=` switch; the behaviour
it really pins is that selecting a status still resolves after starting from a URL that already
carried another parameter, which only holds when `handleStatusChange` copies the previous params.

**Step 13.2 — run red.** `npx vitest run src/features/sessions/ui/SessionsWorkspacePage.filter.test.tsx`
Expected: `TestingLibraryElementError: Unable to find a label with the text of: Status`.

**Step 13.3 — implement the control.** Create `src/features/sessions/ui/StatusFilter.tsx`:

```tsx
import { useTranslation } from "react-i18next";
import type { SessionStatus } from "@/services/api/endpoints/sessions.types";

/** D-01: the workspace offers `All` plus this single status. */
export const FILTER_STATUS: SessionStatus = "scheduled";

const ALL_VALUE = "all";

type StatusFilterProps = {
	value: SessionStatus | undefined;
	onChange: (value: SessionStatus | undefined) => void;
};

export function StatusFilter({ value, onChange }: StatusFilterProps) {
	const { t } = useTranslation("sessions");

	return (
		<label className="flex items-center gap-2 text-sm">
			<span className="font-medium">{t("filter.label")}</span>
			<select
				className="rounded border border-slate-300 bg-white px-2 py-1"
				value={value ?? ALL_VALUE}
				onChange={(event) => {
					onChange(event.target.value === FILTER_STATUS ? FILTER_STATUS : undefined);
				}}
			>
				<option value={ALL_VALUE}>{t("filter.all")}</option>
				<option value={FILTER_STATUS}>{t("filter.scheduled")}</option>
			</select>
		</label>
	);
}
```

**Step 13.4 — wire it into the page.** Edit `src/features/sessions/ui/SessionsWorkspacePage.tsx`:
import `FILTER_STATUS` and `StatusFilter`, replace the literal `"scheduled"` comparison with
`FILTER_STATUS`, add the setter, and render the control in the header:

```tsx
	const [searchParams, setSearchParams] = useSearchParams();

	const status: SessionStatus | undefined =
		searchParams.get("status") === FILTER_STATUS ? FILTER_STATUS : undefined;

	function handleStatusChange(next: SessionStatus | undefined) {
		setSearchParams(
			(previous) => {
				// Copy, so an unrelated parameter such as the mock scenario switch survives.
				const params = new URLSearchParams(previous);
				if (next) {
					params.set("status", next);
				} else {
					params.delete("status");
				}
				return params;
			},
			{ replace: true },
		);
	}
```

```tsx
			<header className="flex flex-wrap items-center justify-between gap-4">
				<h2 className="text-lg font-semibold">{t("list.heading")}</h2>
				<StatusFilter value={status} onChange={handleStatusChange} />
			</header>
```

**Step 13.5 — run green.** `npx vitest run src/features/sessions/ui/SessionsWorkspacePage.filter.test.tsx`
Expected: `Tests 3 passed (3)`.

**Step 13.6 — commit.** `npm run lint:fix`, then
`git commit -m "feat(sessions): add the All plus scheduled status filter"`.

**Done check.** The filter has exactly two options, both from i18n keys; filtering happens in the
handler, so `meta.total` is 2 under the filter (F-05); no client-side `.filter()` on the response.

---

## T14 — Create-session form

**Goal.** Add the trigger, the two-field form, inline validation, duplicate-submission prevention,
and the post-success close/reset, with the created session appearing in the visible list.

**Satisfies.** AC-12, AC-13, AC-14, AC-15, AC-16, AC-17, AC-18, AC-19, AC-20, AC-21; completes
AC-25.

**Flow trace.** The user clicks `New session` on `/sessions`; `SessionsWorkspacePage` sets
`isFormOpen` to `true` and mounts
`<CreateSessionForm onCreated={() => setIsFormOpen(false)} />`; the user types
`  Morning Shooting Block  ` into `Title` and a `now + 24h` value into `Start date and time`;
`validateCreateSessionForm` runs during render and, after the first submit attempt, feeds the inline
messages; submitting runs the rule again with a fresh `new Date()`, and on `{}` calls
`mutation.mutate(values, { onSuccess })`; `buildCreateSessionRequest` trims the title and converts
the start to `startsAt` in ISO UTC; `createSession` posts the full contract body to
`POST /api/sessions`; `createSessionHandler` inserts a `scheduled` record and answers `201`; the
hook invalidates `["sessions", "list"]`, the component's `onSuccess` closes the form, the active
list query refetches under the unchanged filter key, and the new row appears.

**Interfaces.**

* Consumes: `validateCreateSessionForm`, `hasFormErrors`, `CreateSessionFormValues`,
  `CreateSessionFormErrors` (T9); `useCreateSessionMutation` (T11); `sessions:form.*` keys (T7).
* Produces — `src/features/sessions/ui/CreateSessionForm.tsx`:

```ts
export function CreateSessionForm(props: { onCreated: () => void }): JSX.Element;
```

* Modifies — `SessionsWorkspacePage` gains `const [isFormOpen, setIsFormOpen] = useState(false)`,
  the `form.open` trigger button, and the conditional mount. D-05's "reset" is achieved by
  unmounting the form on success, so no reset code exists.

**Step 14.1 — failing test.** Create
`src/features/sessions/ui/SessionsWorkspacePage.create.test.tsx`:

```tsx
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CREATE_ERROR_BODY, resetSessionsDb, server } from "@/test/msw";
import { renderApp } from "@/test/render-app";

function futureLocalDateTimeValue(offsetMs = 24 * 60 * 60 * 1000): string {
	const date = new Date(Date.now() + offsetMs);
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
		date.getHours(),
	)}:${pad(date.getMinutes())}`;
}

function fillStartsAt(value: string) {
	fireEvent.change(screen.getByLabelText("Start date and time"), { target: { value } });
}

beforeEach(() => {
	resetSessionsDb();
});

afterEach(() => {
	server.events.removeAllListeners();
});

describe("create session form", () => {
	it("renders the inputs only after the open control is activated", async () => {
		const user = userEvent.setup();
		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });

		expect(screen.queryByLabelText("Title")).toBeNull();
		expect(screen.queryByLabelText("Start date and time")).toBeNull();

		await user.click(screen.getByRole("button", { name: "New session" }));

		expect(screen.getByLabelText("Title")).toBeInTheDocument();
		expect(screen.getByLabelText("Start date and time")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Create session" })).toBeInTheDocument();
	});

	it("blocks submission and explains the title rule without sending a request", async () => {
		const user = userEvent.setup();
		const posts: string[] = [];
		server.events.on("request:start", ({ request }) => {
			if (request.method === "POST") {
				posts.push(request.url);
			}
		});

		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });
		await user.click(screen.getByRole("button", { name: "New session" }));

		await user.type(screen.getByLabelText("Title"), "  ab  ");
		fillStartsAt(futureLocalDateTimeValue());
		await user.click(screen.getByRole("button", { name: "Create session" }));

		expect(
			screen.getByText("Enter a title between 3 and 80 characters."),
		).toBeInTheDocument();
		expect(posts).toHaveLength(0);

		await user.type(screen.getByLabelText("Title"), "c");

		expect(screen.queryByText("Enter a title between 3 and 80 characters.")).toBeNull();
	});

	it("blocks submission for a missing and for a past start date and time", async () => {
		const user = userEvent.setup();
		const posts: string[] = [];
		server.events.on("request:start", ({ request }) => {
			if (request.method === "POST") {
				posts.push(request.url);
			}
		});

		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });
		await user.click(screen.getByRole("button", { name: "New session" }));
		await user.type(screen.getByLabelText("Title"), "Morning Shooting Block");

		await user.click(screen.getByRole("button", { name: "Create session" }));
		expect(screen.getByText("Enter a start date and time.")).toBeInTheDocument();

		fillStartsAt("2020-01-01T09:00");
		await user.click(screen.getByRole("button", { name: "Create session" }));
		expect(
			screen.getByText("The start date and time must be in the future."),
		).toBeInTheDocument();

		expect(posts).toHaveLength(0);
	});

	it("creates a session, keeps the active filter, and shows the trimmed title in the list", async () => {
		const user = userEvent.setup();
		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });

		await user.selectOptions(screen.getByLabelText("Status"), "scheduled");
		await screen.findByRole("heading", { name: "Private Footwork Review" });

		await user.click(screen.getByRole("button", { name: "New session" }));
		await user.type(screen.getByLabelText("Title"), "  Morning Shooting Block  ");
		fillStartsAt(futureLocalDateTimeValue());
		await user.click(screen.getByRole("button", { name: "Create session" }));

		expect(
			await screen.findByRole("heading", { name: "Morning Shooting Block" }),
		).toBeInTheDocument();
		expect(screen.queryByLabelText("Title")).toBeNull();
		expect(screen.getByLabelText("Status")).toHaveValue("scheduled");
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
	});

	it("sends exactly one POST when submit is activated twice and re-enables it on settle", async () => {
		const user = userEvent.setup();
		let postCount = 0;
		server.use(
			http.post("/api/sessions", async () => {
				postCount += 1;
				await delay(120);
				return HttpResponse.json(CREATE_ERROR_BODY, { status: 500 });
			}),
		);

		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });
		await user.click(screen.getByRole("button", { name: "New session" }));
		await user.type(screen.getByLabelText("Title"), "Morning Shooting Block");
		fillStartsAt(futureLocalDateTimeValue());

		await user.click(screen.getByRole("button", { name: "Create session" }));

		const pending = await screen.findByRole("button", { name: "Creating…" });
		expect(pending).toBeDisabled();
		await user.click(pending);

		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Create session" })).toBeEnabled(),
		);
		expect(postCount).toBe(1);
		expect(screen.getByLabelText("Title")).toHaveValue("Morning Shooting Block");
	});
});
```

The last test also pins the D-06 guardrail: a failed create shows no message, but `isPending`
settles, the submit control becomes usable again, and the entered values are still there.

**Step 14.2 — run red.** `npx vitest run src/features/sessions/ui/SessionsWorkspacePage.create.test.tsx`
Expected: `TestingLibraryElementError: Unable to find an accessible element with the role "button" and name "New session"`.

**Step 14.3 — implement the form.** Create `src/features/sessions/ui/CreateSessionForm.tsx`:

```tsx
import { type FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import {
	type CreateSessionFormValues,
	hasFormErrors,
	validateCreateSessionForm,
} from "../model/create-session";
import { useCreateSessionMutation } from "../model/use-create-session-mutation";

const EMPTY_VALUES: CreateSessionFormValues = { title: "", startsAtLocal: "" };

const TITLE_ERROR_ID = "create-session-title-error";
const STARTS_AT_ERROR_ID = "create-session-starts-at-error";

type CreateSessionFormProps = {
	onCreated: () => void;
};

export function CreateSessionForm({ onCreated }: CreateSessionFormProps) {
	const { t } = useTranslation("sessions");
	const [values, setValues] = useState<CreateSessionFormValues>(EMPTY_VALUES);
	const [showErrors, setShowErrors] = useState(false);
	const mutation = useCreateSessionMutation();

	// Derived during render: a message disappears as soon as its field becomes valid (AC-18).
	const errors = showErrors ? validateCreateSessionForm(values) : {};

	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (mutation.isPending) {
			return;
		}

		// Re-run with a fresh clock: the form may have sat open across a minute boundary (Q-01).
		const submitErrors = validateCreateSessionForm(values, new Date());
		setShowErrors(true);
		if (hasFormErrors(submitErrors)) {
			return;
		}

		mutation.mutate(values, { onSuccess: () => onCreated() });
	}

	return (
		<form
			onSubmit={handleSubmit}
			noValidate
			className="flex flex-col gap-3 rounded border border-slate-200 bg-white p-4"
		>
			<h3 className="font-medium">{t("form.heading")}</h3>

			<div className="flex flex-col gap-1">
				<label htmlFor="create-session-title" className="text-sm font-medium">
					{t("form.title.label")}
				</label>
				<input
					id="create-session-title"
					type="text"
					value={values.title}
					aria-invalid={errors.title !== undefined}
					aria-describedby={errors.title ? TITLE_ERROR_ID : undefined}
					onChange={(event) => setValues({ ...values, title: event.target.value })}
					className="rounded border border-slate-300 px-2 py-1"
				/>
				{errors.title ? (
					<p id={TITLE_ERROR_ID} className="text-sm text-red-700">
						{t(`form.validation.${errors.title}`)}
					</p>
				) : null}
			</div>

			<div className="flex flex-col gap-1">
				<label htmlFor="create-session-starts-at" className="text-sm font-medium">
					{t("form.startsAt.label")}
				</label>
				<input
					id="create-session-starts-at"
					type="datetime-local"
					value={values.startsAtLocal}
					aria-invalid={errors.startsAt !== undefined}
					aria-describedby={errors.startsAt ? STARTS_AT_ERROR_ID : undefined}
					onChange={(event) => setValues({ ...values, startsAtLocal: event.target.value })}
					className="rounded border border-slate-300 px-2 py-1"
				/>
				{errors.startsAt ? (
					<p id={STARTS_AT_ERROR_ID} className="text-sm text-red-700">
						{t(`form.validation.${errors.startsAt}`)}
					</p>
				) : null}
			</div>

			<button
				type="submit"
				disabled={mutation.isPending}
				className="self-start rounded bg-slate-900 px-3 py-1 text-sm text-white disabled:opacity-60"
			>
				{mutation.isPending ? t("form.pending") : t("form.submit")}
			</button>
		</form>
	);
}
```

**Step 14.4 — wire it into the page.** Edit `src/features/sessions/ui/SessionsWorkspacePage.tsx`:
add `import { useState } from "react";` and `import { CreateSessionForm } from "./CreateSessionForm";`,
then

```tsx
	const [isFormOpen, setIsFormOpen] = useState(false);
```

```tsx
				<div className="flex flex-wrap items-center gap-3">
					<StatusFilter value={status} onChange={handleStatusChange} />
					<button
						type="button"
						onClick={() => setIsFormOpen(true)}
						className="rounded border border-slate-300 bg-white px-3 py-1 text-sm"
					>
						{t("form.open")}
					</button>
				</div>
			</header>

			{isFormOpen ? <CreateSessionForm onCreated={() => setIsFormOpen(false)} /> : null}
```

placed between the header and `<SessionsListSection status={status} />`.

**Step 14.5 — run green.** `npx vitest run src/features/sessions/ui/SessionsWorkspacePage.create.test.tsx`
Expected: `Tests 5 passed (5)`.

**Step 14.6 — run the full suite.** `npm run test`
Expected: `Test Files 15 passed (15)`.

**Step 14.7 — commit.** `npm run lint:fix`, then
`git commit -m "feat(sessions): add the create-session form with validation and pending state"`.

**Done check.** The form collects only title and start; the seven remaining contract fields come
from `CREATE_SESSION_DEFAULTS` (D-02). No create-error message exists anywhere (D-06). The submit
control is disabled while pending and the handler early-returns, so a double activation produces
exactly one `POST`.

---

## T15 — Quality gates, layer checks, and the manual browser check

**Goal.** Prove the whole change against the repository's own gates and record one real browser
observation.

**Satisfies.** AC-23 (final layer assertion), AC-24 (final), AC-26, AC-27 (final); the TASK.md
"Manual check" requirement.

No new production code. This task writes nothing under `src/`.

**Step 15.1 — layer and boundary checks.** Run each and confirm the expected output:

```bash
rg -n "@/mocks|\.\./mocks|from \"\./mocks" src/app src/features src/services src/shared
rg -n "@/test|\.\./test" src/app src/features src/services src/shared --glob '!**/*.test.ts' --glob '!**/*.test.tsx'
rg -n "fetch\(" src/features src/app src/shared
rg -n "frontend-accelerator-assessment" src
```

Expected: all four print nothing. The second one deliberately excludes test files, because the
accepted clarification lets colocated tests import `@/test/msw` and `@/test/render-app`.

**Step 15.2 — the four gates, in this order.**

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Expected: `biome check .` reports `Checked N files ... No fixes applied`; `tsc -b --noEmit` prints
nothing; Vitest reports `Test Files 15 passed (15)`; `vite build` reports `built in ...` with no TS
errors. If `npm run lint` reports fixable findings, run `npm run lint:fix` and re-run all four.

**Step 15.3 — manual browser check.** `npm run dev`, then read the actual URL Vite prints (do not
assume a port). Exercise, in one session:

1. open `/` and confirm it lands on `/sessions` with five rows, each showing a title, a status word,
   and a local start date/time;
2. select `Scheduled` in the `Status` control and confirm only `U14 Shooting Lab` and
   `Private Footwork Review` remain, and the address bar shows `?status=scheduled`;
3. click `New session`, submit with an empty form once to see both validation messages, then enter a
   title and a future date/time and submit;
4. confirm the form closes, the filter stays on `Scheduled`, and the new session appears in the
   list;
5. reload with `?mock=slow` to observe the loading state, `?mock=empty` for the empty message, and
   `?mock=list-error-once` to observe the error message plus a successful `Try again`.

Record verbatim what was observed — including anything that did not work — and hand it to the
developer for the `## Manual Browser Observation` section of `workflow-log.md`. Do not claim a check
that was not run.

**Step 15.4 — report known limitations.** Restate these for the developer's `## Completion` section:

1. a failed `POST /api/sessions` shows the user no message (D-06); only the pending state clears;
2. seed dates are static, so the `scheduled` and `full` records — and the seed test that asserts
   they are in the future — go stale after 2027-08 (accepted consequence of D-03);
3. the list query uses `retry: false`, a per-query deviation from the global `retry: 1` in
   `src/app/providers.tsx`, required to make AC-04 and AC-05 reachable;
4. `src/mocks/handlers.ts` duplicates a two-line `isoUtcSeconds` helper because `src/mocks/` must
   not import `src/features/`;
5. colocated tests import `@/test/msw` and `@/test/render-app`; no production module imports either.

**Step 15.5 — commit.** Nothing to commit unless `lint:fix` reformatted a file, in which case
`git commit -m "chore: apply biome formatting after the sessions workspace change"`.

**Done check.** All four gates green, all four boundary greps empty, one real browser observation
recorded.

## Verification

Exact commands, run from the repository root (which is the Application Root — there is one
`package.json`, at the root):

```bash
npm run test        # vitest run          -> Test Files 15 passed (15)
npm run lint        # biome check .       -> no diagnostics
npm run typecheck   # tsc -b --noEmit     -> no output
npm run build       # tsc -b && vite build -> built successfully
npm run dev         # Vite dev server with the MSW worker; use the URL Vite prints
```

Boundary checks (rule evidence, not scripts):

```bash
rg -n "@/mocks" src/app src/features src/services src/shared          # expect: no matches
rg -n "fetch\(" src/features src/app src/shared                        # expect: no matches
rg -n "frontend-accelerator-assessment" src                            # expect: no matches
```

Manual browser check required by `TASK.md`: start the app with `npm run dev`, exercise
list -> filter -> create once, and record what was actually observed (see Step 15.3). Scenario URLs
for the states that are hard to trigger by hand: `?mock=slow`, `?mock=empty`,
`?mock=list-error-once`, `?mock=create-error`.

## Traceability

Every acceptance criterion except the dropped AC-22 maps to at least one task.

| AC | Satisfied by | Evidence |
| --- | --- | --- |
| AC-01 | T6, T10, T12 | `SessionsWorkspacePage.list.test.tsx` "issues exactly one list request and renders one row per session"; request path goes UI -> hook -> wrapper -> `http.ts` |
| AC-02 | T8, T12 | `date-time.test.ts` "converts an ISO UTC value into the requested timezone"; list test asserts the row text equals `formatSessionStart("2027-08-03T16:00:00Z", { locale: "en" })` |
| AC-03 | T7, T12 | list test "shows the loading state and no rows while the request is pending" (delayed handler) |
| AC-04 | T2, T7, T12 | list test "shows a translated, recoverable error state and recovers on retry"; asserts no `500` and no `SESSIONS_UNAVAILABLE` in the DOM |
| AC-05 | T10, T12 | same test: `Try again` re-issues the GET, `{ once: true }` override falls through to the default handler, rows replace the error |
| AC-06 | T7, T12 | list test "shows the translated empty message and no error for an empty response" |
| AC-07 | T7, T12 | list test "shows the status as a text label..." asserts `within(row).getByText("Scheduled")` |
| AC-08 | T7, T13 | filter test "offers exactly All and Scheduled" asserts the two option labels |
| AC-09 | T13 | same test: `toHaveValue("all")` and five rows initially |
| AC-10 | T5, T13 | filter test asserts only `U14 Shooting Lab` and `Private Footwork Review` remain; handler-side filtering verified in `handlers.test.ts` |
| AC-11 | T13 | filter test: selecting `All` restores five rows |
| AC-12 | T14 | create test "creates a session, keeps the active filter..." asserts the select is still `scheduled` after creation |
| AC-13 | T14 | create test "renders the inputs only after the open control is activated" |
| AC-14 | T9, T14 | form has exactly Title, Start date and time, and Submit; the other seven fields come from `CREATE_SESSION_DEFAULTS` |
| AC-15 | T9, T14 | `create-session.test.ts` boundary cases 3/80/81 with trimming; create test asserts the translated message and its removal |
| AC-16 | T9, T11, T14 | `buildCreateSessionRequest` trims; mutation test asserts the server echoes `Morning Shooting Block`; create test asserts the trimmed title in the list |
| AC-17 | T8, T9, T14 | `isFutureLocalDateTime` rejects the current minute; create test covers empty and past values |
| AC-18 | T14 | messages render inside the field's `<div>` with `aria-describedby` / `aria-invalid`, and disappear when the field becomes valid |
| AC-19 | T14 | create tests count `POST`s with a `server.events` listener; both validation tests assert `posts` is empty |
| AC-20 | T11, T14 | create test "sends exactly one POST when submit is activated twice"; `Creating…` is visible and the control disabled |
| AC-21 | T4, T5, T11, T14 | mock inserts into the store; create test `findByRole("heading", { name: "Morning Shooting Block" })` after invalidation |
| AC-22 | — | **Dropped by D-06.** No create-error UI. The pending-state guardrail is covered by T11 test 2 and T14 test 5. |
| AC-23 | T5, T15 | both handlers registered in `src/mocks/handlers.ts`; `npm run dev` needs no backend; boundary greps in Step 15.1 |
| AC-24 | T7, T15 | `sessions-namespace.test.ts` asserts en/ru key parity, the exact key list, and Russian rendering after `changeLanguage("ru")` |
| AC-25 | T13, T14 | `SessionsWorkspacePage.filter.test.tsx` and `SessionsWorkspacePage.create.test.tsx` render the routed workspace against the MSW node server |
| AC-26 | T15 | `npm run lint`, `npm run typecheck`, `npm run build` in Step 15.2 |
| AC-27 | T6, T12, T15 | feature has `index.ts`, `ui/`, `model/`; `router.tsx` imports the barrel; wrappers in `src/services/api/endpoints/`; import-direction greps in Step 15.1 |

## Files Touched

Created:

```text
src/services/api/endpoints/sessions.types.ts        + .test.ts        (T1)
src/mocks/scenario.ts                               + .test.ts        (T2)
src/mocks/data/sessions.seed.ts                     + .test.ts        (T3)
src/mocks/db/sessions-db.ts                         + .test.ts        (T4)
src/mocks/handlers.test.ts                                            (T5)
src/services/api/endpoints/sessions.ts              + .test.ts        (T6)
src/test/msw.ts                                                       (T6)
src/shared/i18n/locales/en/sessions.json                              (T7)
src/shared/i18n/locales/ru/sessions.json                              (T7)
src/shared/i18n/sessions-namespace.test.ts                            (T7)
src/features/sessions/model/date-time.ts            + .test.ts        (T8)
src/features/sessions/model/create-session.ts       + .test.ts        (T9)
src/features/sessions/model/sessions-query.ts       + .test.tsx       (T10)
src/features/sessions/model/use-create-session-mutation.ts + .test.tsx (T11)
src/features/sessions/ui/SessionsList.tsx                             (T12)
src/features/sessions/ui/SessionsListSection.tsx                      (T12)
src/features/sessions/ui/SessionsWorkspacePage.tsx                    (T12)
src/features/sessions/ui/SessionsWorkspacePage.list.test.tsx          (T12)
src/features/sessions/index.ts                                        (T12)
src/test/render-app.tsx                                               (T12)
src/features/sessions/ui/StatusFilter.tsx                             (T13)
src/features/sessions/ui/SessionsWorkspacePage.filter.test.tsx        (T13)
src/features/sessions/ui/CreateSessionForm.tsx                        (T14)
src/features/sessions/ui/SessionsWorkspacePage.create.test.tsx        (T14)
```

Modified:

```text
src/mocks/handlers.ts          (T5)  empty array -> two handlers
src/shared/i18n/index.ts       (T7)  register the `sessions` namespace
src/app/router.tsx             (T12) index redirect + /sessions route
src/app/App.smoke.test.tsx     (T12) cover the redirect
src/features/sessions/ui/SessionsWorkspacePage.tsx (T13, T14) filter and form wiring
```

Deleted:

```text
src/services/api/endpoints/.gitkeep   (T6)
```

Untouched by design: `src/services/api/http.ts` (Q-04), `src/mocks/server.ts`,
`src/mocks/browser.ts`, `src/test/setup.ts`, `src/app/providers.tsx`, `src/app/AppLayout.tsx`,
`src/main.tsx`, `vite.config.ts`, `biome.jsonc`, `package.json`, `tsconfig*.json`.

## Risks

1. **Relative-URL `fetch` in jsdom.** The app calls `fetch("/api/sessions")`; MSW's fetch
   interceptor resolves a relative input against `location.origin` when a DOM `location` exists, so
   this works under `environment: "jsdom"`. No test in the repository has exercised it yet, because
   `handlers.ts` was empty. T5 is the first proof. If it fails, report it — do not change
   `vite.config.ts` or `src/test/setup.ts` without a new decision.
2. **`user-event` and `datetime-local`.** T14 uses `fireEvent.change` for the date/time input and
   `user.type` for the text input, because `user.type` does not reliably fill a `datetime-local`
   field in jsdom.
3. **Static seed dates** go stale after 2027-08 and will fail the T3 future/past assertion then.
   Accepted consequence of D-03; recorded as a known limitation in Step 15.4.
4. **Server-side filtering costs one request per filter change**, so filter assertions must use
   `findBy*` / `waitFor`, never a synchronous `getBy*` immediately after `selectOptions`.
