// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import WalletConnect from '@subwallet/extension-web-ui/components/Layout/parts/Header/parts/WalletConnect';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button, Icon, Typography } from '@subwallet/react-ui';
import CN from 'classnames';
import { CaretLeft } from 'phosphor-react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import SelectAccount from '../SelectAccount';
import LockStatus from './parts/LockStatus';
import Networks from './parts/Networks';

export type Props = ThemeProps & {
  title?: string | React.ReactNode;
  onBack?: () => void
  showBackButton?: boolean
}

function Component ({ className, onBack, showBackButton, title = '' }: Props): React.ReactElement<Props> {
  const backButton = useMemo(() => {
    if (showBackButton && onBack) {
      return (
        <Button
          icon={
            (
              <Icon
                phosphorIcon={CaretLeft}
                size={'lg'}
              />
            )
          }
          onClick={onBack}
          size={'xs'}
          type='ghost'
        />
      );
    }

    return null;
  }, [onBack, showBackButton]);

  return (
    <div className={CN(className)}>
      <div className='common-header'>
        <div className='title-group'>
          {backButton}
          <Typography.Title className='page-name'>{title}</Typography.Title>
        </div>
        <div className='action-group'>
          <WalletConnect />

          <Networks />

          <div className={'trigger-container -select-account'}>
            <SelectAccount />
          </div>

          <LockStatus />
        </div>
      </div>
    </div>
  );
}

const Controller = styled(Component)<Props>(({ theme: { token } }: Props) => ({
  width: '100%',

  '.common-header': {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: token.size,

    '.title-group': {
      display: 'flex',
      justifyContent: 'start',
      alignItems: 'center',

      '.page-name': {
        fontSize: 30,
        lineHeight: '38px',
        color: '#FFF',
        margin: 0
      }
    },

    '.action-group': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8
    },

    '.trigger-container': {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      padding: `0 ${token.padding}px`,
      height: 40,
      gap: 8,
      background: token.colorBgSecondary,
      borderRadius: 32
    },

    '.trigger-container.-select-account': {
      paddingLeft: token.paddingXXS,
      paddingRight: 0,

      '.account-name': {
        maxWidth: 150
      },

      '.ant-select-modal-input-suffix .anticon': {
        fontSize: 12,
        color: token.colorTextLight3
      }
    }
  }
}));

export default Controller;
