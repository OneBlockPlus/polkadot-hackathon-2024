// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { LanguageType } from '@subwallet/extension-base/background/KoniTypes';
import { MISSIONS_POOL_LIVE_ID } from '@subwallet/extension-web-ui/constants';
import { ScreenContext } from '@subwallet/extension-web-ui/contexts/ScreenContext';
import { HeaderType, WebUIContext } from '@subwallet/extension-web-ui/contexts/WebUIContext';
import { useDefaultNavigate, useSelector } from '@subwallet/extension-web-ui/hooks';
import { RootState } from '@subwallet/extension-web-ui/stores';
import { ThemeProps } from '@subwallet/extension-web-ui/types';
import { computeStatus } from '@subwallet/extension-web-ui/utils';
import { Icon, SwScreenLayout, SwScreenLayoutProps } from '@subwallet/react-ui';
import { SwTabBarItem } from '@subwallet/react-ui/es/sw-tab-bar';
import CN from 'classnames';
import { Aperture, Clock, Globe, Parachute, Rocket, Vault, Wallet } from 'phosphor-react';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLocalStorage } from 'usehooks-ts';

import Footer from '../parts/Footer';
import SelectAccount from '../parts/SelectAccount';

export interface LayoutBaseProps extends Omit<
SwScreenLayoutProps,
'tabBarItems' | 'headerContent' | 'selectedTabBarItem'
>, ThemeProps {
  children: React.ReactNode | React.ReactNode[];
  showFooter?: boolean;
  isSetTitleContext?: boolean;
}
type TabBarItem = Omit<SwTabBarItem, 'onClick'> & { url: string };
const specialLanguages: Array<LanguageType> = ['ja', 'ru'];

const Component = ({ children, className, footer, headerIcons, isSetTitleContext = true, onBack, showFooter, ...props }: LayoutBaseProps) => {
  const { isWebUI } = useContext(ScreenContext);
  const navigate = useNavigate();
  const { goHome } = useDefaultNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const { setTitle } = useContext(WebUIContext);
  const { headerType, isSettingPage, setOnBack, setShowBackButtonOnHeader } = useContext(WebUIContext);
  const [customClassName, setCustomClassName] = useState('');
  const { language } = useSelector((state) => state.settings);
  const { missions } = useSelector((state: RootState) => state.missionPool);

  const [storedLiveMissionIds, setStoredLiveMissionIds] = useLocalStorage<number[]>(MISSIONS_POOL_LIVE_ID, []);

  const liveMissionIds = useMemo(() => {
    return missions
      .filter((item) => computeStatus(item) === 'live')
      .map((mission) => mission.id);
  }, [missions]);

  const latestLiveMissionIds = useMemo(() => {
    return liveMissionIds.filter((id) => !storedLiveMissionIds.includes(id));
  }, [liveMissionIds, storedLiveMissionIds]);

  const tabBarItems = useMemo((): Array<Omit<SwTabBarItem, 'onClick'> & { url: string }> => ([
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: Wallet,
        weight: 'fill'
      },
      label: t('Tokens'),
      key: 'tokens',
      url: '/home/tokens'
    },
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: Aperture,
        weight: 'fill'
      },
      label: t('NFTs'),
      key: 'nfts',
      url: '/home/nfts/collections'
    },
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: Vault,
        weight: 'fill'
      },
      label: t('Earning'),
      key: 'earning',
      url: '/home/earning'
    },
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: Globe,
        weight: 'fill'
      },
      label: t('DApps'),
      key: 'dapps',
      url: '/home/dapps'
    },
    {
      icon: {
        type: 'customIcon',
        customIcon: (
          <>
            <Icon
              phosphorIcon={Parachute}
              type='phosphor'
              weight='fill'
            />
            {(latestLiveMissionIds.length > 0) && <div className={CN('__active-count')}>{latestLiveMissionIds.length}</div>}
          </>
        )
      },
      label: t('Missions'),
      key: 'mission-pools',
      url: '/home/mission-pools'
    },
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: Rocket,
        weight: 'fill'
      },
      label: t('Crowdloans'),
      key: 'crowdloans',
      url: '/home/crowdloans'
    },
    {
      icon: {
        type: 'phosphor',
        phosphorIcon: Clock,
        weight: 'fill'
      },
      label: t('History'),
      key: 'history',
      url: '/home/history'
    }
  ]), [latestLiveMissionIds.length, t]);

  const selectedTab = useMemo((): string => {
    const isHomePath = pathname.includes('/home');

    if (isHomePath) {
      const pathExcludeHome = pathname.split('/home')[1];
      const currentTab = pathExcludeHome.split('/')[1];

      return currentTab || '';
    }

    return '';
  }, [pathname]);

  const onSelectTab = useCallback(
    (item: TabBarItem) => () => {
      if (item.key === 'mission-pools' && latestLiveMissionIds.length > 0) {
        setStoredLiveMissionIds(liveMissionIds);
      }

      navigate(item.url);
    },
    [latestLiveMissionIds.length, navigate, setStoredLiveMissionIds, liveMissionIds]
  );

  const defaultOnBack = useCallback(() => {
    goHome();
  }, [goHome]);

  useEffect(() => {
    setCustomClassName('common-pages');

    if (isSetTitleContext) {
      setTitle(props.title);
    }
  }, [isSetTitleContext, isSettingPage, pathname, props.title, setTitle, t]);

  useEffect(() => {
    setShowBackButtonOnHeader(props.showBackButton);

    return () => {
      setShowBackButtonOnHeader(undefined);
    };
  }, [props.showBackButton, setShowBackButtonOnHeader]);

  useEffect(() => {
    setOnBack(onBack);

    return () => {
      setOnBack(undefined);
    };
  }, [onBack, setOnBack]);

  return (
    <SwScreenLayout
      {...props}
      className={CN(className, customClassName, { 'special-language': specialLanguages.includes(language) })}
      footer={showFooter && (footer || <Footer />)}
      headerContent={props.showHeader && <SelectAccount />}
      headerIcons={headerIcons}
      onBack={onBack || defaultOnBack}
      selectedTabBarItem={selectedTab}
      showHeader={(!isWebUI || headerType === HeaderType.NONE) && props.showHeader}
      showSubHeader={(!isWebUI || headerType === HeaderType.NONE || (isSettingPage && headerType !== HeaderType.SIMPLE)) && props.showSubHeader}
      showTabBar={!isWebUI && props.showTabBar}
      tabBarItems={tabBarItems.map((item) => ({
        ...item,
        onClick: onSelectTab(item)
      }))}
    >
      {children}
    </SwScreenLayout>
  );
};

const Base = styled(Component)<LayoutBaseProps>(({ theme: { token } }: LayoutBaseProps) => ({
  '.ant-sw-tab-bar-container': {
    'white-space': 'nowrap',
    overflowX: 'auto',

    padding: `${token.paddingXS}px ${token.paddingSM}px ${token.paddingSM}px`,
    alignItems: 'flex-start',

    '.ant-sw-tab-bar-item': {
      paddingLeft: token.paddingXS,
      paddingRight: token.paddingXS
    },

    '.ant-sw-tab-bar-item-label': {
      textAlign: 'center'
    }
  },
  '.ant-sw-tab-bar-item-icon': {
    position: 'relative'
  },
  '.__active-count': {
    borderRadius: '50%',
    color: token.colorWhite,
    fontSize: token.sizeXS,
    fontWeight: token.bodyFontWeight,
    lineHeight: token.lineHeightLG,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: token.colorError,
    position: 'absolute',
    right: -2,
    top: -1,
    minWidth: '12px'
  },

  '&.special-language': {
    '.ant-sw-tab-bar-container': {
      paddingBottom: token.paddingXS,

      '.ant-sw-tab-bar-item': {
        gap: token.sizeXXS,

        '.ant-sw-tab-bar-item-label': {
          fontSize: token.fontSizeXS,
          lineHeight: 1,
          maxWidth: token.sizeXXL,
          overflowWrap: 'break-word'
        }
      }
    }
  },

  '@media (max-width: 600px)': {
    '.ant-sw-tab-bar-item': {
      paddingBottom: token.sizeXS,
      paddingTop: token.sizeXS
    },

    '.ant-sw-tab-bar-item-label': {
      display: 'none'
    }
  }
}));

export default Base;
