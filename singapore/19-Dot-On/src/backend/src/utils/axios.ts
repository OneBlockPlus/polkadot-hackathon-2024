import axios from "axios";

export const http = axios.create({
	baseURL: import.meta.env.VITE_SERVICE,
});

http.interceptors.response.use((res) => {
	return res.data;
});
