// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DataContextProvider } from '@subwallet/extension-web-ui/contexts/DataContext';
import { InjectContextProvider } from '@subwallet/extension-web-ui/contexts/InjectContext';
import { ScannerContextProvider } from '@subwallet/extension-web-ui/contexts/ScannerContext';
import { ThemeProvider } from '@subwallet/extension-web-ui/contexts/ThemeContext';
import { ModalContextProvider } from '@subwallet/react-ui';
import NotificationProvider from '@subwallet/react-ui/es/notification/NotificationProvider';
import React from 'react';
import { RouterProvider } from 'react-router-dom';

import LoadingScreen from '../components/LoadingScreen';
import { ScreenContextProvider } from '../contexts/ScreenContext';
import { router } from './router';

export default function Popup (): React.ReactElement {
  return (
    <DataContextProvider>
      <ScreenContextProvider>
        <ThemeProvider>
          <ModalContextProvider>
            <ScannerContextProvider>
              <NotificationProvider>
                <InjectContextProvider>
                  <RouterProvider
                    fallbackElement={<LoadingScreen className='root-loading' />}
                    router={router}
                  />
                </InjectContextProvider>
              </NotificationProvider>
            </ScannerContextProvider>
          </ModalContextProvider>
        </ThemeProvider>
      </ScreenContextProvider>
    </DataContextProvider>
  );
}
