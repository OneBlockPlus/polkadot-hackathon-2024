import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useSnapshot } from "valtio";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { appStore } from "@/stores/app";

export default () => {
	const appStates = useSnapshot(appStore.states);

	const navigate = useNavigate();
	const tonWallet = useTonWallet();
	const [tonConnectUI] = useTonConnectUI();

	useEffect(() => {
		if (appStates.connectStatus === 0) {
			tonConnectUI.disconnect();
			navigate("/");
		}
	}, [tonConnectUI, tonWallet, appStates]);

	return (
		<>
			<Outlet />
		</>
	);
};
