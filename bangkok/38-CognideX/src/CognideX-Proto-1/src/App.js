import React from 'react';
import AppRouter from './routes/routes';
import { AuthProvider } from './context/AuthContext';
import SignUpModal from './components/modals/SignUpModal';
import { Amplify } from 'aws-amplify';
import config from './amplifyconfiguration.json';
import SignInModal from './components/modals/SignInModal';
Amplify.configure(config);

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <SignUpModal />
      <SignInModal />
    </AuthProvider>
  );
}

export default App;
