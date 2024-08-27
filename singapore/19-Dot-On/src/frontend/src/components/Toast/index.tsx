import { Toaster } from "react-hot-toast";

export const Toast = () => {
	const TimeOut = 1000 * 4;

	return (
		<Toaster
			position="top-center"
			reverseOrder={false}
			toastOptions={{
				className: "font-Inter",
				duration: TimeOut,
				style: {
					background: "#363636",
					color: "#fff",
					maxWidth: "640px",
				},
			}}
		/>
	);
};
