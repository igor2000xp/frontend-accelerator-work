import { delay, HttpResponse, http, type RequestHandler } from "msw";
import {
	type CreateSessionRequest,
	SESSION_STATUSES,
	type SessionDetails,
	type SessionStatus,
	type SessionSummary,
} from "@/services/api/endpoints/sessions.types";
import { MOCK_COACHES } from "./data/sessions.seed";
import * as sessionsDb from "./db/sessions-db";
import {
	CREATE_ERROR_BODY,
	currentScenario,
	LIST_ERROR_BODY,
	shouldFailListRequest,
} from "./scenario";

const SLOW_SCENARIO_DELAY_MS = 1500;
const EMPTY_META = { page: 1, pageSize: 10, total: 0 };

function isSessionStatus(value: string): value is SessionStatus {
	return (SESSION_STATUSES as readonly string[]).includes(value);
}

/** ISO 8601 UTC with second precision. Duplicated here because mocks must not import features. */
function isoUtcSeconds(date: Date): string {
	return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function validateCreateBody(
	body: CreateSessionRequest,
	coachExists: boolean,
): Record<string, string> {
	const fieldErrors: Record<string, string> = {};
	const title = typeof body.title === "string" ? body.title.trim() : "";
	if (title.length < 3 || title.length > 80) {
		fieldErrors.title = "Title must be between 3 and 80 characters.";
	}
	if (typeof body.startsAt !== "string" || Number.isNaN(Date.parse(body.startsAt))) {
		fieldErrors.startsAt = "startsAt must be an ISO 8601 timestamp.";
	}
	if (body.type !== "training" && body.type !== "camp" && body.type !== "private") {
		fieldErrors.type = "Unsupported session type.";
	}
	if (body.visibility !== "public" && body.visibility !== "invite-only") {
		fieldErrors.visibility = "Unsupported visibility.";
	}
	if (!Number.isFinite(body.durationMinutes) || body.durationMinutes <= 0) {
		fieldErrors.durationMinutes = "durationMinutes must be greater than zero.";
	}
	if (!Number.isFinite(body.capacity) || body.capacity <= 0) {
		fieldErrors.capacity = "capacity must be greater than zero.";
	}
	if (!coachExists) {
		fieldErrors.coachId = "Unknown coach.";
	}
	return fieldErrors;
}

const listSessionsHandler = http.get("/api/sessions", async ({ request }) => {
	const scenario = currentScenario();

	if (shouldFailListRequest(scenario)) {
		return HttpResponse.json(LIST_ERROR_BODY, { status: 500 });
	}
	if (scenario === "slow") {
		await delay(SLOW_SCENARIO_DELAY_MS);
	}
	if (scenario === "empty") {
		return HttpResponse.json({ data: [], meta: EMPTY_META });
	}

	const rawStatus = new URL(request.url).searchParams.get("status") ?? "";
	if (rawStatus !== "" && !isSessionStatus(rawStatus)) {
		return HttpResponse.json(
			{ error: { code: "INVALID_FILTER", message: "Unsupported status filter." } },
			{ status: 400 },
		);
	}

	const data = sessionsDb.listSessions({ status: rawStatus === "" ? undefined : rawStatus });
	return HttpResponse.json({ data, meta: { page: 1, pageSize: 10, total: data.length } });
});

const createSessionHandler = http.post("/api/sessions", async ({ request }) => {
	if (currentScenario() === "create-error") {
		return HttpResponse.json(CREATE_ERROR_BODY, { status: 500 });
	}

	const body = (await request.json()) as CreateSessionRequest;
	const coach = MOCK_COACHES.find((candidate) => candidate.id === body.coachId);
	const fieldErrors = validateCreateBody(body, coach !== undefined);

	if (!coach || Object.keys(fieldErrors).length > 0) {
		return HttpResponse.json(
			{
				error: {
					code: "VALIDATION_FAILED",
					message: "The session could not be validated.",
					fieldErrors,
				},
			},
			{ status: 400 },
		);
	}

	const stampedAt = isoUtcSeconds(new Date());
	const summary: SessionSummary = {
		id: sessionsDb.nextSessionId(),
		title: body.title,
		type: body.type,
		status: "scheduled",
		startsAt: body.startsAt,
		durationMinutes: body.durationMinutes,
		capacity: body.capacity,
		bookedCount: 0,
		visibility: body.visibility,
		coach: { ...coach },
		location: { name: body.locationName, address: body.locationAddress },
		updatedAt: stampedAt,
	};
	sessionsDb.insertSession(summary);

	const details: SessionDetails = {
		...summary,
		description: body.description ?? null,
		trainerNotes: body.trainerNotes ?? null,
		createdAt: stampedAt,
		cancellation: null,
	};
	return HttpResponse.json(details, { status: 201 });
});

/**
 * Feature request handlers are registered here.
 * Keep every mock behind this boundary so the HTTP client stays replaceable.
 */
export const handlers: RequestHandler[] = [listSessionsHandler, createSessionHandler];
