
import { Client } from "../client/client";
import React from "react";


const defaultValue = {
    client: new Client(),
}
export const ClientContext = React.createContext<{ client : Client}>(defaultValue);

export function ClientProvider({ children }: { children: React.ReactNode }) {
    const client = new Client();
    return (
        <ClientContext.Provider value={{client: client}}>
            {children}
        </ClientContext.Provider>
    )
}

export const useClient = () => React.useContext(ClientContext);
