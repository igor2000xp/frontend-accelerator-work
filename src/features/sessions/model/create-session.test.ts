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
		expect(validateCreateSessionForm({ title: "  abc  ", startsAtLocal: FUTURE }, NOW)).toEqual(
			{},
		);
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
