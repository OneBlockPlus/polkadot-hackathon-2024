// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { _MANTA_ZK_CHAIN_GROUP, _ZK_ASSET_PREFIX } from '@subwallet/extension-base/services/chain-service/constants';
import { BaseModal } from '@subwallet/extension-web-ui/components/Modal/BaseModal';
import { TokenSelectionItem } from '@subwallet/extension-web-ui/components/TokenItem/TokenSelectionItem';
import { RECEIVE_QR_MODAL, RECEIVE_TOKEN_SELECTOR_MODAL } from '@subwallet/extension-web-ui/constants/modal';
import { useSelector } from '@subwallet/extension-web-ui/hooks';
import { useGetZkAddress } from '@subwallet/extension-web-ui/hooks/account/useGetZkAddress';
import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { ModalContext, SwList } from '@subwallet/react-ui';
import { SwListSectionRef } from '@subwallet/react-ui/es/sw-list';
import React, { useCallback, useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';

import { TokenEmptyList } from '../../EmptyList';

interface Props extends ThemeProps {
  onSelectItem?: (item: _ChainAsset) => void,
  address?: string,
  items: _ChainAsset[]
}

const modalId = RECEIVE_TOKEN_SELECTOR_MODAL;

const renderEmpty = () => <TokenEmptyList modalId={modalId} />;

function Component ({ address, className = '', items, onSelectItem }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { activeModal, checkActive, inactiveModal } = useContext(ModalContext);

  const zkAddress = useGetZkAddress(address);

  const { chainInfoMap } = useSelector((state) => state.chainStore);

  const isActive = checkActive(modalId);

  const sectionRef = useRef<SwListSectionRef>(null);

  const searchFunction = useCallback((item: _ChainAsset, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();
    const chainName = chainInfoMap[item.originChain]?.name?.toLowerCase();
    const symbol = item.symbol.toLowerCase();

    return (
      symbol.includes(searchTextLowerCase) ||
      chainName.includes(searchTextLowerCase)
    );
  }, [chainInfoMap]);

  const onCancel = useCallback(() => {
    inactiveModal(modalId);
  }, [inactiveModal]);

  const onClickQrBtn = useCallback((item: _ChainAsset) => {
    return () => {
      onSelectItem && onSelectItem(item);
      // checkAsset(item.slug);
      inactiveModal(modalId);
      activeModal(RECEIVE_QR_MODAL);
    };
  }, [activeModal, inactiveModal, onSelectItem]);

  useEffect(() => {
    if (!isActive) {
      setTimeout(() => {
        sectionRef.current?.setSearchValue('');
      }, 100);
    }
  }, [isActive]);

  const renderItem = useCallback((item: _ChainAsset) => {
    const isMantaZkAsset = _MANTA_ZK_CHAIN_GROUP.includes(item.originChain) && item.symbol.startsWith(_ZK_ASSET_PREFIX);

    return (
      <TokenSelectionItem
        address={isMantaZkAsset ? zkAddress : address}
        className={'token-selector-item'}
        item={item}
        key={item.slug}
        onClickQrBtn={onClickQrBtn(item)}
        onPressItem={onClickQrBtn(item)}
      />
    );
  }, [address, onClickQrBtn, zkAddress]);

  return (
    <BaseModal
      className={`${className} chain-selector-modal`}
      fullSizeOnMobile
      id={modalId}
      onCancel={onCancel}
      title={t('Select token')}
    >
      <SwList.Section
        enableSearchInput={true}
        list={items}
        ref={sectionRef}
        renderItem={renderItem}
        renderWhenEmpty={renderEmpty}
        searchFunction={searchFunction}
        searchMinCharactersCount={2}
        searchPlaceholder={t<string>('Search token')}
      />
    </BaseModal>
  );
}

export const TokensSelectorModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    '.ant-sw-modal-content': {
      minHeight: 474
    },

    '.ant-sw-list-search-input': {
      paddingBottom: token.paddingXS
    },

    '.ant-sw-modal-body': {
      paddingLeft: 0,
      paddingRight: 0,
      paddingBottom: token.padding,
      marginBottom: 0,
      display: 'flex'
    },

    '.ant-sw-list-section': {
      flex: 1
    },

    '.ant-sw-list-section .ant-sw-list': {
      paddingBottom: 0
    },

    '.token-selector-item + .token-selector-item': {
      marginTop: token.marginXS
    }
  });
});
