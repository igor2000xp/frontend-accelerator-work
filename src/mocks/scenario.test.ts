import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	CREATE_ERROR_BODY,
	currentScenario,
	LIST_ERROR_BODY,
	resetListErrorOnce,
	shouldFailListRequest,
} from "./scenario";

beforeEach(() => {
	resetListErrorOnce();
});

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

	it("fails the first list request for list-error-once", () => {
		expect(shouldFailListRequest("list-error-once", 1_000)).toBe(true);
	});

	// The regression this guards: a development remount is an identical GET arriving milliseconds
	// later. A first-request-only latch let that duplicate succeed, so the error state never
	// painted and the documented "error, then a successful retry" check could not be performed.
	it("keeps failing a list request that repeats inside the first attempt window", () => {
		expect(shouldFailListRequest("list-error-once", 1_000)).toBe(true);
		expect(shouldFailListRequest("list-error-once", 1_005)).toBe(true);
		expect(shouldFailListRequest("list-error-once", 1_499)).toBe(true);
	});

	it("succeeds once the attempt window has elapsed, so a retry recovers", () => {
		expect(shouldFailListRequest("list-error-once", 1_000)).toBe(true);
		expect(shouldFailListRequest("list-error-once", 1_500)).toBe(false);
		expect(shouldFailListRequest("list-error-once", 9_000)).toBe(false);
	});

	it("opens the attempt window at the first request, not at module load", () => {
		expect(shouldFailListRequest("list-error-once", 50_000)).toBe(true);
		expect(shouldFailListRequest("list-error-once", 50_400)).toBe(true);
		expect(shouldFailListRequest("list-error-once", 50_500)).toBe(false);
	});

	it("does not open the attempt window for an unrelated scenario", () => {
		expect(shouldFailListRequest("normal", 1_000)).toBe(false);
		expect(shouldFailListRequest("list-error", 1_000)).toBe(true);
		// The window still starts here, at 2_000, not back at 1_000.
		expect(shouldFailListRequest("list-error-once", 2_000)).toBe(true);
		expect(shouldFailListRequest("list-error-once", 2_400)).toBe(true);
	});
});

describe("canned error bodies", () => {
	it("carries the contract error codes", () => {
		expect(LIST_ERROR_BODY.error.code).toBe("SESSIONS_UNAVAILABLE");
		expect(CREATE_ERROR_BODY.error.code).toBe("CREATE_SESSION_FAILED");
	});
});
