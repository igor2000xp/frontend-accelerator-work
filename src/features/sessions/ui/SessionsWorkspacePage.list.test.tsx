import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LIST_ERROR_BODY, resetSessionsDb, server } from "@/test/msw";
import { renderApp } from "@/test/render-app";
import { formatSessionStart } from "../model/date-time";

const EMPTY_LIST = { data: [], meta: { page: 1, pageSize: 10, total: 0 } };

beforeEach(() => {
	resetSessionsDb();
});

afterEach(() => {
	server.events.removeAllListeners();
});

describe("sessions workspace list", () => {
	it("issues exactly one list request and renders one row per session", async () => {
		const requests: string[] = [];
		server.events.on("request:start", ({ request }) => {
			requests.push(`${request.method} ${new URL(request.url).pathname}`);
		});

		renderApp("/sessions");

		expect(
			await screen.findByRole("heading", { name: "U14 Shooting Lab" }),
		).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(5);
		expect(requests.filter((entry) => entry === "GET /api/sessions")).toHaveLength(1);
	});

	it("shows the status as a text label and the start time in local time", async () => {
		renderApp("/sessions");

		const heading = await screen.findByRole("heading", { name: "U14 Shooting Lab" });
		const row = heading.closest("li");
		expect(row).not.toBeNull();
		if (!row) {
			return;
		}

		expect(within(row).getByText("Scheduled")).toBeInTheDocument();
		expect(
			within(row).getByText(formatSessionStart("2027-08-03T16:00:00Z", { locale: "en" })),
		).toBeInTheDocument();
	});

	it("shows the loading state and no rows while the request is pending", async () => {
		server.use(
			http.get("/api/sessions", async () => {
				await delay(80);
				return HttpResponse.json(EMPTY_LIST);
			}),
		);

		renderApp("/sessions");

		expect(screen.getByText("Loading sessions…")).toBeInTheDocument();
		expect(screen.queryAllByRole("listitem")).toHaveLength(0);
		expect(await screen.findByText("No training sessions yet.")).toBeInTheDocument();
	});

	it("shows the translated empty message and no error for an empty response", async () => {
		server.use(http.get("/api/sessions", () => HttpResponse.json(EMPTY_LIST)));

		renderApp("/sessions");

		expect(await screen.findByText("No training sessions yet.")).toBeInTheDocument();
		expect(screen.queryByRole("alert")).toBeNull();
	});

	it("shows a translated, recoverable error state and recovers on retry", async () => {
		const user = userEvent.setup();
		server.use(
			http.get("/api/sessions", () => HttpResponse.json(LIST_ERROR_BODY, { status: 500 }), {
				once: true,
			}),
		);

		renderApp("/sessions");

		expect(
			await screen.findByText("Training sessions could not be loaded."),
		).toBeInTheDocument();
		expect(screen.queryByText(/500/)).toBeNull();
		expect(screen.queryByText(/SESSIONS_UNAVAILABLE/)).toBeNull();

		await user.click(screen.getByRole("button", { name: "Try again" }));

		expect(
			await screen.findByRole("heading", { name: "U14 Shooting Lab" }),
		).toBeInTheDocument();
		await waitFor(() =>
			expect(screen.queryByText("Training sessions could not be loaded.")).toBeNull(),
		);
	});

	it("honours a status already present in the page URL", async () => {
		renderApp("/sessions?status=scheduled");

		expect(
			await screen.findByRole("heading", { name: "U14 Shooting Lab" }),
		).toBeInTheDocument();
		expect(screen.getAllByRole("listitem")).toHaveLength(2);
	});

	it("redirects the index route to the workspace", async () => {
		renderApp("/");

		expect(
			await screen.findByRole("heading", { name: "Training sessions" }),
		).toBeInTheDocument();
	});
});
