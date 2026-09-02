import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import { AppProviders } from "./providers";
import { routes } from "./router";

describe("application shell", () => {
	it("renders the layout heading at the root route", async () => {
		const router = createMemoryRouter(routes, { initialEntries: ["/"] });

		render(
			<AppProviders>
				<RouterProvider router={router} />
			</AppProviders>,
		);

		expect(
			await screen.findByRole("heading", { name: "Training Sessions Workspace" }),
		).toBeInTheDocument();
	});
});
