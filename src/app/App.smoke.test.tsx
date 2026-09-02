import { QueryClient } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { AppProviders } from "./providers";
import { routes } from "./router";

describe("application shell", () => {
	it("redirects the root route to the sessions workspace inside the layout", async () => {
		const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
		const router = createMemoryRouter(routes, { initialEntries: ["/"] });

		render(
			<AppProviders queryClient={queryClient}>
				<RouterProvider router={router} />
			</AppProviders>,
		);

		expect(
			await screen.findByRole("heading", { name: "Training Sessions Workspace" }),
		).toBeInTheDocument();
		expect(
			await screen.findByRole("heading", { name: "Training sessions" }),
		).toBeInTheDocument();
	});
});
