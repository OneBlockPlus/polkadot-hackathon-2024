import { http } from "../utils/axios";

export const postGeneratePayload = () => http.post("/api/generatePayload");

export const postCheckProof = (data: any) => http.post("/api/checkProof", data);

export const getInfo = (data: any) => http.post("/api/getInfo", data);
