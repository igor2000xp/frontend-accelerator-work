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
