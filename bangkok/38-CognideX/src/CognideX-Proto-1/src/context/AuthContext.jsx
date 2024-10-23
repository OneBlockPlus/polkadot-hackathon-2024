import React, { createContext, useState, useContext, useEffect } from 'react';

import { getCurrentUser } from 'aws-amplify/auth';

// Create the AuthContext
const AuthContext = createContext();

// AuthProvider component that will wrap your app and provide context
export const AuthProvider = ({ children }) => {
    const [signinModalOpen, setSigninModalOpen] = useState(false);
    const [signupModalOpen, setSignupModalOpen] = useState(false);
    const [user, setUser] = useState(null);

    const checkUserAuth = async () => {
        try {
            const user = await getCurrentUser();
            if (user) {
                setUser(user);
            } else {
                return
            }
        } catch (error) {
            return
        }
    }

    useEffect(() => {
        checkUserAuth();
    }, []);

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
        <AuthContext.Provider value={{ user, signinModalOpen, signupModalOpen, openSigninModal, closeSigninModal, openSignupModal, closeSignupModal, checkUserAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;
