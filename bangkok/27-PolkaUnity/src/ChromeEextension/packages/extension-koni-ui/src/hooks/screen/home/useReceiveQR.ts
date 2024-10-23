// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset } from '@subwallet/chain-list/types';
import { MantaPayConfig } from '@subwallet/extension-base/background/KoniTypes';
import { AccountJson } from '@subwallet/extension-base/background/types';
import { _MANTA_ZK_CHAIN_GROUP, _ZK_ASSET_PREFIX } from '@subwallet/extension-base/services/chain-service/constants';
import { _getMultiChainAsset, _isAssetFungibleToken, _isChainEvmCompatible } from '@subwallet/extension-base/services/chain-service/utils';
import { AccountSelectorModalId } from '@subwallet/extension-koni-ui/components/Modal/AccountSelectorModal';
import { RECEIVE_QR_MODAL, RECEIVE_TOKEN_SELECTOR_MODAL, WARNING_LEDGER_RECEIVE_MODAL } from '@subwallet/extension-koni-ui/constants/modal';
import { useConfirmModal, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { useChainAssets } from '@subwallet/extension-koni-ui/hooks/assets';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { findAccountByAddress, isAccountAll as checkIsAccountAll, ledgerMustCheckNetwork } from '@subwallet/extension-koni-ui/utils';
import { findNetworkJsonByGenesisHash } from '@subwallet/extension-koni-ui/utils/chain/getNetworkJsonByGenesisHash';
import { ModalContext, SwModalFuncProps } from '@subwallet/react-ui';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import { isEthereumAddress } from '@polkadot/util-crypto';

type ReceiveSelectedResult = {
  selectedAccount?: string;
  selectedNetwork?: string;
};

// Return array of chain which have token in multi chain asset
const getChainsByTokenGroup = (
  tokenGroupSlug: string,
  assetRegistryMap: Record<string, _ChainAsset>
): string[] => {
  // case tokenGroupSlug is token slug
  if (assetRegistryMap[tokenGroupSlug]) {
    return [assetRegistryMap[tokenGroupSlug].originChain];
  }

  // case tokenGroupSlug is multiChainAsset slug

  const assetRegistryItems: _ChainAsset[] = Object.values(assetRegistryMap)
    .filter((assetItem) => {
      return _isAssetFungibleToken(assetItem) &&
        _getMultiChainAsset(assetItem) === tokenGroupSlug;
    });

  const map: Record<string, boolean> = {};

  for (const assetItem of assetRegistryItems) {
    const chainSlug = assetRegistryMap[assetItem.slug].originChain;

    map[chainSlug] = true;
  }

  return Object.keys(map);
};

function isMantaPayEnabled (account: AccountJson | null, configs: MantaPayConfig[]) {
  for (const config of configs) {
    if (config.address === account?.address) {
      return true;
    }
  }

  return false;
}

const useReceiveQR = (tokenGroupSlug?: string) => {
  const { t } = useTranslation();

  const { activeModal, inactiveModal } = useContext(ModalContext);

  const { accounts, currentAccount, isAllAccount } = useSelector((state: RootState) => state.accountState);
  const assetRegistryMap = useChainAssets().chainAssetRegistry;
  const { chainInfoMap, ledgerGenericAllowNetworks } = useSelector((state: RootState) => state.chainStore);
  const mantaPayConfigs = useSelector((state: RootState) => state.mantaPay.configs);

  const [tokenSelectorItems, setTokenSelectorItems] = useState<_ChainAsset[]>([]);
  const [{ selectedAccount, selectedNetwork }, setReceiveSelectedResult] = useState<ReceiveSelectedResult>(
    { selectedAccount: isAllAccount ? undefined : currentAccount?.address }
  );

  const confirmModalProps = useMemo((): SwModalFuncProps => ({
    id: WARNING_LEDGER_RECEIVE_MODAL,
    title: t<string>('Unsupported network'),
    maskClosable: true,
    closable: true,
    subTitle: t<string>('Do you still want to get the address?'),
    okText: t<string>('Get address'),
    okCancel: true,
    type: 'warn',
    cancelButtonProps: {
      children: t<string>('Cancel'),
      schema: 'secondary'
    },
    className: 'ledger-warning-modal'
  }), [t]);

  const { handleSimpleConfirmModal } = useConfirmModal(confirmModalProps);

  const accountSelectorItems = useMemo<AccountJson[]>(() => {
    if (!isAllAccount) {
      return [];
    }

    if (tokenGroupSlug) {
      const chains = getChainsByTokenGroup(tokenGroupSlug, assetRegistryMap);

      return accounts.filter((account) => {
        const isEvm = isEthereumAddress(account.address);
        const isAll = checkIsAccountAll(account.address);

        if (isAll) {
          return false;
        }

        if (account.isHardware) {
          if (!account.isGeneric) {
            if (!isEvm) {
              const availableGen: string[] = account.availableGenesisHashes || [];
              const networks = availableGen
                .map((gen) => findNetworkJsonByGenesisHash(chainInfoMap, gen)?.slug)
                .filter((slug) => slug) as string[];

              return networks.some((n) => chains.includes(n));
            }
          }
        }

        return chains.some((chain) => {
          const info = chainInfoMap[chain];

          if (info) {
            return isEvm === _isChainEvmCompatible(info);
          } else {
            return false;
          }
        });
      });
    }

    return accounts.filter((a) => !checkIsAccountAll(a.address));
  }, [isAllAccount, tokenGroupSlug, accounts, assetRegistryMap, chainInfoMap]);

  const getTokenSelectorItems = useCallback((_selectedAccount: string) => {
    // if selectedAccount is not available or is ethereum type
    if (!_selectedAccount) {
      return [];
    }

    // if tokenGroupSlug is token slug
    if (tokenGroupSlug && assetRegistryMap[tokenGroupSlug]) {
      return [assetRegistryMap[tokenGroupSlug]];
    }

    const isEvmAddress = isEthereumAddress(_selectedAccount);
    const acc = findAccountByAddress(accounts, _selectedAccount);

    return Object.values(assetRegistryMap).filter((asset) => {
      const availableGen: string[] = acc?.availableGenesisHashes || [];

      if (acc?.isHardware && !acc?.isGeneric && !availableGen.includes(chainInfoMap[asset.originChain].substrateInfo?.genesisHash || '')) {
        return false;
      }

      if (_MANTA_ZK_CHAIN_GROUP.includes(asset.originChain) && asset.symbol.startsWith(_ZK_ASSET_PREFIX)) {
        return isMantaPayEnabled(acc, mantaPayConfigs);
      }

      if (_isAssetFungibleToken(asset)) {
        if (_isChainEvmCompatible(chainInfoMap[asset.originChain]) === isEvmAddress) {
          if (tokenGroupSlug) {
            return _getMultiChainAsset(asset) === tokenGroupSlug;
          }

          return true;
        }
      }

      return false;
    });
  }, [tokenGroupSlug, assetRegistryMap, accounts, chainInfoMap, mantaPayConfigs]);

  const onOpenReceive = useCallback(() => {
    if (!currentAccount) {
      return;
    }

    if (checkIsAccountAll(currentAccount.address)) {
      activeModal(AccountSelectorModalId);
    } else {
      // if currentAccount is ledger type
      if (currentAccount.isHardware) {
        if (!currentAccount.isGeneric) {
          const availableGen: string[] = currentAccount.availableGenesisHashes || [];
          const networks = availableGen
            .map((gen) => findNetworkJsonByGenesisHash(chainInfoMap, gen)?.slug)
            .filter((slug) => slug) as string[];

          if (networks.length === 1) {
            setReceiveSelectedResult((prevState) => ({ ...prevState, selectedNetwork: networks[0] }));
            activeModal(RECEIVE_QR_MODAL);

            return;
          }
        }
      }

      const _tokenSelectorItems = getTokenSelectorItems(currentAccount.address);

      setTokenSelectorItems(_tokenSelectorItems);

      if (tokenGroupSlug) {
        if (_tokenSelectorItems.length === 1) {
          const firstToken = _tokenSelectorItems[0];
          const ledgerCheck = ledgerMustCheckNetwork(currentAccount);

          if (ledgerCheck !== 'unnecessary' && !ledgerGenericAllowNetworks.includes(firstToken.originChain)) {
            handleSimpleConfirmModal({
              content: t<string>(
                'Ledger {{ledgerApp}} accounts are NOT compatible with {{networkName}} network. Tokens will get stuck (i.e., can’t be transferred out or staked) when sent to this account type.',
                {
                  replace: {
                    ledgerApp: ledgerCheck === 'polkadot' ? 'Polkadot' : 'Migration',
                    networkName: chainInfoMap[firstToken.originChain]?.name
                  }
                }
              )
            })
              .then(() => {
                setReceiveSelectedResult((prev) => ({ ...prev, selectedNetwork: _tokenSelectorItems[0].originChain }));
                activeModal(RECEIVE_QR_MODAL);
              })
              .catch(console.error);

            return;
          }

          setReceiveSelectedResult((prev) => ({ ...prev, selectedNetwork: _tokenSelectorItems[0].originChain }));
          activeModal(RECEIVE_QR_MODAL);

          return;
        }
      }

      activeModal(RECEIVE_TOKEN_SELECTOR_MODAL);
    }
  }, [currentAccount, activeModal, getTokenSelectorItems, tokenGroupSlug, chainInfoMap, ledgerGenericAllowNetworks, handleSimpleConfirmModal, t]);

  const openSelectAccount = useCallback((account: AccountJson) => {
    setReceiveSelectedResult({ selectedAccount: account.address });
    const _tokenSelectorItems = getTokenSelectorItems(account.address);

    setTokenSelectorItems(_tokenSelectorItems);

    if (tokenGroupSlug) {
      if (_tokenSelectorItems.length === 1) {
        const first = _tokenSelectorItems[0];
        const ledgerCheck = ledgerMustCheckNetwork(account);

        if (ledgerCheck !== 'unnecessary' && !ledgerGenericAllowNetworks.includes(first.originChain)) {
          handleSimpleConfirmModal({
            content: t<string>(
              'Ledger {{ledgerApp}} accounts are NOT compatible with {{networkName}} network. Tokens will get stuck (i.e., can’t be transferred out or staked) when sent to this account type.',
              {
                replace: {
                  ledgerApp: ledgerCheck === 'polkadot' ? 'Polkadot' : 'Migration',
                  networkName: chainInfoMap[first.originChain]?.name
                }
              }
            )
          })
            .then(() => {
              setReceiveSelectedResult((prev) => ({ ...prev, selectedNetwork: _tokenSelectorItems[0].originChain }));
              activeModal(RECEIVE_QR_MODAL);
              inactiveModal(AccountSelectorModalId);
            })
            .catch(console.error);

          return;
        }

        setReceiveSelectedResult((prev) => ({ ...prev, selectedNetwork: _tokenSelectorItems[0].originChain }));
        activeModal(RECEIVE_QR_MODAL);
        inactiveModal(AccountSelectorModalId);

        return;
      }
    }

    activeModal(RECEIVE_TOKEN_SELECTOR_MODAL);
    inactiveModal(AccountSelectorModalId);
  }, [activeModal, chainInfoMap, getTokenSelectorItems, handleSimpleConfirmModal, inactiveModal, ledgerGenericAllowNetworks, t, tokenGroupSlug]);

  const openSelectToken = useCallback((item: _ChainAsset) => {
    setReceiveSelectedResult((prevState) => ({ ...prevState, selectedNetwork: item.originChain }));
  }, []);

  useEffect(() => {
    setReceiveSelectedResult((prev) => ({
      ...prev,
      selectedAccount: currentAccount?.address
    }));
  }, [currentAccount?.address]);

  return {
    onOpenReceive,
    openSelectAccount,
    openSelectToken,
    selectedAccount,
    accountSelectorItems,
    tokenSelectorItems,
    selectedNetwork
  };
};

export default useReceiveQR;
