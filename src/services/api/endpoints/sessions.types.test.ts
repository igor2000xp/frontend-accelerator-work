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
