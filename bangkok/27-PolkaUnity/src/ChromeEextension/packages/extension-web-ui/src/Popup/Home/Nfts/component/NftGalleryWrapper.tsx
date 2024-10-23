// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { DEFAULT_MODEL_VIEWER_PROPS } from '@subwallet/extension-web-ui/constants';
import { Theme, ThemeProps } from '@subwallet/extension-web-ui/types';
import { ActivityIndicator, NftItem as NftItem_ } from '@subwallet/react-ui';
import React, { useCallback, useState } from 'react';
// @ts-ignore
import { LazyLoadComponent, LazyLoadImage } from 'react-lazy-load-image-component';
import styled, { useTheme } from 'styled-components';

interface Props extends ThemeProps {
  title: string;
  image: string | undefined;
  fallbackImage?: string | undefined;
  itemCount?: number;
  handleOnClick?: (params?: any) => void;
  routingParams?: any;
  have3dViewer?: boolean;
}

function Component ({ className = '', fallbackImage, handleOnClick, have3dViewer, image, itemCount, routingParams, title }: Props): React.ReactElement<Props> {
  const { extendToken } = useTheme() as Theme;

  const [showImage, setShowImage] = useState(true);
  const [showVideo, setShowVideo] = useState(false);
  const [show3dViewer, setShow3dViewer] = useState(false);

  const onClick = useCallback(() => {
    handleOnClick && handleOnClick(routingParams);
  }, [handleOnClick, routingParams]);

  const handleImageError = useCallback(() => {
    setShowImage(false);
    setShowVideo(true);
  }, []);

  const handleVideoError = useCallback(() => {
    setShowVideo(false);
    setShow3dViewer(true);
  }, []);

  const getCollectionImage = useCallback(() => {
    if (image) {
      return image;
    } else if (fallbackImage) {
      return fallbackImage;
    }

    return extendToken.defaultImagePlaceholder;
  }, [extendToken.defaultImagePlaceholder, fallbackImage, image]);

  const loadingPlaceholder = useCallback(() => {
    return (
      <div className={'nft_gallery_wrapper__loading'}>
        <ActivityIndicator
          existIcon={true}
          prefixCls={''}
        />
      </div>
    );
  }, []);

  const getCollectionImageNode = useCallback(() => {
    if (showImage) {
      return (
        <LazyLoadImage
          delayTime={10000}
          height={'100%'}
          onError={handleImageError}
          placeholder={loadingPlaceholder()}
          src={getCollectionImage()}
          width={'100%'}
        />
      );
    }

    if (showVideo) {
      return (
        <LazyLoadComponent>
          <video
            autoPlay
            height={'100%'}
            loop={true}
            muted
            onError={handleVideoError}
            width={'100%'}
          >
            <source
              src={getCollectionImage()}
              type='video/mp4'
            />
          </video>
        </LazyLoadComponent>
      );
    }

    if (have3dViewer && show3dViewer) {
      return (
        <LazyLoadComponent>
          {/* @ts-ignore */}
          <model-viewer
            alt={'model-viewer'}
            ar-status={'not-presenting'}
            auto-rotate={true}
            auto-rotate-delay={100}
            bounds={'tight'}
            disable-pan={true}
            disable-scroll={true}
            disable-tap={true}
            disable-zoom={true}
            environment-image={'neutral'}
            interaction-prompt={'none'}
            loading={'eager'}
            src={getCollectionImage()}
            style={{ width: '100%', height: '100%' }}
            touch-action={'none'}
            {...DEFAULT_MODEL_VIEWER_PROPS}
          />
        </LazyLoadComponent>
      );
    }

    return (
      <LazyLoadImage
        src={extendToken.defaultImagePlaceholder}
        visibleByDefault={true}
      />
    );
  }, [showImage, showVideo, have3dViewer, show3dViewer, extendToken.defaultImagePlaceholder, handleImageError, loadingPlaceholder, getCollectionImage, handleVideoError]);

  return (
    <NftItem_
      className={`nft_gallery_wrapper ${className}`}
      count={itemCount}
      customImageNode={getCollectionImageNode()}
      onClick={onClick}
      title={title}
    />
  );
}

export const NftGalleryWrapper = styled(Component)<Props>(({ theme: { token } }: Props) => {
  return ({
    color: token.colorTextLight1,
    fontSize: token.fontSizeLG,

    '.__image-wrapper': {
      overflow: 'hidden'
    },

    '.nft_gallery_wrapper__loading': {
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }
  });
});
