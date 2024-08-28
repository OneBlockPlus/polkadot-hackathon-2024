import React, { Dispatch, SetStateAction, createContext, useContext, useState } from 'react';
import { ApiCommunity } from '../data-model/api-community';

// Create the context
export const EnvironmentContext = createContext({} as { setCurrency: Dispatch<SetStateAction<string>>; getCurrency: () => string; isServer: () => boolean; getCommunityBranding: () => ApiCommunity; setCommunityBranding; isSubdomain: () => boolean });

// Provider component
export const EnvironmentProvider = ({ children }) => {
  const [currency, setCurrency] = useState('');
  const [communityBranding, setCommunityBranding] = useState<ApiCommunity>(null);

  const getCurrency = () => {
    return currency;
  };

  const getCommunityBranding = () => {
    return communityBranding;
  };

  const isServer = () => typeof window === 'undefined';

  const isSubdomain = () => !!communityBranding;

  return <EnvironmentContext.Provider value={{ setCurrency, getCurrency, isServer, getCommunityBranding, setCommunityBranding, isSubdomain }}>{children}</EnvironmentContext.Provider>;
};

const useEnvironment = () => {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
};

export default useEnvironment;
