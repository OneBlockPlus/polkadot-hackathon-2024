import React, { createContext, useState, useContext } from 'react';

// Create the SuccessContext
const SuccessContext = createContext();

// SuccessProvider component that will wrap your app and provide context
export const SuccessProvider = ({ children }) => {
    const [successModalOpen, setSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState({
        successHeader: '',
        successMessage: ''
    });

    const openSuccessModal = ({ successHeader, successMessage }) => {
        setSuccessMessage({
            successHeader: successHeader,
            successMessage: successMessage
        });
        setSuccessModalOpen(true);
    };

    const closeSuccessModal = () => {
        setSuccessMessage({
            successHeader: '',
            successMessage: ''
        });
        setSuccessModalOpen(false);
    };

    return (
        <SuccessContext.Provider value={{ successMessage, successModalOpen, openSuccessModal, closeSuccessModal }}>
            {children}
        </SuccessContext.Provider>
    );
};

// Custom hook to use the SuccessContext
export const useSuccess = () => {
    return useContext(SuccessContext);
};

export default SuccessContext;
