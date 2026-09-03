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

/**
 * How long one `list-error-once` *attempt* lasts.
 *
 * The boundary cannot tell a React development remount from the user pressing "Try again": both
 * are byte-identical `GET /api/sessions`. React re-mounts every component once in development, so
 * failing only the first *request* handed the discarded mount the error and the surviving mount a
 * success — the error state never painted and the documented "error, then a successful retry in
 * one page load" check could not be performed at all. Every request inside this window is
 * therefore treated as the same failed attempt. A remount arrives within milliseconds; a person
 * reading an error and clicking a button cannot, so a retry lands outside the window and succeeds.
 */
const LIST_ERROR_ONCE_ATTEMPT_MS = 500;

let listErrorOnceStartedAt: number | null = null;

/** `list-error-once` fails the first list attempt after a page load, so a retry can succeed. */
export function shouldFailListRequest(scenario: MockScenario, now: number = Date.now()): boolean {
	if (scenario === "list-error") {
		return true;
	}
	if (scenario !== "list-error-once") {
		return false;
	}
	if (listErrorOnceStartedAt === null) {
		listErrorOnceStartedAt = now;
		return true;
	}
	return now - listErrorOnceStartedAt < LIST_ERROR_ONCE_ATTEMPT_MS;
}

/**
 * Reopens the first-attempt window. Needed only to isolate tests within one file, the way
 * `resetSessionsDb` is; a browser gets a fresh module on every page load.
 */
export function resetListErrorOnce(): void {
	listErrorOnceStartedAt = null;
}

export const LIST_ERROR_BODY: ApiErrorBody = {
	error: { code: "SESSIONS_UNAVAILABLE", message: "Sessions cannot be loaded right now." },
};

export const CREATE_ERROR_BODY: ApiErrorBody = {
	error: { code: "CREATE_SESSION_FAILED", message: "The session could not be created." },
};
