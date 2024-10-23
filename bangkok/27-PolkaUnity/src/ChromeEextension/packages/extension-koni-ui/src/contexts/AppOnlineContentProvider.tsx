// Copyright 2019-2022 @subwallet/extension-koni-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { AppBannerData, AppConfirmationData, AppPopupData } from '@subwallet/extension-base/services/mkt-campaign-service/types';
import { AppPopupModalContext, AppPopupModalInfo } from '@subwallet/extension-koni-ui/contexts/AppPopupModalContext';
import { useGetAppInstructionData } from '@subwallet/extension-koni-ui/hooks/static-content/useGetAppInstructionData';
import { useHandleAppBannerMap } from '@subwallet/extension-koni-ui/hooks/static-content/useHandleAppBannerMap';
import { useHandleAppConfirmationMap } from '@subwallet/extension-koni-ui/hooks/static-content/useHandleAppConfirmationMap';
import { useHandleAppPopupMap } from '@subwallet/extension-koni-ui/hooks/static-content/useHandleAppPopupMap';
import { RootState } from '@subwallet/extension-koni-ui/stores';
import { EarningPoolsParam, EarningPositionDetailParam } from '@subwallet/extension-koni-ui/types';
import { MktCampaignHistoryData, OnlineContentDataType, PopupFrequency } from '@subwallet/extension-koni-ui/types/staticContent';
import { openInNewTab } from '@subwallet/extension-koni-ui/utils';
import React, { useCallback, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import urlParse from 'url-parse';

interface AppOnlineContentContextProviderProps {
  children?: React.ReactElement;
}

interface AppOnlineContentContextType {
  appPopupMap: Record<string, AppPopupData[]>;
  appBannerMap: Record<string, AppBannerData[]>;
  appConfirmationMap: Record<string, AppConfirmationData[]>;
  popupHistoryMap: Record<string, MktCampaignHistoryData>;
  bannerHistoryMap: Record<string, MktCampaignHistoryData>;
  confirmationHistoryMap: Record<string, MktCampaignHistoryData>;
  updatePopupHistoryMap: (id: string) => void;
  updateBannerHistoryMap: (ids: string[]) => void;
  updateConfirmationHistoryMap: (id: string) => void;
  checkPopupVisibleByFrequency: (
    repeat: PopupFrequency,
    lastShowTime: number,
    showTimes: number,
    customizeRepeatTime: number | null,
  ) => boolean;
  handleButtonClick: (id: string) => (type: OnlineContentDataType, url?: string) => void;
  checkBannerVisible: (showTimes: number) => boolean;
  checkPositionParam: (screen: string, positionParams: { property: string; value: string }[], value: string) => boolean;
  showAppPopup: (currentRoute: string | undefined) => void;
}

const TIME_MILLI = {
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000
};

export const AppOnlineContentContext = React.createContext({} as AppOnlineContentContextType);

const getPositionByRouteName = (currentRoute?: string) => {
  if (!currentRoute) {
    return '';
  }

  switch (currentRoute) {
    case '/home/nfts/collections':
      return 'nft';
    case '/home/earning':
      return 'earning';
    case '/home/crowdloans':
      return 'crowdloan';
    case '/':
    default:
      return 'token';
  }
};

export const AppOnlineContentContextProvider = ({ children }: AppOnlineContentContextProviderProps) => {
  const appPopupModalContext = useContext(AppPopupModalContext);
  const language = useSelector((state: RootState) => state.settings.language);
  const { getAppInstructionData } = useGetAppInstructionData(language);
  const navigate = useNavigate();

  const { bannerHistoryMap,
    confirmationHistoryMap,
    popupHistoryMap } = useSelector((state: RootState) => state.staticContent);

  // check popup frequency
  const checkPopupVisibleByFrequency = useCallback(
    (repeat: PopupFrequency, lastShowTime: number, showTimes: number, customizeRepeatTime: number | null) => {
      if (customizeRepeatTime) {
        return Date.now() - lastShowTime > customizeRepeatTime * 86400000;
      } else {
        if (repeat) {
          switch (repeat) {
            case 'once':
              return showTimes < 1;
            case 'daily':
              return Date.now() - lastShowTime > TIME_MILLI.DAY;
            case 'weekly':
              return Date.now() - lastShowTime > TIME_MILLI.WEEK;
            case 'monthly':
              return Date.now() - lastShowTime > TIME_MILLI.MONTH;
            case 'every_time':
              return true;
          }
        } else {
          return Date.now() - lastShowTime > TIME_MILLI.DAY;
        }
      }
    },
    []
  );

  // check banner hidden
  const checkBannerVisible = useCallback((showTimes: number) => {
    return showTimes === 0;
  }, []);

  const checkPositionParam = useCallback(
    (screen: string, positionParams: { property: string; value: string }[], value: string) => {
      if (positionParams && positionParams.length) {
        if (screen === 'token_detail') {
          const allowTokenSlugs = positionParams
            .filter((item) => item.property === 'tokenSlug')
            .map((param) => param.value);

          return allowTokenSlugs.some((slug) => value.toLowerCase().includes(slug.toLowerCase()));
        } else if (screen === 'earning') {
          const allowPoolSlugs = positionParams.filter((item) => item.property === 'poolSlug').map((param) => param.value);

          return allowPoolSlugs.some((slug) => value.toLowerCase().includes(slug.toLowerCase()));
        } else {
          return true;
        }
      } else {
        return true;
      }
    },
    []
  );

  const { appPopupMap, updatePopupHistoryMap } = useHandleAppPopupMap();
  const { appBannerMap, updateBannerHistoryMap } = useHandleAppBannerMap();
  const { appConfirmationMap, updateConfirmationHistoryMap } = useHandleAppConfirmationMap();

  useEffect(() => {
    getAppInstructionData();
  }, [getAppInstructionData]);

  const handleButtonClick = useCallback(
    (id: string) => {
      return (type: OnlineContentDataType, url?: string) => {
        if (type === 'popup') {
          updatePopupHistoryMap(id);
        } else if (type === 'confirmation') {
          updateConfirmationHistoryMap(id);
        }

        if (url) {
          // eslint-disable-next-line new-cap
          const parseUrl = new urlParse(url);
          const urlQuery = parseUrl.query.substring(1);
          const urlQueryMap: Record<string, string> = {};

          urlQuery.split('&').forEach((item) => {
            const splitItem = item.split('=');

            urlQueryMap[splitItem[0]] = splitItem[1];
          });

          if (url.startsWith('subwallet://')) {
            if (parseUrl.pathname.startsWith('/main/nfts/collection')) {
              navigate('/home/nfts/collections');
            }

            if (parseUrl.pathname.startsWith('/main/crowdloans')) {
              navigate('/home/crowdloans');
            }

            if (parseUrl.pathname.startsWith('/main/earning')) {
              navigate('/home/earning');
            }

            if (parseUrl.pathname.startsWith('/main/earning/earning-position-detail')) {
              navigate('/home/earning/position-detail', { state: {
                earningSlug: urlQueryMap.slug
              } as EarningPositionDetailParam });
            }

            if (parseUrl.pathname.startsWith('/main/earning/earning-pool-list')) {
              navigate('/home/earning/pools', { state: {
                poolGroup: urlQueryMap.group,
                symbol: urlQueryMap.symbol
              } as EarningPoolsParam });
            }
          } else {
            openInNewTab(url)();
          }
        }
      };
    },
    [navigate, updateConfirmationHistoryMap, updatePopupHistoryMap]
  );

  const showAppPopup = useCallback(
    (currentRoute: string | undefined) => {
      const currentTransformRoute = getPositionByRouteName(currentRoute) || '';
      const currentPopupList = appPopupMap[currentTransformRoute];

      if (currentPopupList && currentPopupList.length) {
        const filteredPopupList = currentPopupList.filter((item) => {
          const popupHistory = popupHistoryMap[`${item.position}-${item.id}`];

          if (popupHistory) {
            return checkPopupVisibleByFrequency(
              item.repeat,
              popupHistory.lastShowTime,
              popupHistory.showTimes,
              item.repeat_every_x_days
            );
          } else {
            return false;
          }
        }).sort((a, b) => a.priority - b.priority);

        if (filteredPopupList && filteredPopupList.length) {
          const result: AppPopupModalInfo[] = filteredPopupList.map((item) => ({
            type: 'popup',
            repeat: item.repeat,
            title: item.info?.name,
            message: item.content || '',
            buttons: item.buttons,
            onPressBtn: (url?: string) => {
              handleButtonClick(`${item.position}-${item.id}`)('popup', url);
            }
          }));

          appPopupModalContext.openAppPopupModal(result[0]);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [appPopupMap, checkPopupVisibleByFrequency, handleButtonClick, popupHistoryMap]
  );

  return (
    <AppOnlineContentContext.Provider
      value={{
        appPopupMap,
        appBannerMap,
        appConfirmationMap,
        popupHistoryMap,
        bannerHistoryMap,
        confirmationHistoryMap,
        updatePopupHistoryMap,
        updateBannerHistoryMap,
        updateConfirmationHistoryMap,
        checkPopupVisibleByFrequency,
        handleButtonClick,
        checkBannerVisible,
        checkPositionParam,
        showAppPopup
      }}
    >
      {children}
    </AppOnlineContentContext.Provider>
  );
};
