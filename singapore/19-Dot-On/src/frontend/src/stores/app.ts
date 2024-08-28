import { proxy } from "valtio";

type AppState = {
	connectStatus: number;
	balance: number;
};

const getStates = () => {
	const config: AppState = {
		connectStatus: 0,
		balance: 100,
	};

	return proxy<AppState>(config);
};
const states = getStates();

export const appStore = {
	states,
	actions: {
		setConnectStatus: (n: number) => {
			states.connectStatus = n;
		},

		setBalance: (n: number) => {
			states.balance = n;
		},
	},
};
