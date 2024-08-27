import { useMemo } from "react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import type { ReactNode } from "react";

export const TonProvider = (props: { children: ReactNode }) => {
	const twaReturnUrl = import.meta.env.VITE_BOT_LINK;
	const manifestUrl = useMemo(() => {
		return new URL("tonconnect-manifest.json", window.location.href).toString();
	}, []);

	return (
		<TonConnectUIProvider manifestUrl={manifestUrl} actionsConfiguration={{ twaReturnUrl }}>
			{props.children}
		</TonConnectUIProvider>
	);
};
