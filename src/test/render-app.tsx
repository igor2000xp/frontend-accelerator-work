import { QueryClient } from "@tanstack/react-query";
import { type RenderResult, render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { AppProviders } from "@/app/providers";
import { routes } from "@/app/router";

/** Renders the real routed application with a non-retrying query client. Test-only. */
export function renderApp(initialEntry = "/sessions"): RenderResult & { queryClient: QueryClient } {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
	});
	const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });

	return {
		queryClient,
		...render(
			<AppProviders queryClient={queryClient}>
				<RouterProvider router={router} />
			</AppProviders>,
		),
	};
}
