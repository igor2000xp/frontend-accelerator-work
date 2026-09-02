import type { SessionStatus, SessionSummary } from "@/services/api/endpoints/sessions.types";
import { createSeedSessions } from "../data/sessions.seed";

const FIRST_CREATED_ID = 900;

let sessions: SessionSummary[] = createSeedSessions();
let idCounter = FIRST_CREATED_ID;

function byStartThenId(a: SessionSummary, b: SessionSummary): number {
	if (a.startsAt !== b.startsAt) {
		return a.startsAt < b.startsAt ? -1 : 1;
	}
	if (a.id === b.id) {
		return 0;
	}
	return a.id < b.id ? -1 : 1;
}

export type ListSessionsDbArgs = { status?: SessionStatus };

/** Sorted by `startsAt` ascending, then `id`, so ordering is deterministic. */
export function listSessions(args: ListSessionsDbArgs = {}): SessionSummary[] {
	const status = args.status;
	const filtered = status ? sessions.filter((session) => session.status === status) : sessions;
	return [...filtered].sort(byStartThenId);
}

export function insertSession(session: SessionSummary): SessionSummary {
	sessions.push(session);
	return session;
}

/** Restores the seed and the id counter. Call it in `beforeEach`. */
export function resetSessionsDb(): void {
	sessions = createSeedSessions();
	idCounter = FIRST_CREATED_ID;
}

export function nextSessionId(): string {
	const id = `ses_${idCounter}`;
	idCounter += 1;
	return id;
}
