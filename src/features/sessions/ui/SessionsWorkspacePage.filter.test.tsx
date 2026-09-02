import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { resetSessionsDb } from "@/test/msw";
import { renderApp } from "@/test/render-app";

beforeEach(() => {
	resetSessionsDb();
});

describe("sessions status filter", () => {
	it("offers exactly All and Scheduled, with All selected initially", async () => {
		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });

		const select = screen.getByLabelText("Status");
		expect(select).toHaveValue("all");
		expect(
			within(select)
				.getAllByRole("option")
				.map((option) => option.textContent),
		).toEqual(["All", "Scheduled"]);
		expect(screen.getAllByRole("listitem")).toHaveLength(5);
	});

	it("shows only scheduled sessions for the status filter and restores the full list for All", async () => {
		const user = userEvent.setup();
		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });

		await user.selectOptions(screen.getByLabelText("Status"), "scheduled");

		expect(
			await screen.findByRole("heading", { name: "Private Footwork Review" }),
		).toBeInTheDocument();
		await waitFor(() =>
			expect(screen.queryByRole("heading", { name: "Varsity Defense Intensive" })).toBeNull(),
		);
		expect(screen.queryByRole("heading", { name: "Weekend Ball Handling" })).toBeNull();
		expect(screen.queryByRole("heading", { name: "U12 Team Fundamentals" })).toBeNull();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);

		await user.selectOptions(screen.getByLabelText("Status"), "all");

		expect(
			await screen.findByRole("heading", { name: "Varsity Defense Intensive" }),
		).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(5);
	});

	it("keeps unrelated page-URL parameters when the filter changes", async () => {
		const user = userEvent.setup();
		renderApp("/sessions?mock=normal");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });

		await user.selectOptions(screen.getByLabelText("Status"), "scheduled");

		expect(
			await screen.findByRole("heading", { name: "Private Footwork Review" }),
		).toBeInTheDocument();
		expect(window.location.search).toBe("");
		expect(screen.getByLabelText("Status")).toHaveValue("scheduled");
	});
});
