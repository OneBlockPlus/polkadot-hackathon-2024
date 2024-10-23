// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import ChainItemFooter from '@subwallet/extension-web-ui/components/ChainItemFooter';
import { ChainInfoWithStateAndStatus } from '@subwallet/extension-web-ui/hooks/chain/useChainInfoWithStateAndStatus';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { NetworkItem } from '@subwallet/react-ui';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = ThemeProps & {
  chainInfo: ChainInfoWithStateAndStatus;
  isShowSubLogo?: boolean;
  withDivider?: boolean;
  showDetailNavigation?: boolean;
}

const Component: React.FC<Props> = (props: Props) => {
  const { chainInfo, className, isShowSubLogo = false, showDetailNavigation = false, withDivider = false } = props;
  const navigate = useNavigate();
  const connectSymbol = `__${chainInfo.connectionStatus}__`;

  return (
    <NetworkItem
      className={className}
      dividerPadding={56}
      isShowSubLogo={isShowSubLogo}
      key={chainInfo.slug}
      name={chainInfo.name}
      networkKey={chainInfo.slug}
      networkMainLogoSize={36}
      rightItem={(
        <ChainItemFooter
          chainInfo={chainInfo}
          className={'__toggle-area'}
          navigate={navigate}
          showDetailNavigation={showDetailNavigation}
        />
      )}
      subSymbol={connectSymbol}
      withDivider={withDivider}
    />
  );
};

const NetworkToggleItem = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-web3-block': {
      cursor: 'default',
      padding: `${token.padding - 2}px ${token.paddingSM}px ${token.paddingXS - 2}px`,

      '.ant-web3-block-right-item': {
        marginRight: `-${token.padding + 2}px`
      }
    },

    '.ant-logo': {
      marginRight: token.marginXXS
    },

    '.-sub-logo .ant-image-img': {
      width: `${token.size}px !important`,
      height: `${token.size}px !important`
    },

    '.manage_tokens__right_item_container': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    '.ant-divider': {
      borderBlockStartColor: token.colorBgDivider
    }
  };
});

export default NetworkToggleItem;
