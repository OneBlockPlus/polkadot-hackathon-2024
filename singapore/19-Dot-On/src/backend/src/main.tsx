import { createRoot } from "react-dom/client";
import { THEME, TonConnectUIProvider } from "@tonconnect/ui-react";
import { SDKProvider } from "@telegram-apps/sdk-react";
import { Toast } from "@/components";
import { TonProvider } from "./provider/tonconnect";
import { ConfigProvider } from "react-vant";
import { Router } from "./router";
import "amfe-flexible";
import "normalize.css";
import "./styles/index.less";

createRoot(document.getElementById("root")!).render(
	<SDKProvider acceptCustomStyles debug>
		<TonProvider>
			<ConfigProvider>
				<Router />
				<Toast />
			</ConfigProvider>
		</TonProvider>
	</SDKProvider>
);
