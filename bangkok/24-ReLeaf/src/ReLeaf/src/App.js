import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React, {useEffect} from 'react';
import {StatusBar} from 'react-native';
import DepositWallet from './screens/depositWallet/depositWallet';
import Lock from './screens/lock/lock';
import Main from './screens/main/main';
import Setup from './screens/setup/setup';
import SplashLoading from './screens/splashLoading/splashLoading';
import AppStateListener from './utils/appStateListener';
import {ContextProvider} from './utils/contextModule';
import SendWallet from './screens/sendWallet/sendWallet';
import SwapWallet from './screens/swapWallet/swapWallet';
import PaymentWallet from './screens/paymentWallet/paymentWallet';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {}, []);
  return (
    <ContextProvider>
      <NavigationContainer>
        <AppStateListener />
        <StatusBar barStyle="light-content" />
        <Stack.Navigator
          initialRouteName="SplashLoading"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="SplashLoading" component={SplashLoading} />
          {
            // Setup
          }
          <Stack.Screen name="Setup" component={Setup} />
          {
            // Lock
          }
          <Stack.Screen name="Lock" component={Lock} />
          {
            // Main
          }
          <Stack.Screen name="Main" component={Main} />
          {
            // Wallet Screens
          }
          <Stack.Screen name="DepositWallet" component={DepositWallet} />
          <Stack.Screen name="SendWallet" component={SendWallet} />
          <Stack.Screen name="SwapWallet" component={SwapWallet} />
          <Stack.Screen name="PaymentWallet" component={PaymentWallet} />
        </Stack.Navigator>
      </NavigationContainer>
    </ContextProvider>
  );
}
