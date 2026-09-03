import { type UseQueryResult, useQuery } from "@tanstack/react-query";
import { listSessions } from "@/services/api/endpoints/sessions";
import type {
	ListSessionsParams,
	SessionStatus,
	SessionsListResponse,
} from "@/services/api/endpoints/sessions.types";

export const sessionKeys = {
	all: ["sessions"] as const,
	lists: () => [...sessionKeys.all, "list"] as const,
	list: (params: ListSessionsParams) => [...sessionKeys.lists(), params] as const,
};

export function useSessionsQuery(
	status: SessionStatus | undefined,
): UseQueryResult<SessionsListResponse, Error> {
	return useQuery({
		queryKey: sessionKeys.list({ status }),
		queryFn: ({ signal }) => listSessions({ status }, { signal }),
		// AC-04/AC-05 must be reachable on the first failure; the global default is retry: 1.
		retry: false,
	});
}
