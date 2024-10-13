import {useState} from "react";
import apps, {CkbApp} from "@/serves/useApps/apps";


export default function useApps() {
    const [data, setData] = useState<CkbApp[]>(apps)

    return {data}
}
