import { beforeEach, describe, expect, it } from "vitest";
import type {
	CreateSessionRequest,
	CreateSessionResponse,
	SessionsListResponse,
} from "@/services/api/endpoints/sessions.types";
import { http as apiClient } from "@/services/api/http";
import { resetSessionsDb } from "./db/sessions-db";

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

describe("GET /api/sessions", () => {
	it("serves every seeded session with the total computed from the returned rows", async () => {
		const body = await apiClient.get<SessionsListResponse>("/sessions");
		expect(body.data).toHaveLength(5);
		expect(body.meta).toEqual({ page: 1, pageSize: 10, total: 5 });
	});

	it("filters by status and computes meta.total after filtering", async () => {
		const body = await apiClient.get<SessionsListResponse>("/sessions?status=scheduled");
		expect(body.data.map((session) => session.title)).toEqual([
			"U14 Shooting Lab",
			"Private Footwork Review",
		]);
		expect(body.meta.total).toBe(2);
	});

	it("treats an empty status as no filter", async () => {
		const body = await apiClient.get<SessionsListResponse>("/sessions?status=");
		expect(body.data).toHaveLength(5);
	});

	it("rejects an unsupported status with 400", async () => {
		await expect(
			apiClient.get<SessionsListResponse>("/sessions?status=archived"),
		).rejects.toMatchObject({
			status: 400,
		});
	});
});

describe("POST /api/sessions", () => {
	it("creates a scheduled session that survives the next list read", async () => {
		const created = await apiClient.post<CreateSessionResponse>("/sessions", VALID_BODY);

		expect(created.id).toBe("ses_900");
		expect(created.status).toBe("scheduled");
		expect(created.title).toBe("Morning Shooting Block");
		expect(created.startsAt).toBe("2027-03-14T17:30:00Z");
		expect(created.bookedCount).toBe(0);
		expect(created.coach).toEqual({
			id: "coach_01",
			name: "Maya Brooks",
			email: "maya@example.test",
		});
		expect(created.location).toEqual({ name: "North Court", address: "18 Harbor Street" });
		expect(created.description).toBeNull();
		expect(created.cancellation).toBeNull();

		const list = await apiClient.get<SessionsListResponse>("/sessions?status=scheduled");
		expect(list.data.map((session) => session.title)).toContain("Morning Shooting Block");
	});

	it("rejects a body whose trimmed title is too short", async () => {
		await expect(
			apiClient.post<CreateSessionResponse>("/sessions", { ...VALID_BODY, title: "  ab  " }),
		).rejects.toMatchObject({ status: 400 });
	});

	it("rejects an unknown coach", async () => {
		await expect(
			apiClient.post<CreateSessionResponse>("/sessions", {
				...VALID_BODY,
				coachId: "coach_99",
			}),
		).rejects.toMatchObject({ status: 400 });
	});
});
