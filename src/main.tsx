import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import "./index.css";

async function bootstrap(): Promise<void> {
	if (import.meta.env.DEV) {
		const { startMockWorker } = await import("@/mocks/browser");
		await startMockWorker();
	}

	const container = document.getElementById("root");
	if (!container) {
		throw new Error("Root container #root was not found.");
	}

	createRoot(container).render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
}

void bootstrap();
