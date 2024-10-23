// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AccountJson } from '@subwallet/extension-base/background/types';
import { isAccountAll } from '@subwallet/extension-base/utils';
import { BasicInputWrapper } from '@subwallet/extension-koni-ui/components/Field/Base';
import { useFormatAddress, useSelectModalInputHelper, useSelector, useTranslation } from '@subwallet/extension-koni-ui/hooks';
import { ThemeProps } from '@subwallet/extension-koni-ui/types';
import { funcSortByName, reformatAddress, toShort } from '@subwallet/extension-koni-ui/utils';
import { InputRef, SelectModal } from '@subwallet/react-ui';
import React, { ForwardedRef, forwardRef, useCallback, useMemo } from 'react';
import styled from 'styled-components';

import { isEthereumAddress } from '@polkadot/util-crypto';

import { AccountItemWithName } from '../Account';
import { Avatar } from '../Avatar';
import { GeneralEmptyList } from '../EmptyList';

interface Props extends ThemeProps, BasicInputWrapper {
  externalAccounts?: AccountJson[];
  filter?: (account: AccountJson) => boolean;
  doFilter?: boolean;
  addressPrefix?: number;
}

const renderEmpty = () => <GeneralEmptyList />;

function defaultFiler (account: AccountJson): boolean {
  return !isAccountAll(account.address);
}

const Component = (props: Props, ref: ForwardedRef<InputRef>): React.ReactElement<Props> => {
  const { addressPrefix, className = '', disabled, doFilter = true, externalAccounts, filter, id = 'account-selector', label, placeholder, readOnly, statusHelp, value } = props;
  const accounts = useSelector((state) => state.accountState.accounts);

  const items = useMemo(() => {
    let _items = (externalAccounts || accounts);

    if (doFilter) {
      _items = _items.filter(filter || defaultFiler);
    }

    return _items.sort(funcSortByName);
  }, [accounts, doFilter, externalAccounts, filter]);

  const { t } = useTranslation();
  const { onSelect } = useSelectModalInputHelper(props, ref);

  const formatAddress = useFormatAddress(addressPrefix);

  const renderSelected = useCallback((item: AccountJson) => {
    const address = formatAddress(item);

    return (
      <div className={'__selected-item'}>
        <div className={'__selected-item-name common-text'}>
          {item.name}
        </div>

        <div className={'__selected-item-address common-text'}>
        ({toShort(address, 4, 4)})
        </div>
      </div>
    );
  }, [formatAddress]);

  const searchFunction = useCallback((item: AccountJson, searchText: string) => {
    const searchTextLowerCase = searchText.toLowerCase();
    const formatAddress = reformatAddress(item.address, addressPrefix);

    return (
      formatAddress.toLowerCase().includes(searchTextLowerCase) ||
      (item.name
        ? item.name.toLowerCase().includes(searchTextLowerCase)
        : false)
    );
  }, [addressPrefix]);

  const renderItem = useCallback((item: AccountJson, selected: boolean) => {
    const address = formatAddress(item);

    return (
      <AccountItemWithName
        accountName={item.name}
        address={address}
        avatarSize={24}
        identPrefix={addressPrefix}
        isSelected={selected}
      />
    );
  }, [addressPrefix, formatAddress]);

  return (
    <>
      <SelectModal
        className={`${className} account-selector-modal`}
        disabled={disabled || readOnly}
        id={id}
        inputClassName={`${className} account-selector-input`}
        itemKey={'address'}
        items={items}
        label={label}
        onSelect={onSelect}
        placeholder={placeholder || t('Select account')}
        prefix={
          <Avatar
            identPrefix={addressPrefix}
            size={20}
            theme={value ? isEthereumAddress(value) ? 'ethereum' : 'polkadot' : undefined}
            value={value}
          />
        }
        renderItem={renderItem}
        renderSelected={renderSelected}
        renderWhenEmpty={renderEmpty}
        searchFunction={searchFunction}
        searchMinCharactersCount={1}
        searchPlaceholder={t<string>('Account name')}
        selected={value || ''}
        statusHelp={statusHelp}
        title={label || placeholder || t('Select account')}
      />
    </>
  );
};

export const AccountSelector = styled(forwardRef(Component))<Props>(({ theme: { token } }: Props) => {
  return ({
    '&.account-selector-input': {
      '.__selected-item': {
        display: 'flex',
        color: token.colorTextLight1,
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      },
      '.__selected-item-name': {
        textOverflow: 'ellipsis',
        fontWeight: token.headingFontWeight,
        overflow: 'hidden'
      },
      '.__selected-item-address': {
        color: token.colorTextLight4,
        paddingLeft: token.sizeXXS
      }
    }
  });
});
