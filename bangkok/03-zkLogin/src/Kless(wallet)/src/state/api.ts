import { ApiPromise } from "@polkadot/api";
import { useAppStore } from "./store";

export const useApi = () => {
  return useAppStore((state) => state.api);
};

export const useSetApi = () => {
  return useAppStore((state) => state.setApi);
};

export const getApi = async () => {
  console.log("getApi");
  const api = useAppStore.getState().api;
  console.log("getApi2");
  if (!api) {
    const api = await ApiPromise.create();
    console.log("creat api");
    const setApi = useAppStore.getState().setApi;
    setApi(api);
  }
  console.log("getApi3",  useAppStore.getState().api);
  return useAppStore.getState().api!;
};
