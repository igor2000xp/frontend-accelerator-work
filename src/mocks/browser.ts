import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

/** Start the mock boundary in development only. */
export async function startMockWorker(): Promise<void> {
	await worker.start({
		onUnhandledRequest: "bypass",
		serviceWorker: { url: "/mockServiceWorker.js" },
	});
}
