import { http } from "@/services/api/http";
import type {
	CreateSessionRequest,
	CreateSessionResponse,
	ListSessionsParams,
	SessionsListResponse,
} from "./sessions.types";

const SESSIONS_PATH = "/sessions";

/** Builds `?status=scheduled` or `""`. Empty values are omitted (Q-02). */
function buildSessionsQuery(params: ListSessionsParams): string {
	const search = new URLSearchParams();
	if (params.status) {
		search.set("status", params.status);
	}
	const queryString = search.toString();
	return queryString ? `?${queryString}` : "";
}

export function listSessions(
	params: ListSessionsParams = {},
	options: { signal?: AbortSignal } = {},
): Promise<SessionsListResponse> {
	return http.get<SessionsListResponse>(`${SESSIONS_PATH}${buildSessionsQuery(params)}`, {
		signal: options.signal,
	});
}

export function createSession(
	body: CreateSessionRequest,
	options: { signal?: AbortSignal } = {},
): Promise<CreateSessionResponse> {
	return http.post<CreateSessionResponse>(SESSIONS_PATH, body, { signal: options.signal });
}
