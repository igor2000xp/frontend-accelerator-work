import { useTranslation } from "react-i18next";
import { Outlet } from "react-router";

export function AppLayout() {
	const { t } = useTranslation();

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<header className="border-b border-slate-200 bg-white">
				<div className="mx-auto max-w-5xl px-4 py-6">
					<h1 className="text-xl font-semibold">{t("app.title")}</h1>
					<p className="text-sm text-slate-600">{t("app.tagline")}</p>
				</div>
			</header>
			<main className="mx-auto max-w-5xl px-4 py-8">
				<Outlet />
			</main>
		</div>
	);
}
