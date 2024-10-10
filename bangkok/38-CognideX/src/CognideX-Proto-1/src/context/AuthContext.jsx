import React, { createContext, useState, useContext } from 'react';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component that will wrap your app and provide context
export const AuthProvider = ({ children }) => {
    const [signinModalOpen, setSigninModalOpen] = useState(false);
    const [signupModalOpen, setSignupModalOpen] = useState(false);


    const openSigninModal = () => {
        setSigninModalOpen(true);
    }

    const closeSigninModal = () => {
        setSigninModalOpen(false);
    }

    const openSignupModal = () => {
        setSignupModalOpen(true);
    }

    const closeSignupModal = () => {
        setSignupModalOpen(false);
    }

    return (
        <AuthContext.Provider value={{ signinModalOpen, signupModalOpen, openSigninModal, closeSigninModal, openSignupModal, closeSignupModal }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;
