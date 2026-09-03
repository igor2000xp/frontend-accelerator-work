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
