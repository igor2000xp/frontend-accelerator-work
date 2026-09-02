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
