import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { listSessions } from "@/services/api/endpoints/sessions";
import type { CreateSessionResponse } from "@/services/api/endpoints/sessions.types";
import { resetSessionsDb } from "@/test/msw";
import { sessionKeys } from "./sessions-query";
import { useCreateSessionMutation } from "./use-create-session-mutation";

beforeEach(() => {
	resetSessionsDb();
});

describe("useCreateSessionMutation", () => {
	it("sends the trimmed title, creates a scheduled session, and invalidates the list", async () => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
		});
		const invalidate = vi.spyOn(queryClient, "invalidateQueries");
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useCreateSessionMutation(), { wrapper });

		let created: CreateSessionResponse | undefined;
		await act(async () => {
			created = await result.current.mutateAsync({
				title: "  Morning Shooting Block  ",
				startsAtLocal: "2027-03-14T18:30",
			});
		});

		expect(created?.title).toBe("Morning Shooting Block");
		expect(created?.status).toBe("scheduled");
		expect(invalidate).toHaveBeenCalledWith({ queryKey: sessionKeys.lists() });

		const list = await listSessions({ status: "scheduled" });
		expect(list.data.map((session) => session.title)).toContain("Morning Shooting Block");
	});

	it("leaves the pending state when a failed create settles", async () => {
		const queryClient = new QueryClient({
			defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
		});
		const wrapper = ({ children }: { children: ReactNode }) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);

		const { result } = renderHook(() => useCreateSessionMutation(), { wrapper });

		await act(async () => {
			await result.current
				.mutateAsync({ title: "ab", startsAtLocal: "2027-03-14T18:30" })
				.catch(() => undefined);
		});

		expect(result.current.isPending).toBe(false);
		expect(result.current.isError).toBe(true);
	});
});
