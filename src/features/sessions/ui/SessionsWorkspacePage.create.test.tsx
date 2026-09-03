import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { delay, HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CREATE_ERROR_BODY, resetSessionsDb, server } from "@/test/msw";
import { renderApp } from "@/test/render-app";

function futureLocalDateTimeValue(offsetMs = 24 * 60 * 60 * 1000): string {
	const date = new Date(Date.now() + offsetMs);
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
		date.getHours(),
	)}:${pad(date.getMinutes())}`;
}

function fillStartsAt(value: string) {
	fireEvent.change(screen.getByLabelText("Start date and time"), { target: { value } });
}

beforeEach(() => {
	resetSessionsDb();
});

afterEach(() => {
	server.events.removeAllListeners();
});

describe("create session form", () => {
	it("renders the inputs only after the open control is activated", async () => {
		const user = userEvent.setup();
		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });

		expect(screen.queryByLabelText("Title")).toBeNull();
		expect(screen.queryByLabelText("Start date and time")).toBeNull();

		await user.click(screen.getByRole("button", { name: "New session" }));

		expect(screen.getByLabelText("Title")).toBeInTheDocument();
		expect(screen.getByLabelText("Start date and time")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Create session" })).toBeInTheDocument();
	});

	it("blocks submission and explains the title rule without sending a request", async () => {
		const user = userEvent.setup();
		const posts: string[] = [];
		server.events.on("request:start", ({ request }) => {
			if (request.method === "POST") {
				posts.push(request.url);
			}
		});

		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });
		await user.click(screen.getByRole("button", { name: "New session" }));

		await user.type(screen.getByLabelText("Title"), "  ab  ");
		fillStartsAt(futureLocalDateTimeValue());
		await user.click(screen.getByRole("button", { name: "Create session" }));

		expect(screen.getByText("Enter a title between 3 and 80 characters.")).toBeInTheDocument();
		expect(posts).toHaveLength(0);

		await user.type(screen.getByLabelText("Title"), "c");

		expect(screen.queryByText("Enter a title between 3 and 80 characters.")).toBeNull();
	});

	it("blocks submission for a missing and for a past start date and time", async () => {
		const user = userEvent.setup();
		const posts: string[] = [];
		server.events.on("request:start", ({ request }) => {
			if (request.method === "POST") {
				posts.push(request.url);
			}
		});

		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });
		await user.click(screen.getByRole("button", { name: "New session" }));
		await user.type(screen.getByLabelText("Title"), "Morning Shooting Block");

		await user.click(screen.getByRole("button", { name: "Create session" }));
		expect(screen.getByText("Enter a start date and time.")).toBeInTheDocument();

		fillStartsAt("2020-01-01T09:00");
		await user.click(screen.getByRole("button", { name: "Create session" }));
		expect(
			screen.getByText("The start date and time must be in the future."),
		).toBeInTheDocument();

		expect(posts).toHaveLength(0);
	});

	it("creates a session, keeps the active filter, and shows the trimmed title in the list", async () => {
		const user = userEvent.setup();
		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });

		await user.selectOptions(screen.getByLabelText("Status"), "scheduled");
		await screen.findByRole("heading", { name: "Private Footwork Review" });

		await user.click(screen.getByRole("button", { name: "New session" }));
		await user.type(screen.getByLabelText("Title"), "  Morning Shooting Block  ");
		fillStartsAt(futureLocalDateTimeValue());
		await user.click(screen.getByRole("button", { name: "Create session" }));

		expect(
			await screen.findByRole("heading", { name: "Morning Shooting Block" }),
		).toBeInTheDocument();
		expect(screen.queryByLabelText("Title")).toBeNull();
		expect(screen.getByLabelText("Status")).toHaveValue("scheduled");
		expect(screen.getAllByRole("listitem")).toHaveLength(3);
	});

	it("sends exactly one POST when submit is activated twice and re-enables it on settle", async () => {
		const user = userEvent.setup();
		let postCount = 0;
		server.use(
			http.post("/api/sessions", async () => {
				postCount += 1;
				await delay(120);
				return HttpResponse.json(CREATE_ERROR_BODY, { status: 500 });
			}),
		);

		renderApp("/sessions");
		await screen.findByRole("heading", { name: "U14 Shooting Lab" });
		await user.click(screen.getByRole("button", { name: "New session" }));
		await user.type(screen.getByLabelText("Title"), "Morning Shooting Block");
		fillStartsAt(futureLocalDateTimeValue());

		await user.click(screen.getByRole("button", { name: "Create session" }));

		const pending = await screen.findByRole("button", { name: "Creating…" });
		expect(pending).toBeDisabled();
		await user.click(pending);

		await waitFor(() =>
			expect(screen.getByRole("button", { name: "Create session" })).toBeEnabled(),
		);
		expect(postCount).toBe(1);
		expect(screen.getByLabelText("Title")).toHaveValue("Morning Shooting Block");
	});
});
