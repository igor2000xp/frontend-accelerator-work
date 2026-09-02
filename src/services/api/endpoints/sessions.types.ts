export type SessionType = "training" | "camp" | "private";
export type SessionVisibility = "public" | "invite-only";

/**
 * Single source of truth for the status set. `SessionStatus` is derived from it, so the runtime
 * tuple the mock filter guard validates against and the compile-time union cannot drift apart.
 */
export const SESSION_STATUSES = ["scheduled", "full", "cancelled", "completed"] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export type CoachSummary = {
	id: string;
	name: string;
	email: string;
};

export type LocationSummary = {
	name: string;
	address: string;
};

export type SessionSummary = {
	id: string;
	title: string;
	type: SessionType;
	status: SessionStatus;
	/** ISO 8601 UTC, e.g. `2027-08-03T16:00:00Z`. Rendered in the user's local timezone. */
	startsAt: string;
	durationMinutes: number;
	capacity: number;
	bookedCount: number;
	visibility: SessionVisibility;
	coach: CoachSummary;
	location: LocationSummary;
	/** ISO 8601 UTC. */
	updatedAt: string;
};

export type SessionDetails = SessionSummary & {
	description: string | null;
	trainerNotes: string | null;
	/** ISO 8601 UTC. */
	createdAt: string;
	cancellation: null | { reason: string | null; cancelledAt: string };
};

export type SessionsListMeta = {
	page: number;
	pageSize: number;
	total: number;
};

/** `GET /api/sessions` success body. */
export type SessionsListResponse = {
	data: SessionSummary[];
	meta: SessionsListMeta;
};

/** `GET /api/sessions` request inputs. Omitted keys are omitted from the query string. */
export type ListSessionsParams = {
	status?: SessionStatus;
};

/** `POST /api/sessions` request body. Full contract shape; no field is optional-by-default. */
export type CreateSessionRequest = {
	title: string;
	/** ISO 8601 UTC. */
	startsAt: string;
	type: SessionType;
	durationMinutes: number;
	coachId: string;
	locationName: string;
	locationAddress: string;
	capacity: number;
	visibility: SessionVisibility;
	description?: string | null;
	trainerNotes?: string | null;
};

/** `POST /api/sessions` `201` body. */
export type CreateSessionResponse = SessionDetails;

/** Error body shape used by every failing response in this scope. Not read by the UI (Q-04). */
export type ApiErrorBody = {
	error: {
		code: string;
		message: string;
		fieldErrors?: Record<string, string>;
	};
};
