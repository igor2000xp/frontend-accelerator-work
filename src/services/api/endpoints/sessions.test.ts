import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import { resetSessionsDb, server } from "@/test/msw";
import { createSession, listSessions } from "./sessions";
import type { CreateSessionRequest } from "./sessions.types";

const VALID_BODY: CreateSessionRequest = {
	title: "Morning Shooting Block",
	startsAt: "2027-03-14T17:30:00Z",
	type: "training",
	durationMinutes: 90,
	coachId: "coach_01",
	locationName: "North Court",
	locationAddress: "18 Harbor Street",
	capacity: 18,
	visibility: "public",
};

beforeEach(() => {
	resetSessionsDb();
});

describe("listSessions", () => {
	it("omits the query string entirely when no status is given", async () => {
		let requestedUrl = "";
		server.use(
			http.get("/api/sessions", ({ request }) => {
				requestedUrl = request.url;
				return HttpResponse.json({ data: [], meta: { page: 1, pageSize: 10, total: 0 } });
			}),
		);

		await listSessions();

		expect(new URL(requestedUrl).search).toBe("");
	});

	it("sends only status=scheduled when the filter is active", async () => {
		let requestedUrl = "";
		server.use(
			http.get("/api/sessions", ({ request }) => {
				requestedUrl = request.url;
				return HttpResponse.json({ data: [], meta: { page: 1, pageSize: 10, total: 0 } });
			}),
		);

		await listSessions({ status: "scheduled" });

		expect(new URL(requestedUrl).search).toBe("?status=scheduled");
	});

	it("returns the parsed list body from the default handler", async () => {
		const response = await listSessions({ status: "scheduled" });
		expect(response.data.map((session) => session.title)).toEqual([
			"U14 Shooting Lab",
			"Private Footwork Review",
		]);
	});
});

describe("createSession", () => {
	it("posts the full contract body and returns the created session", async () => {
		let sentBody: CreateSessionRequest | undefined;
		server.use(
			http.post("/api/sessions", async ({ request }) => {
				sentBody = (await request.json()) as CreateSessionRequest;
				return HttpResponse.json({ error: { code: "X", message: "x" } }, { status: 500 });
			}),
		);

		await expect(createSession(VALID_BODY)).rejects.toMatchObject({ status: 500 });
		expect(sentBody).toEqual(VALID_BODY);
	});

	it("resolves with the 201 body from the default handler", async () => {
		const created = await createSession(VALID_BODY);
		expect(created.title).toBe("Morning Shooting Block");
		expect(created.status).toBe("scheduled");
	});
});
