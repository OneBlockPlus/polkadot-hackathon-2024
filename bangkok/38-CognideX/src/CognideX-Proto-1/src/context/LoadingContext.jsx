import React, { createContext, useState, useContext } from 'react';


// Create the LoadingContext
const LoadingContext = createContext();

// LoadingProvider component that will wrap your app and provide context
export const LoadingProvider = ({ children }) => {
    const [loadingModalOpen, setLoadingModalOpen] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState({
        loadingHeader: '',
        loadingMessage: ''
    })

    const openLoadingModal = ({ loadingHeader, loadingMessage }) => {
        setLoadingMessage({
            loadingHeader: loadingHeader,
            loadingMessage: loadingMessage
        });
        setLoadingModalOpen(true);
    }

    const closeLoadingModal = () => {
        setLoadingMessage({
            loadingHeader: '',
            loadingMessage: ''
        });
        setLoadingModalOpen(false);
    }

    return (
        <LoadingContext.Provider value={{ loadingMessage, setLoadingMessage, loadingModalOpen, openLoadingModal, closeLoadingModal }}>
            {children}
        </LoadingContext.Provider>
    );
};

// Custom hook to use the LoadingContext
export const useLoading = () => {
    return useContext(LoadingContext);
};

export default LoadingContext;
