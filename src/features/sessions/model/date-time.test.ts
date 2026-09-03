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

	it.each([
		["2027-02-30T10:00", "a day that does not exist in the month"],
		["2027-02-29T10:00", "February 29 outside a leap year"],
		["2027-13-01T10:00", "a month above 12"],
		["2027-00-10T10:00", "a month below 1"],
		["2027-03-32T10:00", "a day above the calendar month"],
		["2027-03-00T10:00", "a day below 1"],
		["2027-03-14T24:00", "an hour above 23"],
		["2027-03-14T99:00", "an hour far above 23"],
		["2027-03-14T18:60", "a minute above 59"],
		["0000-01-01T00:00", "a year the Date constructor remaps to 1900"],
	])("returns null for %s (%s)", (value) => {
		expect(parseLocalDateTime(value)).toBeNull();
	});

	it("still accepts February 29 in a leap year", () => {
		const parsed = parseLocalDateTime("2028-02-29T10:00");
		expect(parsed?.getMonth()).toBe(1);
		expect(parsed?.getDate()).toBe(29);
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

	it("rejects a non-existent calendar date instead of rolling it over", () => {
		expect(isFutureLocalDateTime("2027-02-30T10:00", new Date(2027, 0, 1))).toBe(false);
		expect(isFutureLocalDateTime("2027-13-01T10:00", new Date(2027, 0, 1))).toBe(false);
		expect(isFutureLocalDateTime("2027-03-14T99:00", new Date(2027, 0, 1))).toBe(false);
	});

	it("rejects the current minute and accepts the next one", () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date(2027, 2, 14, 18, 30, 42));

		expect(isFutureLocalDateTime("2027-03-14T18:30")).toBe(false);
		expect(isFutureLocalDateTime("2027-03-14T18:31")).toBe(true);
	});
});

describe("formatSessionStart", () => {
	it.each(["", "not-an-instant", "2027-13-45"])(
		"returns an empty string for the unparseable instant %j instead of throwing",
		(isoUtc) => {
			expect(() => formatSessionStart(isoUtc)).not.toThrow();
			expect(formatSessionStart(isoUtc)).toBe("");
		},
	);

	it("falls back to the en locale when none is supplied", () => {
		expect(formatSessionStart("2027-08-03T16:00:00Z", { timeZone: "UTC" })).toBe(
			"Aug 3, 2027, 4:00 PM",
		);
	});

	it("converts an ISO UTC value into the requested timezone rather than printing it verbatim", () => {
		const formatted = formatSessionStart("2027-08-03T16:00:00Z", {
			locale: "en-GB",
			timeZone: "Europe/Berlin",
		});

		expect(formatted).toContain("18:00");
		expect(formatted).not.toContain("16:00");
	});
});
