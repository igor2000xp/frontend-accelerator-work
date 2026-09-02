import { afterEach, describe, expect, it } from "vitest";
import {
	CREATE_ERROR_BODY,
	currentScenario,
	LIST_ERROR_BODY,
	shouldFailListRequest,
} from "./scenario";

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
