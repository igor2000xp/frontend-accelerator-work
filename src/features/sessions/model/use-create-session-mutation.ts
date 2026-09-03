import { type UseMutationResult, useMutation, useQueryClient } from "@tanstack/react-query";
import { createSession } from "@/services/api/endpoints/sessions";
import type { CreateSessionResponse } from "@/services/api/endpoints/sessions.types";
import { buildCreateSessionRequest, type CreateSessionFormValues } from "./create-session";
import { sessionKeys } from "./sessions-query";

export function useCreateSessionMutation(): UseMutationResult<
	CreateSessionResponse,
	Error,
	CreateSessionFormValues
> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (values: CreateSessionFormValues) =>
			createSession(buildCreateSessionRequest(values)),
		onSuccess: () => {
			// Not awaited (Q-03): the form closes at once and the row appears when the refetch lands.
			void queryClient.invalidateQueries({ queryKey: sessionKeys.lists() });
		},
	});
}
