import React from 'react';
import AppRouter from './routes/routes';
import { AuthProvider } from './context/AuthContext';
import { ErrorProvider } from './context/ErrorContext';
import { WalletProvider } from './context/WalletContext';
import { SuccessProvider } from './context/SuccessContext';
import { DataProvider } from './context/DataContext';
import { LoadingProvider } from './context/LoadingContext';
import SignInModal from './components/modals/SignInModal';
import SignUpModal from './components/modals/SignUpModal';
import ErrorModal from './components/modals/ErrorModal';
import SuccessModal from './components/modals/SuccessModal';
import FullScreenLoader from './components/loaders/FullScreenLoader';
import { Amplify } from 'aws-amplify';
import config from './amplifyconfiguration.json';
import DataModal from './components/modals/DataModal';
Amplify.configure(config);

function App() {
  return (
    <AuthProvider>
      <ErrorProvider>
        <SuccessProvider>
          <DataProvider>
            <LoadingProvider>
              <WalletProvider>
                <AppRouter />
                <SignUpModal />
                <SignInModal />
                <ErrorModal />
                <SuccessModal />
                <FullScreenLoader />
                <DataModal />
              </WalletProvider>
            </LoadingProvider>
          </DataProvider>
        </SuccessProvider>
      </ErrorProvider>
    </AuthProvider>
  );
}

export default App;
