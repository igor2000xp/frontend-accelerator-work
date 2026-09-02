import { createBrowserRouter, type RouteObject } from "react-router";
import { AppLayout } from "./AppLayout";

export const routes: RouteObject[] = [
	{
		path: "/",
		element: <AppLayout />,
		children: [
			// Feature routes are registered here.
			{ index: true, element: null },
		],
	},
];

export const router = createBrowserRouter(routes);
