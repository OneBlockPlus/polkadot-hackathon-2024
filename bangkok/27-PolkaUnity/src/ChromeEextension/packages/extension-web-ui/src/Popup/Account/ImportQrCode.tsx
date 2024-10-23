// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { detectTranslate } from '@subwallet/extension-base/utils';
import DefaultLogosMap, { IconMap } from '@subwallet/extension-web-ui/assets/logo';
import { Layout, PageWrapper } from '@subwallet/extension-web-ui/components';
import CloseIcon from '@subwallet/extension-web-ui/components/Icon/CloseIcon';
import DualLogo from '@subwallet/extension-web-ui/components/Logo/DualLogo';
import QrScannerErrorNotice from '@subwallet/extension-web-ui/components/Qr/Scanner/ErrorNotice';
import { IMPORT_ACCOUNT_MODAL } from '@subwallet/extension-web-ui/constants/modal';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import useCompleteCreateAccount from '@subwallet/extension-web-ui/hooks/account/useCompleteCreateAccount';
import useGetDefaultAccountName from '@subwallet/extension-web-ui/hooks/account/useGetDefaultAccountName';
import useGoBackFromCreateAccount from '@subwallet/extension-web-ui/hooks/account/useGoBackFromCreateAccount';
import useUnlockChecker from '@subwallet/extension-web-ui/hooks/common/useUnlockChecker';
import useScanAccountQr from '@subwallet/extension-web-ui/hooks/qr/useScanAccountQr';
import useAutoNavigateToCreatePassword from '@subwallet/extension-web-ui/hooks/router/useAutoNavigateToCreatePassword';
import useDefaultNavigate from '@subwallet/extension-web-ui/hooks/router/useDefaultNavigate';
import { checkPublicAndPrivateKey, createAccountWithSecret } from '@subwallet/extension-web-ui/messaging';
import { ThemeProps, ValidateState } from '@subwallet/extension-web-ui/types';
import { QrAccount } from '@subwallet/extension-web-ui/types/scanner';
import { importQrScan } from '@subwallet/extension-web-ui/utils/scanner/attach';
import { Button, Icon, Image, ModalContext, SwQrScanner } from '@subwallet/react-ui';
import CN from 'classnames';
import { QrCode, Scan, XCircle } from 'phosphor-react';
import React, { useCallback, useContext, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

type Props = ThemeProps

const FooterIcon = (
  <Icon
    phosphorIcon={QrCode}
    weight='fill'
  />
);

const checkAccount = (qrAccount: QrAccount): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    checkPublicAndPrivateKey(qrAccount.genesisHash, qrAccount.content)
      .then(({ isEthereum, isValid }) => {
        if (isValid) {
          resolve(isEthereum);
        } else {
          reject(new Error('Invalid QR code'));
        }
      })
      .catch((e: Error) => {
        reject(e);
      });
  });
};

const modalId = 'import-qr-code-scanner-modal';

const Component: React.FC<Props> = (props: Props) => {
  useAutoNavigateToCreatePassword();

  const { className } = props;
  const { t } = useTranslation();
  const { goHome } = useDefaultNavigate();

  const accountName = useGetDefaultAccountName();
  const onComplete = useCompleteCreateAccount();
  const onBack = useGoBackFromCreateAccount(IMPORT_ACCOUNT_MODAL);
  const checkUnlock = useUnlockChecker();

  const { inactiveModal } = useContext(ModalContext);
  const { isWebUI } = useContext(ScreenContext);

  const [validateState, setValidateState] = useState<ValidateState>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = useCallback((_account: QrAccount) => {
    setLoading(true);
    inactiveModal(modalId);
    setValidateState({
      message: '',
      status: 'success'
    });

    setTimeout(() => {
      checkAccount(_account)
        .then((isEthereum) => {
          createAccountWithSecret({ name: accountName,
            isAllow: true,
            secretKey: _account.content,
            publicKey: _account.genesisHash,
            isEthereum: isEthereum })
            .then(({ errors, success }) => {
              if (success) {
                setValidateState({});
                onComplete();
              } else {
                setValidateState({
                  message: errors[0].message,
                  status: 'error'
                });
              }
            })
            .catch((error: Error) => {
              setValidateState({
                message: error.message,
                status: 'error'
              });
            })
            .finally(() => {
              setLoading(false);
            });
        })
        .catch((error: Error) => {
          setValidateState({
            message: t(error.message),
            status: 'error'
          });
          setLoading(false);
        });
    }, 300);
  }, [accountName, onComplete, inactiveModal, t]);

  const { onClose, onError, onSuccess, openCamera } = useScanAccountQr(modalId, importQrScan, setValidateState, onSubmit);

  const onScan = useCallback(() => {
    checkUnlock().then(() => {
      setTimeout(() => {
        openCamera();
      }, 300);
    }).catch(() => {
      // User cancelled unlock
    });
  }, [checkUnlock, openCamera]);

  const buttonProps = {
    children: loading ? t('Creating') : t('Scan the QR code'),
    icon: FooterIcon,
    onClick: onScan,
    loading: loading
  };

  return (
    <PageWrapper className={CN(className)}>
      <Layout.WithSubHeaderOnly
        onBack={onBack}
        rightFooterButton={!isWebUI
          ? {
            children: loading ? t('Creating') : t('Scan QR'),
            icon: FooterIcon,
            onClick: openCamera,
            loading: loading
          }
          : undefined}
        subHeaderIcons={[
          {
            icon: <CloseIcon />,
            onClick: goHome
          }
        ]}
        title={t('Import by QR code')}
      >
        <div className={CN('container', {
          '__web-ui': isWebUI
        })}
        >
          <div className='sub-title'>
            {t("Make sure that you have granted SubWallet the access to your device's camera")}
          </div>
          <div className='logo'>
            <DualLogo
              leftLogo={(
                <Image
                  height={56}
                  shape='squircle'
                  src={DefaultLogosMap.subwallet}
                  width={56}
                />
              )}
              linkIcon={(
                <Icon
                  phosphorIcon={Scan}
                  size='md'
                />
              )}
              rightLogo={(
                <Image
                  height={56}
                  shape='squircle'
                  src={IconMap.__qr_code__}
                  width={56}
                />
              )}
            />
          </div>
          <div className='instruction'>
            <div className='instruction'>
              <Trans
                components={{
                  highlight: (
                    <a
                      className='link'
                      href='https://docs.subwallet.app/main/extension-user-guide/account-management/import-and-restore-an-account#import-by-qr-code'
                      rel='noopener noreferrer'
                      target='_blank'
                    />
                  )
                }}
                i18nKey={detectTranslate('Click the "Scan QR" button, or read <highlight>this instruction</highlight>, for more details')}
              />
            </div>
          </div>
          {
            validateState.message && (
              <div className='error-container'>
                <Icon
                  customSize='28px'
                  phosphorIcon={XCircle}
                  weight='fill'
                />
                <span className='error-content'>{validateState.message}</span>
              </div>
            )
          }
          <SwQrScanner
            className={className}
            id={modalId}
            isError={!!validateState.status}
            onClose={onClose}
            onError={onError}
            onSuccess={onSuccess}
            overlay={validateState.message && (<QrScannerErrorNotice message={validateState.message} />)}
            selectCameraMotion={isWebUI ? 'move-right' : undefined}
            title={t('Scan QR')}
          />
          {isWebUI && (
            <Button
              {...buttonProps}
              className='action'
            />
          )}
        </div>
      </Layout.WithSubHeaderOnly>
    </PageWrapper>
  );
};

const ImportQrCode = styled(Component)<Props>(({ theme: { extendToken, token } }: Props) => {
  return {
    '.__web-ui': {
      width: extendToken.oneColumnWidth,
      maxWidth: '100%',
      margin: '0 auto'
    },
    '.container': {
      padding: token.padding,

      '& .ant-btn': {
        width: '100%',
        marginTop: 36
      }
    },

    '.sub-title': {
      padding: `0 ${token.padding}px`,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      color: token.colorTextDescription,
      textAlign: 'center'
    },

    '.logo': {
      margin: `${token.controlHeightLG}px 0`,
      '--logo-size': token.controlHeightLG + token.controlHeightXS
    },

    '.instruction': {
      padding: `0 ${token.padding}px`,
      marginBottom: token.margin,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6,
      color: token.colorTextDescription,
      textAlign: 'center'
    },

    '.link': {
      color: token.colorLink,
      textDecoration: 'underline'
    },

    '.error-container': {
      color: token.colorError,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: token.marginXXL - 2,
      justifyContent: 'center'
    },

    '.error-content': {
      marginLeft: token.marginXS,
      fontSize: token.fontSizeHeading6,
      lineHeight: token.lineHeightHeading6
    }
  };
});

export default ImportQrCode;
