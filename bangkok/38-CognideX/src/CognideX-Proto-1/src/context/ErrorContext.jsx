import React, { createContext, useState, useContext } from 'react';


// Create the ErrorContext
const ErrorContext = createContext();

// ErrorProvider component that will wrap your app and provide context
export const ErrorProvider = ({ children }) => {
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState({
        errorHeader: '',
        errorMessage: ''
    })

    const openErrorModal = ({ errorHeader, errorMessage }) => {
        setErrorMessage({
            errorHeader: errorHeader,
            errorMessage: errorMessage
        });
        setErrorModalOpen(true);
    }

    const closeErrorModal = () => {
        setErrorMessage({
            errorHeader: '',
            errorMessage: ''
        });
        setErrorModalOpen(false);
    }

    return (
        <ErrorContext.Provider value={{ errorMessage, errorModalOpen, openErrorModal, closeErrorModal }}>
            {children}
        </ErrorContext.Provider>
    );
};

// Custom hook to use the ErrorContext
export const useError = () => {
    return useContext(ErrorContext);
};

export default ErrorContext;
