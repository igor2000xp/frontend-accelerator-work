import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import type { SessionStatus } from "@/services/api/endpoints/sessions.types";
import { CreateSessionForm } from "./CreateSessionForm";
import { SessionsListSection } from "./SessionsListSection";
import { FILTER_STATUS, StatusFilter } from "./StatusFilter";

export function SessionsWorkspacePage() {
	const { t } = useTranslation("sessions");
	const [searchParams, setSearchParams] = useSearchParams();
	const [isFormOpen, setIsFormOpen] = useState(false);

	const status: SessionStatus | undefined =
		searchParams.get("status") === FILTER_STATUS ? FILTER_STATUS : undefined;

	function handleStatusChange(next: SessionStatus | undefined) {
		setSearchParams(
			(previous) => {
				// Copy, so an unrelated parameter such as the mock scenario switch survives.
				const params = new URLSearchParams(previous);
				if (next) {
					params.set("status", next);
				} else {
					params.delete("status");
				}
				return params;
			},
			{ replace: true },
		);
	}

	return (
		<section className="flex flex-col gap-6">
			<header className="flex flex-wrap items-center justify-between gap-4">
				<h2 className="text-lg font-semibold">{t("list.heading")}</h2>
				<div className="flex flex-wrap items-center gap-3">
					<StatusFilter value={status} onChange={handleStatusChange} />
					<button
						type="button"
						onClick={() => setIsFormOpen(true)}
						className="rounded border border-slate-300 bg-white px-3 py-1 text-sm"
					>
						{t("form.open")}
					</button>
				</div>
			</header>

			{isFormOpen ? <CreateSessionForm onCreated={() => setIsFormOpen(false)} /> : null}

			<SessionsListSection status={status} />
		</section>
	);
}
