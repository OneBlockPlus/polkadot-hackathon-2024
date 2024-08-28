import { Cell } from "react-vant";
import { useSnapshot } from "valtio";
import { useTonAddress } from "@tonconnect/ui-react";
import { TabBar } from "@/components";
import { appStore } from "@/stores/app";
import styles from "./index.module.less";

export default () => {
	const appStates = useSnapshot(appStore.states);
	const address = useTonAddress();

	return (
		<div className={styles.queryBalance}>
			<Cell.Group>
				<Cell title="Ton Address" label={address} />
				<Cell title="EVM Vault Address" label="0x4CC8a90840e2237ac86e13A25733E5d548F55fd9" />
				<Cell title="Balance" label={appStates.balance} />
			</Cell.Group>
			<TabBar />
		</div>
	);
};
