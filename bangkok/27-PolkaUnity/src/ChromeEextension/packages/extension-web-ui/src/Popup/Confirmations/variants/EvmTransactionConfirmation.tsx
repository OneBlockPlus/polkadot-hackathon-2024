// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationsQueueItem, EvmSendTransactionRequest } from '@subwallet/extension-base/background/KoniTypes';
import { ConfirmationGeneralInfo, MetaInfo, ViewDetailIcon } from '@subwallet/extension-web-ui/components';
import { useGetAccountByAddress, useGetChainInfoByChainId, useOpenDetailModal } from '@subwallet/extension-web-ui/hooks';
import { EvmSignatureSupportType, ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button } from '@subwallet/react-ui';
import BigN from 'bignumber.js';
import CN from 'classnames';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { BaseDetailModal, EvmSignArea, EvmTransactionDetail } from '../parts';

interface Props extends ThemeProps {
  type: EvmSignatureSupportType
  request: ConfirmationsQueueItem<EvmSendTransactionRequest>
}

const convertToBigN = (num: EvmSendTransactionRequest['value']): string | number | undefined => {
  if (typeof num === 'object') {
    return num.toNumber();
  } else {
    return num;
  }
};

function Component ({ className, request, type }: Props) {
  const { id, payload: { account, chainId, to } } = request;
  const { t } = useTranslation();
  const chainInfo = useGetChainInfoByChainId(chainId);
  const recipientAddress = to;
  const recipient = useGetAccountByAddress(recipientAddress);
  const onClickDetail = useOpenDetailModal();

  const amount = useMemo((): number => {
    return new BigN(convertToBigN(request.payload.value) || 0).toNumber();
  }, [request.payload.value]);

  return (
    <>
      <div className={CN('confirmation-content', className)}>
        <ConfirmationGeneralInfo request={request} />
        <div className='title'>
          {t('Transaction request')}
        </div>
        <MetaInfo>
          {
            (!request.payload.isToContract || amount !== 0) &&
            (
              <MetaInfo.Number
                decimals={chainInfo?.evmInfo?.decimals}
                label={t('Amount')}
                suffix={chainInfo?.evmInfo?.symbol}
                value={amount}
              />
            )
          }
          <MetaInfo.Account
            address={account.address}
            label={t('From account')}
            name={account.name}
          />
          <MetaInfo.Account
            address={recipient?.address || recipientAddress || ''}
            className='to-account'
            label={request.payload.isToContract ? t('To contract') : t('To account')}
            name={recipient?.name}
          />
          {request.payload.estimateGas &&
              <MetaInfo.Number
                decimals={chainInfo?.evmInfo?.decimals}
                label={t('Estimated gas')}
                suffix={chainInfo?.evmInfo?.symbol}
                value={request.payload.estimateGas || '0'}
              />}
        </MetaInfo>
        <div>
          <Button
            icon={<ViewDetailIcon />}
            onClick={onClickDetail}
            size='xs'
            type='ghost'
          >
            {t('View details')}
          </Button>
        </div>
      </div>
      <EvmSignArea
        id={id}
        payload={request}
        type={type}
      />
      <BaseDetailModal
        title={t('Transaction details')}
      >
        <EvmTransactionDetail
          account={account}
          request={request.payload}
        />
      </BaseDetailModal>
    </>
  );
}

const EvmTransactionConfirmation = styled(Component)<Props>(({ theme: { token } }: ThemeProps) => ({
  '.account-list': {
    '.__prop-label': {
      marginRight: token.marginMD,
      width: '50%',
      float: 'left'
    }
  },

  '.to-account': {
    marginTop: token.margin - 2
  },

  '.__label': {
    textAlign: 'left'
  }
}));

export default EvmTransactionConfirmation;
