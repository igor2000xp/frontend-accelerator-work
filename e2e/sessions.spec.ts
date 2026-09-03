import { expect, test } from "@playwright/test";

test.describe("Training Sessions Workspace", () => {
	test("allows viewing, filtering, and creating training sessions", async ({ page }) => {
		// 1. Open root path and verify redirect to /sessions
		await page.goto("/");
		await expect(page).toHaveURL(/\/sessions/);

		// 2. Verify sessions list renders loaded sessions
		await expect(
			page.getByRole("heading", { level: 1, name: "Training Sessions Workspace" }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { level: 2, name: "Training sessions" }),
		).toBeVisible();
		await expect(page.getByText("U14 Shooting Lab")).toBeVisible();
		await expect(page.getByText("Varsity Defense Intensive")).toBeVisible();

		// 3. Filter sessions by 'Scheduled' status
		await page.getByLabel("Status").selectOption("scheduled");
		await expect(page.getByText("U14 Shooting Lab")).toBeVisible();
		await expect(page.getByText("Private Footwork Review")).toBeVisible();
		await expect(page.getByText("Varsity Defense Intensive")).not.toBeVisible();

		// Reset filter to All
		await page.getByLabel("Status").selectOption("all");
		await expect(page.getByText("Varsity Defense Intensive")).toBeVisible();

		// 4. Open create session form
		await page.getByRole("button", { name: "New session" }).click();
		await expect(
			page.getByRole("heading", { level: 3, name: "Create a session" }),
		).toBeVisible();

		// 5. Fill out the form with valid future date and submit
		await page.getByLabel("Title").fill("Elite Dribbling Clinic");
		await page.getByLabel("Start date and time").fill("2028-10-15T14:30");
		await page.getByRole("button", { name: "Create session" }).click();

		// 6. Form closes and newly created session is visible in list
		await expect(
			page.getByRole("heading", { level: 3, name: "Create a session" }),
		).not.toBeVisible();
		await expect(page.getByText("Elite Dribbling Clinic")).toBeVisible();
	});
});
