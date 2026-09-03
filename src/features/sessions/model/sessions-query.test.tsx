import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { LIST_ERROR_BODY, resetSessionsDb, server } from "@/test/msw";
import { sessionKeys, useSessionsQuery } from "./sessions-query";

function createWrapper(retry: number | false = false) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry } } });
	return function Wrapper({ children }: { children: ReactNode }) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
	};
}

beforeEach(() => {
	resetSessionsDb();
});

describe("sessionKeys", () => {
	it("nests every list key under one invalidatable prefix", () => {
		expect(sessionKeys.lists()).toEqual(["sessions", "list"]);
		expect(sessionKeys.list({ status: "scheduled" })).toEqual([
			"sessions",
			"list",
			{ status: "scheduled" },
		]);
	});
});

describe("useSessionsQuery", () => {
	it("loads every session when no status is selected", async () => {
		const { result } = renderHook(() => useSessionsQuery(undefined), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.data).toHaveLength(5);
	});

	it("loads only scheduled sessions when the filter is active", async () => {
		const { result } = renderHook(() => useSessionsQuery("scheduled"), {
			wrapper: createWrapper(),
		});

		await waitFor(() => expect(result.current.isSuccess).toBe(true));
		expect(result.current.data?.data.map((session) => session.title)).toEqual([
			"U14 Shooting Lab",
			"Private Footwork Review",
		]);
	});

	it("surfaces the first failure without retrying, even under a retrying client", async () => {
		server.use(
			http.get("/api/sessions", () => HttpResponse.json(LIST_ERROR_BODY, { status: 500 }), {
				once: true,
			}),
		);

		const { result } = renderHook(() => useSessionsQuery(undefined), {
			wrapper: createWrapper(3),
		});

		await waitFor(() => expect(result.current.isError).toBe(true));
	});
});
