import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/shared/i18n";

export function createQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: 1, refetchOnWindowFocus: false },
		},
	});
}

type AppProvidersProps = {
	children: ReactNode;
	queryClient?: QueryClient;
};

export function AppProviders({ children, queryClient }: AppProvidersProps) {
	const client = queryClient ?? createQueryClient();

	return (
		<I18nextProvider i18n={i18n}>
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		</I18nextProvider>
	);
}
