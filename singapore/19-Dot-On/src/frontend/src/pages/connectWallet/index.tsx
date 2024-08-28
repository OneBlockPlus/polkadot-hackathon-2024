import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";
import { Title } from "@/components";
import { useInterval } from "@/hooks";
import { appStore } from "@/stores/app";
import { postGeneratePayload, postCheckProof } from "@/http";
import styles from "./index.module.less";

const refreshIntervalMs = 9 * 60 * 1000;

export default () => {
	const firstProofLoading = useRef<boolean>(true);
	const navigate = useNavigate();
	const [tonConnectUI] = useTonConnectUI();
	const [authorized, setAuthorized] = useState(false);

	const recreateProofPayload = useCallback(async () => {
		if (firstProofLoading.current) {
			tonConnectUI.setConnectRequestParameters({ state: "loading" });
			firstProofLoading.current = false;
		}

		const payload = await postGeneratePayload();

		if (payload) {
			tonConnectUI.setConnectRequestParameters({ state: "ready", value: payload as any });
		} else {
			tonConnectUI.setConnectRequestParameters(null);
		}
	}, [tonConnectUI, firstProofLoading]);

	if (firstProofLoading.current) {
		recreateProofPayload();
	}

	useInterval(recreateProofPayload, refreshIntervalMs);

	useEffect(() => {
		tonConnectUI.onStatusChange(async (w) => {
			if (!w) {
				appStore.actions.setConnectStatus(0);
				setAuthorized(false);
				return;
			}

			if (w.connectItems?.tonProof && "proof" in w.connectItems.tonProof) {
				const data = {
					address: w.account.address,
					network: w.account.chain,
					public_key: w.account.publicKey,
					proof: {
						...w.connectItems?.tonProof.proof,
						state_init: w.account.walletStateInit,
					},
				};

				await postCheckProof(data);
			}

			setAuthorized(true);
		});
	}, [tonConnectUI]);

	useEffect(() => {
		if (authorized) {
			appStore.actions.setConnectStatus(2);
			navigate("/info");
		}
	}, [authorized]);

	return (
		<div className={styles.wallet}>
			<Title title="Connect Wallet" />

			<span onClick={() => appStore.actions.setConnectStatus(1)}>
				<TonConnectButton className={styles.btn} />
			</span>
		</div>
	);
};
