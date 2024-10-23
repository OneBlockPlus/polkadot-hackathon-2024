// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ChainLogoMap } from '@subwallet/chain-list';
import { ConfirmationDefinitions, ConfirmationResult } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationGeneralInfo } from '@subwallet/extension-web-ui/components';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { useCopy } from '@subwallet/extension-web-ui/hooks';
import { completeConfirmation } from '@subwallet/extension-web-ui/messaging';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { detectThemeAvatar, toShort } from '@subwallet/extension-web-ui/utils';
import { ActivityIndicator, Button, Col, Field, Icon, Image, Row } from '@subwallet/react-ui';
import SwAvatar from '@subwallet/react-ui/es/sw-avatar';
import CN from 'classnames';
import { CheckCircle, CopySimple, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps {
  request: ConfirmationDefinitions['addTokenRequest'][0];
}

const handleConfirm = async ({ id }: ConfirmationDefinitions['addTokenRequest'][0]) => {
  return await completeConfirmation('addTokenRequest', { id, isApproved: true } as ConfirmationResult<boolean>);
};

const handleCancel = async ({ id }: ConfirmationDefinitions['addTokenRequest'][0]) => {
  return await completeConfirmation('addTokenRequest', { id, isApproved: false } as ConfirmationResult<boolean>);
};

const Component: React.FC<Props> = (props: Props) => {
  const { className, request } = props;
  const { isWebUI } = useContext(ScreenContext);
  const { payload: { contractAddress, contractError, decimals, name, originChain, slug, symbol, type, validated } } = request;

  const { chainInfoMap } = useSelector((state: RootState) => state.chainStore);

  const { t } = useTranslation();

  const { token } = useTheme() as Theme;

  const [loading, setLoading] = useState(false);

  const onCancel = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      handleCancel(request).finally(() => {
        setLoading(false);
      });
    }, 300);
  }, [request]);

  const onApprove = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      handleConfirm(request).finally(() => {
        setLoading(false);
      });
    }, 300);
  }, [request]);

  const onCopy = useCopy(contractAddress);

  const contractSuffix = useMemo(() => {
    if (!validated) {
      return <ActivityIndicator size={token.sizeMD} />;
    }

    return (
      <Button
        className='copy-btn'
        icon={(
          <Icon
            phosphorIcon={CopySimple}
            type='phosphor'
          />
        )}
        onClick={onCopy}
        size='xs'
        type='ghost'
      />
    );
  }, [validated, onCopy, token]);

  return (
    <>
      <div className={CN(className, 'confirmation-content')}>
        <ConfirmationGeneralInfo request={request} />
        <Field
          content={chainInfoMap[originChain].name}
          label={t<string>('Network')}
          prefix={(
            <Image
              height={token.fontSizeXL}
              shape={'circle'}
              src={ChainLogoMap[originChain]}
              width={token.fontSizeXL}
            />
          )}
        />
        <Field
          content={type}
          tooltip={isWebUI ? t<string>('Token type') : undefined}
        />
        <Field
          content={toShort(contractAddress)}
          label={t<string>('Contract address')}
          prefix={
            <SwAvatar
              identPrefix={42}
              size={token.fontSizeXL}
              theme={detectThemeAvatar(contractAddress)}
              value={contractAddress}
            />
          }
          status={contractError ? 'error' : slug ? 'warning' : ''}
          statusHelp={contractError ? t('The token contract is invalid.') : slug ? t('The token already exists.') : ''}
          suffix={contractSuffix}
        />
        <Row gutter={token.margin}>
          <Col span={12}>
            <Field
              content={symbol}
              placeholder={t<string>('Symbol')}
              prefix={
                <SwAvatar
                  identPrefix={42}
                  size={token.fontSizeXL}
                  theme={detectThemeAvatar(contractAddress)}
                  value={contractAddress}
                />
              }
              tooltip={isWebUI ? t<string>('Symbol') : undefined}
              tooltipPlacement='topLeft'
            />
          </Col>
          <Col span={12}>
            <Field
              content={decimals === -1 ? '' : decimals}
              placeholder={t<string>('Decimals')}
              tooltip={isWebUI ? t<string>('Decimals') : undefined}
              tooltipPlacement='topLeft'
            />
          </Col>
        </Row>
        <Field
          content={name}
          tooltip={t<string>('Token name')}
        />
      </div>
      <div className='confirmation-footer'>
        <Button
          disabled={loading}
          icon={(
            <Icon
              phosphorIcon={XCircle}
              weight='fill'
            />
          )}
          onClick={onCancel}
          schema={'secondary'}
        >
          {t('Cancel')}
        </Button>
        <Button
          disabled={!!slug || !validated || contractError}
          icon={(
            <Icon
              phosphorIcon={CheckCircle}
              weight='fill'
            />
          )}
          loading={loading}
          onClick={onApprove}
        >
          {t('Approve')}
        </Button>
      </div>
    </>
  );
};

const AddTokenConfirmation = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '--content-gap': `${token.size}px`,

    '.ant-field-container': {
      textAlign: 'left',
      overflow: 'unset'
    },

    '.copy-btn': {
      height: 'auto'
    }
  };
});

export default AddTokenConfirmation;
