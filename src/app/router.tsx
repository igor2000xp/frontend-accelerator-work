import { createBrowserRouter, type RouteObject, redirect } from "react-router";
import { SessionsWorkspacePage } from "@/features/sessions";
import { AppLayout } from "./AppLayout";

export const routes: RouteObject[] = [
	{
		path: "/",
		element: <AppLayout />,
		children: [
			// Feature routes are registered here.
			{ index: true, loader: () => redirect("/sessions") },
			{ path: "sessions", element: <SessionsWorkspacePage /> },
		],
	},
];

export const router = createBrowserRouter(routes);
