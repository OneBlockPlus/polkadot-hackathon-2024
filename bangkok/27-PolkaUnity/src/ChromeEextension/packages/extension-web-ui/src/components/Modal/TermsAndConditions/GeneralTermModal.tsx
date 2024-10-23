// [object Object]
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line header/header
import { fetchStaticData } from '@subwallet/extension-base/utils/fetchStaticData';
import { BaseModal } from '@subwallet/extension-web-ui/components';
import { GENERAL_TERM_AND_CONDITION_MODAL } from '@subwallet/extension-web-ui/constants';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import useTranslation from '@subwallet/extension-web-ui/hooks/common/useTranslation';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { Button, Checkbox, Icon, ModalContext, Typography } from '@subwallet/react-ui';
import { CheckboxChangeEvent } from '@subwallet/react-ui/es/checkbox';
import CN from 'classnames';
import { ArrowCircleRight, CaretDown } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import Markdown from 'react-markdown';
import styled from 'styled-components';

interface Props extends ThemeProps {
  onOk: () => void
}

const modalId = GENERAL_TERM_AND_CONDITION_MODAL;

interface StaticDataInterface {
  md: string,
}

const Component = ({ className, onOk }: Props) => {
  const { inactiveModal } = useContext(ModalContext);
  const { t } = useTranslation();
  const { isWebUI } = useContext(ScreenContext);
  const [staticData, setStaticData] = useState({} as StaticDataInterface);
  const [isChecked, setIsChecked] = useState(false);
  const [isScrollEnd, setIsScrollEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStaticData('term-and-condition', 'index.md')
      .then((md) => setStaticData({ md: md as string }))
      .catch((e) => console.log('fetch _termAndCondition error:', e));
  }, []);

  const onCheckedInput = useCallback((e: CheckboxChangeEvent) => {
    setIsChecked(e.target.checked);
  }, []);

  const onScrollToAcceptButton = useCallback(() => {
    if (!scrollRef?.current) {
      return;
    }

    setIsScrollEnd(scrollRef.current.scrollTop >= scrollRef.current.scrollHeight - 500);
  }, []);

  const onScrollContent = useCallback(() => {
    scrollRef?.current?.scroll({ top: scrollRef?.current?.scrollHeight, left: 0 });
  }, [scrollRef]);

  const onConfirm = useCallback(() => {
    inactiveModal(modalId);
    onOk();
  }, [inactiveModal, onOk]);

  return (
    <BaseModal
      center={true}
      className={CN(className, {
        '-desktop-term': isWebUI
      })}
      closable={false}
      id={modalId}
      title={t('Terms of Use')}
      width={ isWebUI ? 784 : undefined }
    >
      <div
        className={'term-body'}
        onScroll={onScrollToAcceptButton}
        ref={scrollRef}
      >
        <Typography.Text>
          <Markdown>{staticData && staticData.md}</Markdown>
        </Typography.Text>
        {!isScrollEnd && <Button
          className={'term-body-caret-button'}
          icon={<Icon phosphorIcon={CaretDown} />}
          onClick={onScrollContent}
          schema={'secondary'}
          shape={'circle'}
          size={'xs'}
        />}
      </div>
      <div className={'term-footer'}>
        <Checkbox
          checked={isChecked}
          className={'term-footer-checkbox'}
          onChange={onCheckedInput}
        >{t('I understand and agree to the Terms of Use, which apply to my use of SubWallet and all of its feature')}</Checkbox>
        <div className={'term-footer-button-group'}>
          <Button
            block={true}
            className={'term-footer-button'}
            disabled={!isChecked || !isScrollEnd}
            icon={ (
              <Icon
                phosphorIcon={ArrowCircleRight}
                weight='fill'
              />
            )}
            onClick={onConfirm}
          >
            {t('Continue')}
          </Button>
          <span className={'term-footer-annotation'}>{t('Scroll to read all sections')}</span>
        </div>

      </div>
    </BaseModal>
  );
};

export const GeneralTermModal = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return {
    '.ant-sw-modal-content': {
      overflow: 'hidden',
      maxHeight: 600,
      paddingBottom: 0
    },

    '.term-body': {
      maxHeight: 294,
      h3: {
        color: token.colorWhite,
        fontSize: token.fontSize,
        gap: token.margin
      },
      'p, li': {
        color: token.colorTextLight4,
        fontSize: token.fontSizeSM
      },

      display: 'block',
      overflowY: 'scroll',
      scrollBehavior: 'smooth'

    },

    '.term-body-caret-button': {
      position: 'absolute',
      top: '60%',
      right: '5%'
    },

    '.term-footer': {
      display: 'flex',
      alignItems: 'center',
      flexDirection: 'column',
      marginTop: token.marginXS,
      gap: token.margin

    },

    '.term-footer-checkbox': {
      alignItems: 'center',
      alignSelf: 'flex-start'
    },

    '.term-footer-button-group': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingLeft: token.padding,
      paddingRight: token.padding,
      width: 390,
      height: 80,
      justifyContent: 'space-between'

    },

    '.term-footer-annotation': {
      color: token.colorTextLight4,
      fontSize: token.fontSizeSM
    },

    '&.-desktop-term .ant-sw-modal-content': {
      maxHeight: 746,
      width: '100%',

      '.term-body': {
        maxHeight: 496
      },

      '.term-body-caret-button': {
        top: '75%'
      },

      '.ant-sw-modal-body': {
        padding: '16px 24px'
      }

    }

  };
});
