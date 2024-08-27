import { useLocation, useNavigate } from "react-router";
import { Tabbar } from "react-vant";

export const TabBar = () => {
	const location = useLocation();
	const navigate = useNavigate();

	const onChange = (path: string) => {
		navigate(path);
	};

	return (
		<Tabbar value={location.pathname} onChange={(v) => onChange(v as string)}>
			<Tabbar.Item name="/info">Info</Tabbar.Item>
			<Tabbar.Item name="/transfer">Transfer</Tabbar.Item>
		</Tabbar>
	);
};
