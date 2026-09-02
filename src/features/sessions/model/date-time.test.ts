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
