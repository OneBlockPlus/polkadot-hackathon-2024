import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../layouts";
import ConnectWallet from "../pages/connectWallet";
import Info from "../pages/info";
import Transfer from "../pages/transfer";
import NoMatch from "../pages/noMatch";

export const Router = () => {
	return (
		<BrowserRouter>
			<Suspense fallback={"loading..."}>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route path="/" index element={<ConnectWallet />} />
						<Route path="/info" element={<Info />} />
						<Route path="/transfer" element={<Transfer />} />
						<Route path="*" element={<NoMatch />} />
					</Route>
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
};
